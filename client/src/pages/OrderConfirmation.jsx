import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, money } from '../api';
import Spinner from '../components/Spinner';

const STATUS_LABEL = {
  pending: 'Order received',
  processing: 'Being prepared',
  shipped: 'On its way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderConfirmation() {
  const { publicId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/orders/${publicId}`).then((d) => setOrder(d.order)).catch((e) => setError(e.message));
  }, [publicId]);

  if (error) return <div className="py-32 text-center text-silver-400">{error}</div>;
  if (!order) return <Spinner label="Fetching order" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-silver-500">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c7c9cc" strokeWidth="1.5"><path d="m5 13 4 4L19 7" /></svg>
      </div>
      <h1 className="font-serif text-4xl text-silver-100">Thank you</h1>
      <p className="mt-3 text-silver-400">Your order has been placed. We’ll be in touch shortly.</p>

      <div className="card mt-10 p-6 text-left">
        <div className="flex items-center justify-between border-b border-ink-700 pb-4">
          <div>
            <p className="label">Order Number</p>
            <p className="font-serif text-xl text-silver-100">{order.public_id}</p>
          </div>
          <span className="border border-silver-600 px-3 py-1 text-xs uppercase tracking-widest text-silver-300">
            {STATUS_LABEL[order.status] || order.status}
          </span>
        </div>

        <ul className="divide-y divide-ink-700">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 py-4">
              <img src={`/uploads/products/${it.image}`} alt={it.product_name} className="h-16 w-14 object-cover bg-ink-700" />
              <div className="flex-1">
                <p className="text-silver-100">{it.product_name}</p>
                <p className="text-xs uppercase tracking-widest text-silver-600">{it.size} · Qty {it.quantity}</p>
              </div>
              <p className="text-silver-300">{money(it.unit_price * it.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-ink-700 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-silver-500">Subtotal</dt><dd className="text-silver-200">{money(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-silver-500">Shipping</dt><dd className="text-silver-200">{order.shipping === 0 ? 'Free' : money(order.shipping)}</dd></div>
          <div className="flex justify-between border-t border-ink-700 pt-2"><dt className="text-silver-100">Total ({order.payment.toUpperCase()})</dt><dd className="font-serif text-xl text-silver-100">{money(order.total)}</dd></div>
        </dl>

        <div className="mt-5 border-t border-ink-700 pt-4 text-sm text-silver-500">
          <p>Delivering to {order.customer_name}, {order.address}, {order.city}</p>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link to="/shop" className="btn-outline">Continue Shopping</Link>
        <Link to="/account" className="btn-ghost">View My Orders</Link>
      </div>
    </div>
  );
}
