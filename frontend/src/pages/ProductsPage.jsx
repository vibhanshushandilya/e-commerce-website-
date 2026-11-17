import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    ordering: searchParams.get('ordering') || '-created_at',
    is_prime: searchParams.get('is_prime') || '',
    is_featured: searchParams.get('is_featured') || '',
    is_bestseller: searchParams.get('is_bestseller') || '',
  });

  const fetchProducts = useCallback(async (params = filters) => {
    setLoading(true);
    try {
      const query = Object.entries(params)
        .filter(([, v]) => v !== '')
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      const { data } = await api.get(`products/?${query}`);
      setProducts(data.results || data);
      setPagination({ count: data.count, next: data.next, previous: data.previous });
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    const params = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      ordering: searchParams.get('ordering') || '-created_at',
      is_prime: searchParams.get('is_prime') || '',
      is_featured: searchParams.get('is_featured') || '',
      is_bestseller: searchParams.get('is_bestseller') || '',
    };
    setFilters(params);
    fetchProducts(params);
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const sp = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => { if (v) sp.set(k, v); });
    setSearchParams(sp);
  };

  return (
    <div style={{ display: 'flex', maxWidth: '1280px', margin: '0 auto', padding: '24px 16px', gap: '24px', background: '#eaeded', minHeight: '100vh' }}>
      {/* Sidebar Filters */}
      <aside style={{ width: '220px', flexShrink: 0 }}>
        <div style={sideCard}>
          <h3 style={sideTitle}>Filters</h3>

          <FilterGroup label="Sort By">
            <select value={filters.ordering} onChange={e => updateFilter('ordering', e.target.value)} style={selectStyle}>
              <option value="-created_at">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Top Rated</option>
              <option value="-discount_percent">Biggest Discount</option>
            </select>
          </FilterGroup>

          <FilterGroup label="Price Range">
            <input placeholder="Min ₹" value={filters.min_price} onChange={e => updateFilter('min_price', e.target.value)} style={inputStyle} type="number" />
            <input placeholder="Max ₹" value={filters.max_price} onChange={e => updateFilter('max_price', e.target.value)} style={{ ...inputStyle, marginTop: '6px' }} type="number" />
          </FilterGroup>

          <FilterGroup label="Special">
            <label style={checkLabel}>
              <input type="checkbox" checked={filters.is_prime === 'true'} onChange={e => updateFilter('is_prime', e.target.checked ? 'true' : '')} />
              {' '}✦ Prime
            </label>
            <label style={checkLabel}>
              <input type="checkbox" checked={filters.is_featured === 'true'} onChange={e => updateFilter('is_featured', e.target.checked ? 'true' : '')} />
              {' '}⭐ Featured
            </label>
            <label style={checkLabel}>
              <input type="checkbox" checked={filters.is_bestseller === 'true'} onChange={e => updateFilter('is_bestseller', e.target.checked ? 'true' : '')} />
              {' '}🏆 Best Seller
            </label>
          </FilterGroup>

          <button onClick={() => { setFilters({ search: '', category: '', min_price: '', max_price: '', ordering: '-created_at', is_prime: '', is_featured: '', is_bestseller: '' }); setSearchParams({}); }}
            style={{ width: '100%', padding: '8px', background: '#ff9900', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }}>
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>
            {filters.search ? `Results for "${filters.search}"` : 'All Products'}
            {!loading && <span style={{ color: '#888', fontSize: '14px', fontWeight: 'normal' }}> ({pagination.count} items)</span>}
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <div style={{ fontSize: '48px' }}>🔍</div>
            <p>No products found. Try different filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 8px', color: '#131921' }}>{label}</p>
      {children}
    </div>
  );
}

const sideCard = { background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const sideTitle = { margin: '0 0 16px', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' };
const selectStyle = { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' };
const inputStyle = { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' };
const checkLabel = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', marginBottom: '6px' };
