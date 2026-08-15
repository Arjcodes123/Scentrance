import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { money } from '../api';

const FREE_SHIPPING = 5000;

export default function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : 250;

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="font-serif text-4xl text-silver-100">Your cart is empty</h1>
        <p className="mt-3 text-silver-500">Discover a scent worth remembering.</p>
        <Link to="/shop" className="btn-silver mt-8">Browse the Collection</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <h1 className="mb-10 font-serif text-4xl text-silver-100">Shopping Cart</h1>
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y divide-ink-700 border-y border-ink-700">
            {items.map((i) => (
              <div key={i.variantId} className="flex gap-4 py-6">
                <Link to={`/product/${i.slug}`} className="h-28 w-24 shrink-0 overflow-hidden bg-ink-800">
                  <img src={`/uploads/products/${i.image}`} alt={i.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <Link to={`/product/${i.slug}`} className="font-serif text-xl text-silver-100 hover:text-gold">{i.name}</Link>
                      <p className="text-xs uppercase tracking-widest text-silver-600">{i.size}</p>
                    </div>
                    <p className="text-silver-200">{money(i.price * i.quantity)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-ink-600">
                      <button onClick={() => setQty(i.variantId, i.quantity - 1)} className="px-3 py-1 text-silver-300 hover:text-silver-100">−</button>
                      <span className="w-8 text-center text-sm text-silver-100">{i.quantity}</span>
                      <button onClick={() => setQty(i.variantId, i.quantity + 1)} className="px-3 py-1 text-silver-300 hover:text-silver-100">+</button>
                    </div>
                    <button onClick={() => remove(i.variantId)} className="text-xs uppercase tracking-widest text-silver-600 hover:text-red-600">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <aside className="card h-fit p-6">
          <h2 className="font-serif text-2xl text-silver-100">Order Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <Row term="Subtotal" val={money(subtotal)} />
            <Row term="Shipping" val={shipping === 0 ? 'Free' : money(shipping)} />
            {subtotal < FREE_SHIPPING && (
              <p className="text-xs text-silver-600">Add {money(FREE_SHIPPING - subtotal)} more for free shipping.</p>
            )}
            <div className="border-t border-ink-700 pt-3">
              <Row term="Total" val={money(subtotal + shipping)} big />
            </div>
          </dl>
          <Link to="/checkout" className="btn-silver mt-6 w-full">Proceed to Checkout</Link>
          <Link to="/shop" className="btn-ghost mt-2 w-full">Continue Shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ term, val, big }) {
  return (
    <div className="flex justify-between">
      <dt className={big ? 'text-silver-100' : 'text-silver-500'}>{term}</dt>
      <dd className={big ? 'font-serif text-xl text-silver-100' : 'text-silver-200'}>{val}</dd>
    </div>
  );
}
