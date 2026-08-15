import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../../api';
import Spinner from '../../components/Spinner';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(setData).catch(() => setData({ error: true }));
  }, []);

  if (!data) return <Spinner />;
  if (data.error) return <p className="text-silver-400">Failed to load stats.</p>;

  const { stats, lowStock, recent } = data;
  const cards = [
    ['Revenue', money(stats.revenue)],
    ['Orders', stats.orders],
    ['Pending', stats.pending],
    ['Products', stats.productCount],
    ['Customers', stats.customers],
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-silver-100">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map(([label, val]) => (
          <div key={label} className="card p-5">
            <p className="text-[10px] uppercase tracking-widest text-silver-600">{label}</p>
            <p className="mt-2 font-serif text-2xl text-silver-100">{val}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-silver-100">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs uppercase tracking-widest text-silver-500 hover:text-silver-200">All →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-silver-600">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-700">
                {recent.map((o) => (
                  <tr key={o.public_id}>
                    <td className="py-2 text-silver-300">{o.public_id}</td>
                    <td className="py-2 text-silver-500">{o.customer_name}</td>
                    <td className="py-2 text-silver-300">{money(o.total)}</td>
                    <td className="py-2 text-right text-xs uppercase tracking-widest text-silver-500">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-serif text-xl text-silver-100">Low Stock</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-silver-600">All variants well stocked.</p>
          ) : (
            <ul className="divide-y divide-ink-700 text-sm">
              {lowStock.map((s, idx) => (
                <li key={idx} className="flex items-center justify-between py-2">
                  <span className="text-silver-300">{s.name} <span className="text-silver-600">({s.size})</span></span>
                  <span className={s.stock <= 0 ? 'text-red-600' : 'text-amber-600'}>{s.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
