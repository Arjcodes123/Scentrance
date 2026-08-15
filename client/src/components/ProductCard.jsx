import { useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(null); // holds the size label just added

  // Show sizes cheapest → most expensive in the quick picker.
  const variants = [...product.variants].sort((a, b) => a.price - b.price);

  const quickAdd = (e, variant) => {
    e.preventDefault(); // stop the card's <Link> from navigating
    e.stopPropagation();
    if (variant.stock <= 0) return;
    add(product, variant, 1);
    setAdded(variant.size);
    setTimeout(() => setAdded(null), 1400);
  };

  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-ink-700 ring-1 ring-ink-600">
        <Link to={`/product/${product.slug}`}>
          <img
            src={`/uploads/products/${product.image}`}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        <span className="pointer-events-none absolute left-3 top-3 bg-white/85 px-2 py-1 text-[9px] uppercase tracking-widest text-silver-200 shadow-sm backdrop-blur-sm">
          {product.gender}
        </span>

        {/* Quick-add overlay — visible on hover (desktop) and always shown on touch screens */}
        <div className="absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-white via-white/85 to-transparent p-3 pt-10 opacity-100 transition-all duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          {added ? (
            <div className="flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-widest text-gold-dark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 13 4 4L19 7" /></svg>
              {added} added to cart
            </div>
          ) : (
            <>
              <p className="mb-2 text-center text-[9px] uppercase tracking-widest text-silver-500">Quick add</p>
              <div className="flex gap-1.5">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={(e) => quickAdd(e, v)}
                    disabled={v.stock <= 0}
                    title={v.stock <= 0 ? 'Out of stock' : `Add ${v.size} — ${money(v.price)}`}
                    className="flex-1 border border-silver-600/70 bg-white/80 px-1 py-2 text-center text-silver-200 backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/80 disabled:hover:text-silver-400"
                  >
                    <span className="block text-xs font-medium">{v.size}</span>
                    <span className="block text-[10px] opacity-80">{money(v.price)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Link to={`/product/${product.slug}`} className="mt-4 block text-center">
        <p className="text-[10px] uppercase tracking-widest text-silver-600">{product.family}</p>
        <h3 className="mt-1 font-serif text-xl text-silver-100">{product.name}</h3>
        <p className="mt-1 text-sm text-silver-400">From {money(product.priceFrom)}</p>
      </Link>
    </div>
  );
}
