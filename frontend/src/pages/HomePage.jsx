import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const HERO_SLIDES = [
  { bg: '#131921', text: 'Up to 50% off on Electronics', sub: 'Limited time deals on mobiles, laptops & more', link: '/products?category=electronics', color: '#ff9900' },
  { bg: '#1a3a2a', text: 'Fashion Sale – New Arrivals', sub: 'Trendy styles for men & women', link: '/products?category=fashion', color: '#4caf50' },
  { bg: '#2d1a3a', text: 'Kitchen & Home Essentials', sub: 'Everything for your home at best prices', link: '/products?category=home-kitchen', color: '#9c27b0' },
];

const CATEGORY_TILES = [
  { label: 'Electronics', emoji: '📱', slug: 'electronics' },
  { label: 'Computers', emoji: '💻', slug: 'computers-laptops' },
  { label: 'TV & Audio', emoji: '📺', slug: 'televisions' },
  { label: 'Kitchen', emoji: '🍳', slug: 'kitchen-appliances' },
  { label: 'Fashion', emoji: '👗', slug: 'fashion' },
  { label: 'Beauty', emoji: '💄', slug: 'beauty-health' },
  { label: 'Sports', emoji: '🏋️', slug: 'sports-outdoors' },
  { label: 'Books', emoji: '📚', slug: 'books-stationery' },
  { label: 'Toys', emoji: '🎮', slug: 'toys-baby-products' },
  { label: 'Automotive', emoji: '🚗', slug: 'automotive' },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('products/featured/'),
      api.get('products/bestsellers/'),
      api.get('products/deals/'),
    ]).then(([f, b, d]) => {
      setFeatured(f.data);
      setBestsellers(b.data);
      setDeals(d.data);
    }).finally(() => setLoading(false));
  }, []);

  const h = HERO_SLIDES[slide];

  return (
    <div style={{ background: '#eaeded', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{ background: h.bg, color: '#fff', padding: '60px 40px', textAlign: 'center', transition: 'background 0.6s', position: 'relative' }}>
        <h1 style={{ fontSize: '2.4rem', margin: '0 0 12px', color: h.color }}>{h.text}</h1>
        <p style={{ fontSize: '1.1rem', margin: '0 0 24px', opacity: 0.85 }}>{h.sub}</p>
        <Link to={h.link} style={{ background: h.color, color: '#131921', padding: '12px 32px', borderRadius: '24px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>
          Shop Now
        </Link>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', background: i === slide ? h.color : '#888', cursor: 'pointer' }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Category Grid */}
        <Section title="Shop by Category">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
            {CATEGORY_TILES.map(c => (
              <Link key={c.slug} to={`/products?category=${c.slug}`} style={{ background: '#fff', borderRadius: '8px', padding: '16px 8px', textAlign: 'center', textDecoration: 'none', color: '#131921', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'transform 0.15s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ fontSize: '28px' }}>{c.emoji}</div>
                <div style={{ fontSize: '12px', marginTop: '6px', fontWeight: '500' }}>{c.label}</div>
              </Link>
            ))}
          </div>
        </Section>

        {/* Deals */}
        {deals.length > 0 && (
          <Section title="🔥 Today's Deals" viewAll="/products?is_featured=true">
            <ProductGrid products={deals} />
          </Section>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <Section title="⭐ Featured Products" viewAll="/products?is_featured=true">
            <ProductGrid products={featured} />
          </Section>
        )}

        {/* Best Sellers */}
        {bestsellers.length > 0 && (
          <Section title="🏆 Best Sellers" viewAll="/products?is_bestseller=true">
            <ProductGrid products={bestsellers} />
          </Section>
        )}

        {loading && <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Loading products...</p>}
      </div>

      {/* Footer */}
      <footer style={{ background: '#131921', color: '#fff', textAlign: 'center', padding: '32px 16px', marginTop: '40px' }}>
        <p style={{ color: '#ff9900', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>🛒 ShopZone</p>
        <p style={{ color: '#888', fontSize: '13px' }}>© 2024 ShopZone. All rights reserved. Built with Django + React.</p>
      </footer>
    </div>
  );
}

function Section({ title, viewAll, children }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#0f1111' }}>{title}</h2>
        {viewAll && <Link to={viewAll} style={{ color: '#007bff', fontSize: '14px' }}>See all →</Link>}
      </div>
      {children}
    </div>
  );
}

function ProductGrid({ products }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
