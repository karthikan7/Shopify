import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:5000/order/getmyorders', {
          credentials: 'include'
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const containerStyle = {
    maxWidth: '700px',
    margin: '50px auto',
    padding: '40px',
    background: '#18181b',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  };

  const badgeStyle = {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b'
  };

  const statusColors = {
    Pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    Shipped: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
    Delivered: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }
  };

  const orderCardStyle = {
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '10px',
    padding: '18px 20px',
    marginBottom: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>My Profile</h2>
      <div style={rowStyle}>
        <span style={{ color: '#a1a1aa' }}>Name</span>
        <span style={{ color: '#fff' }}>{user.name}</span>
      </div>
      <div style={rowStyle}>
        <span style={{ color: '#a1a1aa' }}>Email</span>
        <span style={{ color: '#fff' }}>{user.email}</span>
      </div>
      <div style={{ ...rowStyle, borderBottom: 'none' }}>
        <span style={{ color: '#a1a1aa' }}>Account Type</span>
        <span style={badgeStyle}>{user.role.toUpperCase()}</span>
      </div>

      <h3 style={{ color: '#f97316', marginTop: '35px', marginBottom: '18px' }}>Order History</h3>

      {loading ? (
        <p style={{ color: '#a1a1aa' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#a1a1aa' }}>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => {
          const statusStyle = statusColors[order.status] || statusColors.Pending;
          return (
            <div key={order._id} style={orderCardStyle}>
              <div>
                <p style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '6px' }}>
                  Order ID: <span style={{ color: '#a1a1aa' }}>{order._id}</span>
                </p>
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '4px' }}>
                  Placed On: {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                  Total: ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  background: statusStyle.bg,
                  color: statusStyle.color
                }}
              >
                {order.status}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Profile;