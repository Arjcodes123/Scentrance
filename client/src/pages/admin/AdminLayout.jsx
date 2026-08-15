import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const link = ({ isActive }) =>
    `block px-4 py-3 text-sm transition-colors ${
      isActive ? 'bg-ink-700 text-silver-100' : 'text-silver-500 hover:bg-ink-800 hover:text-silver-200'
    }`;

  return (
    <div className="flex min-h-screen bg-ink-900">
      <aside className="hidden w-60 shrink-0 border-r border-ink-700 bg-ink-900 md:block">
        <div className="border-b border-ink-700 p-5">
          <Link to="/" className="font-serif text-xl text-silver-100">Scentrances</Link>
          <p className="text-[9px] uppercase tracking-brand text-silver-600">Admin Console</p>
        </div>
        <nav className="py-3">
          <NavLink to="/admin" end className={link}>Dashboard</NavLink>
          <NavLink to="/admin/products" className={link}>Products</NavLink>
          <NavLink to="/admin/orders" className={link}>Orders</NavLink>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink-700 px-6 py-4">
          <div className="flex gap-4 md:hidden">
            <NavLink to="/admin" end className="text-sm text-silver-300">Dashboard</NavLink>
            <NavLink to="/admin/products" className="text-sm text-silver-300">Products</NavLink>
            <NavLink to="/admin/orders" className="text-sm text-silver-300">Orders</NavLink>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm text-silver-500">
            <Link to="/" className="hover:text-silver-200">View store ↗</Link>
            <span className="text-silver-300">{user?.name}</span>
            <button onClick={async () => { await logout(); navigate('/'); }} className="text-silver-600 hover:text-silver-200">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
