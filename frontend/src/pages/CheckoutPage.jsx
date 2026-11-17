import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '', payment_method: 'cod' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('orders/', form);
      await fetchCart();
      navigate(`/orders/${data.id}?success=1`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Order failed. Please try again.');
    }
    setLoading(false);
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
      <h1>Checkout</h1>
      {error && <div style={errBox}>{error}</div>}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: '280px' }}>
          <SectionBox title="📦 Delivery Address">
            <label style={label}>Full Name *</label>
            <input {...f('name')} style={input} required />
            <label style={label}>Phone *</label>
            <input {...f('phone')} style={input} required type="tel" />
            <label style={label}>Address *</label>
            <textarea {...f('address')} style={{ ...input, height: '72px', resize: 'vertical' }} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={label}>City *</label>
                <input {...f('city')} style={input} required />
              </div>
              <div>
                <label style={label}>State *</label>
                <input {...f('state')} style={input} required />
              </div>
            </div>
            <label style={label}>Pincode *</label>
            <input {...f('pincode')} style={input} required maxLength={6} />
          </SectionBox>

          <SectionBox title="💳 Payment Method">
            {[['cod', '💵 Cash on Delivery'], ['upi', '📱 UPI'], ['card', '💳 Credit / Debit Card'], ['netbank', '🏦 Net Banking']].map(([val, lbl]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                <input type="radio" name="payment" value={val} checked={form.payment_method === val} onChange={() => setForm({ ...form, payment_method: val })} />
                {lbl}
              </label>
            ))}
          </SectionBox>

          <button type="submit" disabled={loading} style={btn}>{loading ? 'Placing Order...' : '🛒 Place Order'}</button>
        </form>

        {/* Order Summary */}
        <div style={{ width: '260px', flexShrink: 0 }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px' }}>Order Summary</h3>
            {cart.items.map(item => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ flex: 1, marginRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name} ×{item.quantity}</span>
                <span>₹{item.subtotal.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <hr />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
              <span>Total</span>
              <span>₹{cart.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBox({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>{title}</h3>
      {children}
    </div>
  );
}

const label = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', marginTop: '12px' };
const input = { width: '100%', padding: '9px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' };
const btn = { width: '100%', padding: '13px', background: '#ff9900', border: 'none', borderRadius: '24px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '8px' };
const errBox = { background: '#fff3f3', border: '1px solid #f0c0c0', padding: '10px 14px', borderRadius: '4px', color: '#B12704', fontSize: '14px', marginBottom: '12px' };
