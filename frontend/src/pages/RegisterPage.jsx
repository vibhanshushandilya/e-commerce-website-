import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', password2: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Registration failed.' });
    }
    setLoading(false);
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div style={{ minHeight: '100vh', background: '#eaeded', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={box}>
        <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>🛒 Create Account</h1>
        {errors.detail && <div style={errBox}>{errors.detail}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={label}>First Name</label>
              <input {...f('first_name')} style={input} />
            </div>
            <div>
              <label style={label}>Last Name</label>
              <input {...f('last_name')} style={input} />
            </div>
          </div>
          <label style={label}>Username *</label>
          <input {...f('username')} style={input} required />
          {errors.username && <small style={{ color: 'red' }}>{errors.username}</small>}
          <label style={label}>Email *</label>
          <input type="email" {...f('email')} style={input} required />
          <label style={label}>Password *</label>
          <input type="password" {...f('password')} style={input} required />
          {errors.password && <small style={{ color: 'red' }}>{errors.password}</small>}
          <label style={label}>Confirm Password *</label>
          <input type="password" {...f('password2')} style={input} required />
          <button type="submit" disabled={loading} style={btn}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p style={{ fontSize: '13px', marginTop: '16px', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#007bff' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const box = { background: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' };
const label = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', marginTop: '12px' };
const input = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' };
const btn = { width: '100%', padding: '11px', background: '#ff9900', border: 'none', borderRadius: '24px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '20px' };
const errBox = { background: '#fff3f3', border: '1px solid #f0c0c0', padding: '10px 14px', borderRadius: '4px', color: '#B12704', fontSize: '14px', marginBottom: '12px' };
