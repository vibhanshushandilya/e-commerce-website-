import { useEffect, useState } from 'react';
import api from '../api/axios';

const initialState = {
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    api.get('profile/')
      .then(({ data }) => {
        if (!active) return;
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          country: data.country || 'India',
        });
      })
      .catch(() => setMessage('Unable to load profile.'))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.patch('profile/', profile);
      setMessage('Profile updated successfully.');
    } catch {
      setMessage('Profile update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '16px' }}>My Account</h1>
      {message && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: message.includes('success') ? '#e8f5e9' : '#fff4f4', color: message.includes('success') ? '#2e7d32' : '#b42318' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <Field label="First name"><input name="first_name" value={profile.first_name} onChange={handleChange} style={inputStyle} /></Field>
          <Field label="Last name"><input name="last_name" value={profile.last_name} onChange={handleChange} style={inputStyle} /></Field>
          <Field label="Phone"><input name="phone" value={profile.phone} onChange={handleChange} style={inputStyle} /></Field>
          <Field label="Country"><input name="country" value={profile.country} onChange={handleChange} style={inputStyle} /></Field>
          <Field label="City"><input name="city" value={profile.city} onChange={handleChange} style={inputStyle} /></Field>
          <Field label="State"><input name="state" value={profile.state} onChange={handleChange} style={inputStyle} /></Field>
          <Field label="Pincode"><input name="pincode" value={profile.pincode} onChange={handleChange} style={inputStyle} /></Field>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Address</label>
          <textarea name="address" value={profile.address} onChange={handleChange} rows="4" style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} />
        </div>

        <button type="submit" disabled={saving} style={{ marginTop: '20px', background: '#ff9900', color: '#131921', border: 'none', borderRadius: '20px', padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer' }}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d5d9d9', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' };
