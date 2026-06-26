import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalUsers: 0, totalRevenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('https://shopify-backend-b7cn.onrender.com/analytics', {
          credentials: 'include'
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  if (!user || user.role !== 'admin') {
    return <div style={{ textAlign: 'center', margin: '100px', color: '#ef4444' }}>Access Denied</div>;
  }

  const cardStyle = {
    background: '#18181b',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    flex: '1',
    minWidth: '200px'
  };

  const linkCardStyle = {
    display: 'block',
    background: '#18181b',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#f97316',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: '600'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ color: '#f97316', marginBottom: '25px' }}>Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <div style={cardStyle}>
          <p style={{ color: '#a1a1aa', marginBottom: '8px' }}>Total Orders</p>
          <h3 style={{ color: '#fff', fontSize: '2rem' }}>{stats.totalOrders}</h3>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#a1a1aa', marginBottom: '8px' }}>Total Products</p>
          <h3 style={{ color: '#fff', fontSize: '2rem' }}>{stats.totalProducts}</h3>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#a1a1aa', marginBottom: '8px' }}>Total Users</p>
          <h3 style={{ color: '#fff', fontSize: '2rem' }}>{stats.totalUsers}</h3>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#a1a1aa', marginBottom: '8px' }}>Total Revenue</p>
          <h3 style={{ color: '#10b981', fontSize: '2rem' }}>₹{stats.totalRevenue.toFixed(2)}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <Link to="/admin/products" style={linkCardStyle}>Manage Products</Link>
        <Link to="/admin/add-product" style={linkCardStyle}>Add Product</Link>
        <Link to="/admin/orders" style={linkCardStyle}>Manage Orders</Link>
        <Link to="/admin/users" style={linkCardStyle}>User Directory</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;