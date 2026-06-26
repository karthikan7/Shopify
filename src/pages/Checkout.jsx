import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

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

  const inputStyle = {
    padding: '12px',
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none'
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert('Your cart is empty');

    // Check if Razorpay key is configured
    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert('Razorpay key is not configured. Please check your .env file.');
      return;
    }

    setLoading(true);

    try {
      const orderRes = await fetch('http://localhost:5000/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.message || 'Could not initiate payment');
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopNest',
        description: 'Order Payment',
        order_id: orderData.id,
        handler: async (response) => {
          const verifyRes = await fetch('http://localhost:5000/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            const items = cartItems.map(item => ({
              productId: item.productId,
              qty: item.qty,
              price: item.price
            }));

            const orderRes2 = await fetch('http://localhost:5000/order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                items,
                totalAmount,
                address,
                paymentId: response.razorpay_payment_id
              })
            });

            if (orderRes2.ok) {
              dispatch(clearCart());
              navigate('/ordersuccess');
            } else {
              alert('Payment verified but order saving failed. Contact support.');
            }
          } else {
            alert('Payment verification failed');
          }
          setLoading(false);
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong during checkout');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', background: '#18181b', padding: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>Checkout</h2>

      <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text" placeholder="Full Name" required style={inputStyle}
          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
        />
        <input
          type="text" placeholder="Street Address" required style={inputStyle}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
        />
        <input
          type="text" placeholder="City" required style={inputStyle}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
        />
        <input
          type="text" placeholder="Postal Code" required style={inputStyle}
          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
        />
        <input
          type="text" placeholder="Country" required style={inputStyle}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
        />

        <div style={{ background: '#09090b', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
          <h3 style={{ color: '#fff' }}>Total: ₹{totalAmount.toFixed(2)}</h3>
        </div>

        <button type="submit" className="btn" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

export default Checkout;