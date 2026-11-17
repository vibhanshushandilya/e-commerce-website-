import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#eaeded', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={box}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🛒 Sign In</h1>
        {error && <div style={errBox}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={label}>Username</label>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={input} required />
          <label style={label}>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={input} required />
          <button type="submit" disabled={loading} style={btn}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p style={{ fontSize: '13px', marginTop: '16px', textAlign: 'center' }}>
          New user? <Link to="/register" style={{ color: '#007bff' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}

const box = { background: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' };
const label = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', marginTop: '12px' };
const input = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' };
const btn = { width: '100%', padding: '11px', background: '#ff9900', border: 'none', borderRadius: '24px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '20px' };
const errBox = { background: '#fff3f3', border: '1px solid #f0c0c0', padding: '10px 14px', borderRadius: '4px', color: '#B12704', fontSize: '14px', marginBottom: '12px' };
