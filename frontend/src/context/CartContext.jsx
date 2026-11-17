import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });

  const fetchCart = async () => {
    try {
      const { data } = await api.get('cart/');
      setCart(data);
    } catch {}
  };

  useEffect(() => { fetchCart(); }, []);

  const addToCart = async (product_id, quantity = 1) => {
    await api.post('cart/', { action: 'add', product_id, quantity });
    fetchCart();
  };

  const removeFromCart = async (product_id) => {
    await api.post('cart/', { action: 'remove', product_id });
    fetchCart();
  };

  const updateQty = async (product_id, quantity) => {
    await api.post('cart/', { action: 'update', product_id, quantity });
    fetchCart();
  };

  const clearCart = async () => {
    await api.post('cart/', { action: 'clear' });
    fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
