import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EditProduct = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', stock: ''
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`https://shopify-backend-b7cn.onrender.com/products/${id}`);
        const data = await res.json();
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          stock: data.stock
        });
        setCurrentImage(data.imageUrl);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    if (image) data.append('image', image);

    try {
      const res = await fetch(`https://shopify-backend-b7cn.onrender.com/products/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: data
      });

      const responseData = await res.json();

      if (res.ok) {
        alert('Product updated successfully!');
        navigate('/admin/products');
      } else {
        alert(responseData.message || 'Error updating product');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating product');
    } finally {
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

  if (fetching) {
    return <div style={{ textAlign: 'center', margin: '100px', color: '#f97316' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', background: '#18181b', padding: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>Edit Product</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Product Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={inputStyle}
        />
        <textarea
          placeholder="Description"
          required
          rows="4"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Price"
          required
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Category"
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Stock Quantity"
          required
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          style={inputStyle}
        />

        <div style={{ padding: '15px', border: '1px dashed #f97316', borderRadius: '8px' }}>
          <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa' }}>
            Replace Image (Optional)
          </label>
          {currentImage && (
            <img src={currentImage} alt="current" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            style={{ color: '#fff' }}
          />
        </div>

        <button type="submit" disabled={loading} className="btn" style={{ marginTop: '10px' }}>
          {loading ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;