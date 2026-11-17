import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = product.discount_percent;

  return (
    <div style={card}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ height: '200px', background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
          {product.image
            ? <img src={`http://127.0.0.1:8000${product.image}`} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            : <span style={{ fontSize: '48px' }}>📦</span>}
        </div>
        <div style={{ padding: '12px' }}>
          {product.is_prime && <span style={primeBadge}>✦ prime</span>}
          {product.is_bestseller && <span style={bestsellerBadge}>Best Seller</span>}
          <p style={{ fontSize: '14px', margin: '6px 0', lineHeight: '1.4', height: '40px', overflow: 'hidden', color: '#0f1111' }}>{product.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ color: '#B12704', fontWeight: 'bold', fontSize: '18px' }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
            {product.original_price && (
              <span style={{ color: '#888', textDecoration: 'line-through', fontSize: '13px' }}>₹{Number(product.original_price).toLocaleString('en-IN')}</span>
            )}
            {discount > 0 && <span style={{ color: '#B12704', fontSize: '13px' }}>({discount}% off)</span>}
          </div>
          <div style={{ color: '#FF9900', fontSize: '13px', margin: '4px 0' }}>
            {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
            <span style={{ color: '#888', marginLeft: '4px' }}>({product.review_count})</span>
          </div>
          {product.brand_name && <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>by {product.brand_name}</p>}
        </div>
      </Link>
      <div style={{ padding: '0 12px 12px' }}>
        <button onClick={() => addToCart(product.id)} style={addBtn}>Add to Cart</button>
      </div>
    </div>
  );
}

const card = {
  background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'box-shadow 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column',
};
const primeBadge = { background: '#00A8E0', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '3px', marginRight: '4px' };
const bestsellerBadge = { background: '#FF9900', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '3px' };
const addBtn = { width: '100%', padding: '8px', background: '#FF9900', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' };
