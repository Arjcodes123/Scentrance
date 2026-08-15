import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { count } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const link = ({ isActive }) =>
    `text-xs uppercase tracking-widest transition-colors ${
      isActive ? 'text-silver-100' : 'text-silver-500 hover:text-silver-200'
    }`;

  const doLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-serif text-2xl text-silver-100">Scentrances</span>
          <span className="text-[9px] uppercase tracking-brand text-silver-600">Signature Fragrances</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/shop" className={link}>Shop All</NavLink>
          <NavLink to="/shop?gender=men" className={link}>For Him</NavLink>
          <NavLink to="/shop?gender=women" className={link}>For Her</NavLink>
          <NavLink to="/shop?gender=unisex" className={link}>Unisex</NavLink>
        </nav>

        <div className="flex items-center gap-5">
          {user ? (
            <div className="hidden items-center gap-4 md:flex">
              {isAdmin && (
                <Link to="/admin" className="text-xs uppercase tracking-widest text-silver-300 hover:text-silver-100">
                  Admin
                </Link>
              )}
              <Link to="/account" className="text-xs uppercase tracking-widest text-silver-500 hover:text-silver-200">
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={doLogout} className="text-xs uppercase tracking-widest text-silver-600 hover:text-silver-300">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden text-xs uppercase tracking-widest text-silver-500 hover:text-silver-200 md:block">
              Account
            </Link>
          )}

          <Link to="/cart" className="relative text-silver-200 hover:text-silver-100" aria-label="Cart">
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-silver-100">
                {count}
              </span>
            )}
          </Link>

          <button className="md:hidden text-silver-200" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-700 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4" onClick={() => setOpen(false)}>
            <NavLink to="/shop" className={link}>Shop All</NavLink>
            <NavLink to="/shop?gender=men" className={link}>For Him</NavLink>
            <NavLink to="/shop?gender=women" className={link}>For Her</NavLink>
            <NavLink to="/shop?gender=unisex" className={link}>Unisex</NavLink>
            {user ? (
              <>
                {isAdmin && <Link to="/admin" className={link({ isActive: false })}>Admin</Link>}
                <Link to="/account" className={link({ isActive: false })}>My Orders</Link>
                <button onClick={doLogout} className="text-left text-xs uppercase tracking-widest text-silver-500">Logout</button>
              </>
            ) : (
              <Link to="/login" className={link({ isActive: false })}>Account</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
