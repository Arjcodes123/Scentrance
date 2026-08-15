import { useEffect, useState, Fragment } from 'react';
import { api, money } from '../../api';
import Spinner from '../../components/Spinner';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_STYLE = {
  pending: 'text-amber-600', processing: 'text-blue-600', shipped: 'text-indigo-600',
  delivered: 'text-emerald-600', cancelled: 'text-red-600',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);

  const load = () => {
    const qs = filter ? `?status=${filter}` : '';
    api.get(`/admin/orders${qs}`).then((d) => setOrders(d.orders)).catch(() => setOrders([]));
  };
  useEffect(() => { setOrders(null); load(); }, [filter]);

  const updateStatus = async (orderId, status) => {
    await api.patch(`/admin/orders/${orderId}/status`, { status });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-silver-100">Orders</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} onClick={() => setFilter(s)}
            className={`px-4 py-2 text-xs uppercase tracking-widest ${filter === s ? 'bg-gold text-silver-100' : 'border border-ink-600 text-silver-400 hover:text-silver-100'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {!orders ? <Spinner /> : orders.length === 0 ? (
        <p className="card p-10 text-center text-silver-500">No orders here.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-[10px] uppercase tracking-widest text-silver-600">
                <th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Items</th>
                <th className="p-4">Total</th><th className="p-4">Date</th><th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {orders.map((o) => (
                <Fragment key={o.id}>
                  <tr className="cursor-pointer hover:bg-ink-800/50" onClick={() => setOpen(open === o.id ? null : o.id)}>
                    <td className="p-4 text-silver-200">{o.public_id}</td>
                    <td className="p-4 text-silver-400">{o.customer_name}<br /><span className="text-xs text-silver-600">{o.phone}</span></td>
                    <td className="p-4 text-silver-500">{o.items.reduce((n, i) => n + i.quantity, 0)} item(s)</td>
                    <td className="p-4 text-silver-300">{money(o.total)}</td>
                    <td className="p-4 text-xs text-silver-600">{new Date(o.created_at + 'Z').toLocaleDateString()}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`bg-ink-800 border border-ink-600 px-2 py-1 text-xs uppercase tracking-widest ${STATUS_STYLE[o.status]}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                  {open === o.id && (
                    <tr className="bg-ink-900/60">
                      <td colSpan={6} className="p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="label">Items</p>
                            <ul className="space-y-1 text-silver-300">
                              {o.items.map((i) => (
                                <li key={i.id} className="flex justify-between">
                                  <span>{i.product_name} ({i.size}) ×{i.quantity}</span>
                                  <span>{money(i.unit_price * i.quantity)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="label">Delivery</p>
                            <p className="text-silver-300">{o.customer_name}</p>
                            <p className="text-silver-500">{o.email}</p>
                            <p className="text-silver-500">{o.address}, {o.city} {o.postal_code || ''}</p>
                            <p className="mt-2 text-xs text-silver-600">Payment: {o.payment.toUpperCase()} · Subtotal {money(o.subtotal)} · Shipping {money(o.shipping)}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
