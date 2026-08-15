import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../../api';
import Spinner from '../../components/Spinner';

export default function AdminProducts() {
  const [products, setProducts] = useState(null);

  const load = () => api.get('/admin/products').then((d) => setProducts(d.products)).catch(() => setProducts([]));
  useEffect(() => { load(); }, []);

  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await api.del(`/admin/products/${p.id}`);
    load();
  };

  if (!products) return <Spinner />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-silver-100">Products</h1>
        <Link to="/admin/products/new" className="btn-silver">+ New Product</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-[10px] uppercase tracking-widest text-silver-600">
              <th className="p-4">Product</th>
              <th className="p-4">Gender</th>
              <th className="p-4">Sizes</th>
              <th className="p-4">From</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {products.map((p) => {
              const stock = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-ink-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={`/uploads/products/${p.image}`} alt="" className="h-12 w-10 object-cover bg-ink-700" />
                      <div>
                        <p className="text-silver-100">{p.name}</p>
                        <p className="text-xs text-silver-600">{p.family}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize text-silver-400">{p.gender}</td>
                  <td className="p-4 text-silver-400">{p.variants.map((v) => v.size).join(', ')}</td>
                  <td className="p-4 text-silver-300">{money(p.priceFrom)}</td>
                  <td className={`p-4 ${stock <= 10 ? 'text-amber-600' : 'text-silver-400'}`}>{stock}</td>
                  <td className="p-4">
                    <span className={`text-xs uppercase tracking-widest ${p.active ? 'text-emerald-600' : 'text-silver-600'}`}>
                      {p.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/admin/products/${p.id}`} className="text-silver-300 hover:text-silver-100">Edit</Link>
                    <button onClick={() => del(p)} className="ml-4 text-silver-600 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
