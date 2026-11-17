import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => api.get('wishlist/').then(({ data }) => setItems(data.results || data)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const remove = async (id) => {
    await api.delete(`wishlist/${id}/`);
    fetch();
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
      <h1>My Wishlist ♥ ({items.length})</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          <div style={{ fontSize: '48px' }}>♥</div>
          <p>Your wishlist is empty.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {items.map(item => (
            <div key={item.id} style={{ position: 'relative' }}>
              <ProductCard product={item.product} />
              <button onClick={() => remove(item.id)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
