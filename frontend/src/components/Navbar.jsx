import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <nav style={{ background: '#131921', color: '#fff', padding: '0' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '12px', flexWrap: 'wrap' }}>
        {/* Logo */}
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold', marginRight: '8px', whiteSpace: 'nowrap' }}>
          🛒 <span style={{ color: '#ff9900' }}>ShopZone</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', minWidth: '200px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, brands..."
            style={{ flex: 1, padding: '8px 12px', fontSize: '14px', border: 'none', outline: 'none', borderRadius: '4px 0 0 4px' }}
          />
          <button type="submit" style={{ background: '#ff9900', border: 'none', padding: '8px 14px', cursor: 'pointer', borderRadius: '0 4px 4px 0', fontSize: '16px' }}>
            🔍
          </button>
        </form>

        {/* Auth links */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '14px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
              >
                👤 {user.username} ▾
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', color: '#131921', borderRadius: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 999, minWidth: '160px' }}>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={menuItem}>My Account</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} style={menuItem}>My Orders</Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)} style={menuItem}>Wishlist ♥</Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }} style={{ ...menuItem, width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'red' }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Sign In</Link>
              <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
            </>
          )}
          <Link to="/cart" style={{ color: '#fff', textDecoration: 'none', position: 'relative' }}>
            🛒 Cart
            {cart.count > 0 && (
              <span style={{ background: '#ff9900', color: '#131921', borderRadius: '50%', padding: '1px 6px', fontSize: '11px', fontWeight: 'bold', marginLeft: '4px' }}>
                {cart.count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category bar */}
      <div style={{ background: '#232f3e', display: 'flex', gap: '0', overflowX: 'auto', padding: '0 8px' }}>
        {[
          ['All Products', '/products'],
          ['Electronics', '/products?category=electronics'],
          ['Mobiles', '/products?category=smartphones'],
          ['Laptops', '/products?category=laptops'],
          ['TV & Audio', '/products?category=televisions'],
          ['Kitchen', '/products?category=mixer-grinder-blenders'],
          ['Fashion', '/products?category=men-s-clothing'],
          ['Beauty', '/products?category=skin-care'],
          ['Sports', '/products?category=exercise-fitness'],
          ['Deals', '/products?is_featured=true'],
        ].map(([label, href]) => (
          <Link key={label} to={href} style={{ color: '#fff', textDecoration: 'none', padding: '8px 12px', fontSize: '13px', whiteSpace: 'nowrap', display: 'block' }}
            onMouseOver={e => e.target.style.border = '1px solid #fff'}
            onMouseOut={e => e.target.style.border = 'none'}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const menuItem = {
  display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#131921', fontSize: '14px',
  borderBottom: '1px solid #f0f0f0',
};
