import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLORS = {
  pending: '#FF9900', confirmed: '#007bff', processing: '#9c27b0',
  shipped: '#00bcd4', out_for_del: '#ff5722', delivered: '#4caf50',
  cancelled: '#f44336', returned: '#795548', refunded: '#607d8b',
};

export default function OrdersPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`orders/${id}/`).then(({ data }) => setOrder(data)).finally(() => setLoading(false));
    } else {
      api.get('orders/').then(({ data }) => setOrders(data.results || data)).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;

  // Single order detail
  if (id && order) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
      {searchParams.get('success') && (
        <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', padding: '16px', borderRadius: '8px', marginBottom: '24px', color: '#2e7d32', textAlign: 'center' }}>
          🎉 Order placed successfully! Your order #{order.id} is confirmed.
        </div>
      )}
      <h1>Order #{order.id}</h1>
      <span style={{ background: STATUS_COLORS[order.status] || '#888', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>
        {order.status?.replace('_', ' ').toUpperCase()}
      </span>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 16px' }}>Items</h3>
        {order.items?.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0', marginBottom: '12px' }}>
            <div style={{ width: '60px', height: '60px', background: '#f7f7f7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.product_image ? <img src={`http://127.0.0.1:8000${item.product_image}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : '📦'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '14px' }}>{item.product_name}</p>
              <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
            </div>
            <p style={{ fontWeight: 'bold' }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</p>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 'bold', fontSize: '18px' }}>
          Total: ₹{Number(order.total_price).toLocaleString('en-IN')}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginTop: '16px' }}>
        <h3 style={{ margin: '0 0 12px' }}>Delivery Address</h3>
        <p style={{ margin: 0, lineHeight: 1.8, fontSize: '14px' }}>
          {order.ship_name}<br />{order.ship_phone}<br />
          {order.ship_address}, {order.ship_city}, {order.ship_state} – {order.ship_pincode}
        </p>
        {order.tracking_id && <p style={{ marginTop: '8px', color: '#007bff', fontSize: '13px' }}>Tracking: {order.tracking_id}</p>}
      </div>

      <Link to="/orders" style={{ display: 'inline-block', marginTop: '16px', color: '#007bff', fontSize: '14px' }}>← Back to My Orders</Link>
    </div>
  );

  // Orders list
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          <div style={{ fontSize: '48px' }}>📦</div>
          <p>No orders yet.</p>
          <Link to="/products" style={{ color: '#007bff' }}>Start Shopping →</Link>
        </div>
      ) : orders.map(o => (
        <div key={o.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px' }}>Order #{o.id}</h3>
              <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>{new Date(o.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: STATUS_COLORS[o.status] || '#888', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px' }}>
                {o.status?.replace('_', ' ').toUpperCase()}
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 'bold' }}>₹{Number(o.total_price).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <Link to={`/orders/${o.id}`} style={{ display: 'inline-block', marginTop: '12px', color: '#007bff', fontSize: '13px' }}>View Details →</Link>
        </div>
      ))}
    </div>
  );
}
