import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, money } from '../api';

const FREE_SHIPPING = 5000;

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const shipping = subtotal >= FREE_SHIPPING ? 0 : 250;
  const total = subtotal + shipping;

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="font-serif text-3xl text-silver-100">Nothing to check out</h1>
        <Link to="/shop" className="btn-silver mt-6">Browse the Collection</Link>
      </div>
    );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { order } = await api.post('/orders', {
        customer: form,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      });
      clear();
      navigate(`/order/${order.publicId}`, { state: { fresh: true } });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <h1 className="mb-10 font-serif text-4xl text-silver-100">Checkout</h1>
      <form onSubmit={submit} className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="mb-4 font-serif text-2xl text-silver-100">Delivery Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" value={form.name} onChange={set('name')} required full />
              <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
              <Field label="Phone" value={form.phone} onChange={set('phone')} required placeholder="03xx xxxxxxx" />
              <Field label="Street Address" value={form.address} onChange={set('address')} required full />
              <Field label="City" value={form.city} onChange={set('city')} required />
              <Field label="Postal Code" value={form.postalCode} onChange={set('postalCode')} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="label mb-3">Payment Method</h3>
            <div className="flex items-center gap-3 border border-silver-500 bg-ink-700 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span className="text-sm text-silver-100">Cash on Delivery</span>
              <span className="ml-auto text-xs text-silver-600">Pay when it arrives</span>
            </div>
          </div>

          {error && <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}
        </div>

        {/* Summary */}
        <aside className="card h-fit p-6">
          <h2 className="font-serif text-2xl text-silver-100">Your Order</h2>
          <ul className="mt-5 space-y-3">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-2 text-sm">
                <span className="text-silver-400">{i.name} <span className="text-silver-600">({i.size}) ×{i.quantity}</span></span>
                <span className="shrink-0 text-silver-200">{money(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-ink-700 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-silver-500">Subtotal</dt><dd className="text-silver-200">{money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-silver-500">Shipping</dt><dd className="text-silver-200">{shipping === 0 ? 'Free' : money(shipping)}</dd></div>
            <div className="flex justify-between border-t border-ink-700 pt-2"><dt className="text-silver-100">Total</dt><dd className="font-serif text-xl text-silver-100">{money(total)}</dd></div>
          </dl>
          <button type="submit" disabled={submitting} className="btn-silver mt-6 w-full">
            {submitting ? 'Placing Order…' : 'Place Order'}
          </button>
          <p className="mt-3 text-center text-xs text-silver-600">By placing your order you agree to our terms.</p>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, full, ...props }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}
