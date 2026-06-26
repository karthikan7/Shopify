import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const BACKEND_URL = 'https://shopify-backend-b7cn.onrender.com';

const Checkout = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });
  const [loading, setLoading] = useState(false);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (!user) {
    navigate('/login');
    return null;
  }

  // ✅ ADD TIMEOUT FUNCTION
  const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!address.fullName || !address.street || !address.city || !address.postalCode || !address.country) {
      alert('Please fill all address fields');
      return;
    }

    setLoading(true);

    try {
      console.log('Step 1: Creating Razorpay order...');
      
      // ✅ WITH TIMEOUT
      const orderRes = await fetchWithTimeout(
        `${BACKEND_URL}/payment/order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount })
        },
        15000  // 15 second timeout
      );

      if (!orderRes.ok) {
        throw new Error(`HTTP error! status: ${orderRes.status}`);
      }

      const orderData = await orderRes.json();
      console.log('Step 2: Order created:', orderData.id);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopNest',
        description: 'Order Payment',
        order_id: orderData.id,
        handler: async (response) => {
          try {
            console.log('Step 3: Verifying payment...');
            
            // ✅ WITH TIMEOUT
            const verifyRes = await fetchWithTimeout(
              `${BACKEND_URL}/payment/verify`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              },
              15000
            );

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed');
            }

            console.log('Step 4: Saving order to database...');
            
            // ✅ WITH TIMEOUT
            const saveRes = await fetchWithTimeout(
              `${BACKEND_URL}/order`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  items: cartItems.map(item => ({
                    productId: item.productId,
                    qty: item.qty,
                    price: item.price
                  })),
                  totalAmount,
                  address,
                  paymentId: response.razorpay_payment_id
                })
              },
              15000
            );

            if (saveRes.ok) {
              console.log('✅ Order saved successfully');
              dispatch(clearCart());
              navigate('/ordersuccess');
            } else {
              alert('Payment verified but order saving failed');
            }
          } catch (error) {
            console.error('Payment handler error:', error);
            alert('Error processing payment: ' + error.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setLoading(false);
          }
        }
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px',
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none'
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', background: '#18181b', padding: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>Checkout</h2>

      <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Full Name"
          required
          value={address.fullName}
          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Street Address"
          required
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="City"
          required
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Postal Code"
          required
          value={address.postalCode}
          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Country"
          required
          value={address.country}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          style={inputStyle}
        />

        <div style={{ background: '#09090b', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
          <h3 style={{ color: '#fff' }}>Total: ₹{totalAmount.toFixed(2)}</h3>
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ marginTop: '10px' }}
        >
          {loading ? 'Processing... (Please wait, Render may be slow)' : `Pay ₹${totalAmount.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

export default Checkout;