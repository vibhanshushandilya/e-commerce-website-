import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.items.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <div style={{ fontSize: '64px' }}>🛒</div>
      <h2>Your cart is empty</h2>
      <Link to="/products" style={{ background: '#ff9900', color: '#131921', padding: '12px 32px', borderRadius: '24px', textDecoration: 'none', fontWeight: 'bold' }}>
        Continue Shopping
      </Link>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '24px' }}>Shopping Cart ({cart.count} items)</h1>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Cart items */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {cart.items.map(item => (
            <div key={item.product_id} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid #eee', alignItems: 'flex-start' }}>
              <div style={{ width: '100px', height: '100px', background: '#f7f7f7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '32px' }}>📦</span>}
              </div>
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.product_id}`} style={{ fontWeight: 'bold', fontSize: '15px', textDecoration: 'none', color: '#0066c0' }}>
                  {item.name}
                </Link>
                <p style={{ color: '#B12704', fontWeight: 'bold', fontSize: '18px', margin: '8px 0' }}>₹{item.price.toLocaleString('en-IN')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)} style={qBtn}>−</button>
                    <span style={{ padding: '0 14px', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)} disabled={item.quantity >= item.stock} style={qBtn}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product_id)} style={{ color: '#B12704', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                    Delete
                  </button>
                </div>
              </div>
              <p style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>₹{item.subtotal.toLocaleString('en-IN')}</p>
            </div>
          ))}
          <button onClick={clearCart} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', fontSize: '13px' }}>
            🗑️ Clear cart
          </button>
        </div>

        {/* Summary */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px' }}>
              <span>Subtotal ({cart.count} items)</span>
              <span>₹{cart.total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#888' }}>
              <span>Shipping</span>
              <span style={{ color: '#007600' }}>FREE</span>
            </div>
            <hr />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>
              <span>Total</span>
              <span>₹{cart.total.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={() => navigate(user ? '/checkout' : '/login')} style={{ width: '100%', padding: '12px', background: '#ff9900', border: 'none', borderRadius: '24px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
              {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const qBtn = { background: '#f0f0f0', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '15px' };
