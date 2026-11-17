import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/useCart';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`products/${id}/`).then(({ data }) => {
      setProduct(data);
      setActiveImg(data.image);
    });
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;

  const specs = product.specifications || [];
  const groups = [...new Set(specs.map(s => s.group))];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px', background: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Images */}
        <div style={{ flex: '0 0 400px' }}>
          <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7' }}>
            {activeImg
              ? <img src={`http://127.0.0.1:8000${activeImg}`} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: '80px' }}>📦</span>}
          </div>
          {product.images?.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto' }}>
              {product.images.map(img => (
                <img key={img.id} src={`http://127.0.0.1:8000${img.image}`} alt="" onClick={() => setActiveImg(img.image)}
                  style={{ width: '64px', height: '64px', objectFit: 'contain', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          {product.brand && <p style={{ color: '#888', margin: '0 0 4px' }}>Brand: <strong style={{ color: '#007bff' }}>{product.brand?.name}</strong></p>}
          <h1 style={{ fontSize: '22px', margin: '0 0 12px', lineHeight: 1.4 }}>{product.name}</h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ color: '#FF9900', fontSize: '18px' }}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span style={{ color: '#007bff', fontSize: '14px' }}>{product.review_count} ratings</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />

          {/* Price */}
          <div style={{ marginBottom: '16px' }}>
            {product.original_price && (
              <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
                M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{Number(product.original_price).toLocaleString('en-IN')}</span>
              </p>
            )}
            <p style={{ margin: '4px 0', fontSize: '28px', fontWeight: 'bold', color: '#B12704' }}>
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>
            {product.discount_percent > 0 && (
              <p style={{ margin: 0, color: '#B12704', fontSize: '14px' }}>You save {product.discount_percent}%</p>
            )}
          </div>

          {product.is_prime && (
            <div style={{ background: '#00A8E0', color: '#fff', display: 'inline-block', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', marginBottom: '12px' }}>
              ✦ FREE Prime Delivery
            </div>
          )}

          {/* Quantity + Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={qtyBtn}>−</button>
              <span style={{ padding: '0 16px', fontWeight: 'bold' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={qtyBtn}>+</button>
            </div>
            <button onClick={handleAddToCart} style={{ ...addBtn, background: added ? '#4caf50' : '#FF9900' }}>
              {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
          </div>

          <p style={{ color: product.stock > 0 ? '#007600' : '#B12704', fontWeight: 'bold', fontSize: '14px' }}>
            {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
          </p>

          {/* Description */}
          {product.description && (
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>About this item</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#444' }}>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      {specs.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Technical Details</h2>
          {groups.map(group => (
            <div key={group} style={{ marginBottom: '24px' }}>
              {group && <h3 style={{ fontSize: '15px', color: '#555', margin: '12px 0 8px' }}>{group}</h3>}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {specs.filter(s => s.group === group).map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 16px 8px 0', fontWeight: '500', width: '35%', fontSize: '14px', color: '#555' }}>{s.key}</td>
                      <td style={{ padding: '8px 0', fontSize: '14px' }}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Customer Reviews</h2>
          {product.reviews.map(r => (
            <div key={r.id} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{r.username}</span>
                <span style={{ color: '#FF9900' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                {r.verified && <span style={{ color: '#007600', fontSize: '12px' }}>✓ Verified Purchase</span>}
              </div>
              {r.title && <p style={{ fontWeight: 'bold', margin: '0 0 4px', fontSize: '14px' }}>{r.title}</p>}
              <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const qtyBtn = { background: '#f0f0f0', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: '16px' };
const addBtn = { padding: '12px 32px', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s' };
