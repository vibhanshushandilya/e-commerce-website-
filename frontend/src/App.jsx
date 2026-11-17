import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <div style={{ fontFamily: '"Amazon Ember", Arial, sans-serif', background: '#eaeded', minHeight: '100vh' }}>
      <Navbar />
      <Routes>
        <Route path="/"              element={<HomePage />} />
        <Route path="/products"      element={<ProductsPage />} />
        <Route path="/products/:id"  element={<ProductDetailPage />} />
        <Route path="/cart"          element={<CartPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/register"      element={<RegisterPage />} />
        <Route path="/checkout"      element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/orders"        element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/orders/:id"    element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/wishlist"      element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

