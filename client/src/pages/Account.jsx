import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const STATUS_STYLE = {
  pending: 'text-amber-600 border-amber-500/40',
  processing: 'text-blue-600 border-blue-500/40',
  shipped: 'text-indigo-600 border-indigo-500/40',
  delivered: 'text-emerald-600 border-emerald-500/40',
  cancelled: 'text-red-600 border-red-500/40',
};

export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders/mine').then((d) => setOrders(d.orders)).catch(() => setOrders([]));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
      <div className="mb-10">
        <div className="brand-rule mb-4" />
        <h1 className="font-serif text-4xl text-silver-100">Hello, {user?.name.split(' ')[0]}</h1>
        <p className="mt-2 text-silver-500">{user?.email}</p>
      </div>

      <h2 className="mb-5 font-serif text-2xl text-silver-100">Order History</h2>
      {!orders ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <div className="card p-10 text-center text-silver-500">
          You haven’t placed any orders yet.
          <div><Link to="/shop" className="btn-silver mt-5">Start Shopping</Link></div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 pb-3">
                <div>
                  <Link to={`/order/${o.public_id}`} className="font-serif text-lg text-silver-100 hover:text-gold">{o.public_id}</Link>
                  <p className="text-xs text-silver-600">{new Date(o.created_at + 'Z').toLocaleString()}</p>
                </div>
                <span className={`border px-3 py-1 text-xs uppercase tracking-widest ${STATUS_STYLE[o.status] || ''}`}>{o.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-silver-400">{o.items.map((i) => `${i.product_name} (${i.size})`).join(', ')}</p>
                <p className="shrink-0 font-serif text-lg text-silver-100">{money(o.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
