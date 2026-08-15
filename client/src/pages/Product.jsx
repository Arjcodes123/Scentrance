import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, money } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function Product() {
  const { slug } = useParams();
  const { add } = useCart();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setData(null);
    setError(null);
    api
      .get(`/products/${slug}`)
      .then((d) => {
        setData(d);
        // default to the 50ml (most expensive) variant
        setVariant(d.product.variants[0]);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <div className="py-32 text-center text-silver-400">{error} — <Link to="/shop" className="underline">back to shop</Link></div>;
  if (!data) return <Spinner label="Loading fragrance" />;

  const { product, related } = data;

  const handleAdd = () => {
    add(product, variant, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <nav className="mb-8 text-xs uppercase tracking-widest text-silver-600">
        <Link to="/shop" className="hover:text-silver-300">Collection</Link> <span className="mx-2">/</span>
        <span className="text-silver-400">{product.name}</span>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Image */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="overflow-hidden bg-ink-800">
            <img src={`/uploads/products/${product.image}`} alt={product.name} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase tracking-widest text-silver-600">{product.gender} · {product.family}</p>
          <h1 className="mt-2 font-serif text-5xl text-silver-100">{product.name}</h1>
          {product.tagline && <p className="mt-3 font-serif text-xl italic text-silver-400">“{product.tagline}”</p>}

          <p className="mt-6 leading-relaxed text-silver-300">{product.description}</p>

          {/* Variant selector */}
          <div className="mt-8">
            <p className="label">Size — {variant && money(variant.price)}</p>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => {
                const out = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    disabled={out}
                    onClick={() => setVariant(v)}
                    className={`min-w-[88px] border px-4 py-3 text-center transition-colors ${
                      variant?.id === v.id
                        ? 'border-gold bg-ink-700'
                        : 'border-ink-600 hover:border-silver-500'
                    } ${out ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    <span className="block text-sm text-silver-100">{v.size}</span>
                    <span className="block text-xs text-silver-500">{money(v.price)}</span>
                  </button>
                );
              })}
            </div>
            {variant && variant.stock <= 5 && variant.stock > 0 && (
              <p className="mt-3 text-xs font-medium text-gold-dark">Only {variant.stock} left in stock.</p>
            )}
          </div>

          {/* Qty + add */}
          <div className="mt-8 flex items-stretch gap-4">
            <div className="flex items-center border border-ink-600">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 text-silver-300 hover:text-silver-100">−</button>
              <span className="w-10 text-center text-silver-100">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="px-4 text-silver-300 hover:text-silver-100">+</button>
            </div>
            <button onClick={handleAdd} disabled={!variant || variant.stock <= 0} className="btn-silver flex-1">
              {variant?.stock <= 0 ? 'Out of Stock' : added ? 'Added ✓' : `Add to Cart — ${variant ? money(variant.price * qty) : ''}`}
            </button>
          </div>

          {/* Notes pyramid */}
          <div className="mt-12 border-t border-ink-700 pt-8">
            <h3 className="font-serif text-2xl text-silver-100">Fragrance Notes</h3>
            <div className="mt-5 space-y-4">
              <NoteRow label="Top" notes={product.notes.top} />
              <NoteRow label="Heart" notes={product.notes.middle} />
              <NoteRow label="Base" notes={product.notes.base} />
            </div>
          </div>

          {/* Meta */}
          <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-ink-700 bg-ink-700 sm:grid-cols-2">
            {product.mood && <Meta term="Mood" desc={product.mood} />}
            {product.season && <Meta term="Best Season" desc={product.season} />}
            {product.bestTime && <Meta term="Best Worn" desc={product.bestTime} full />}
            {product.personality && <Meta term="The Personality It Reveals" desc={product.personality} full />}
          </dl>
        </div>
      </div>

      {/* Related */}
      {related?.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-10 text-center font-serif text-3xl text-silver-100">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function NoteRow({ label, notes }) {
  if (!notes?.length) return null;
  return (
    <div className="flex gap-4">
      <span className="w-16 shrink-0 pt-1 text-xs uppercase tracking-widest text-silver-600">{label}</span>
      <div className="flex flex-wrap gap-2">
        {notes.map((n) => (
          <span key={n} className="border border-ink-600 px-3 py-1 text-sm text-silver-300">{n}</span>
        ))}
      </div>
    </div>
  );
}

function Meta({ term, desc, full }) {
  return (
    <div className={`bg-ink-800 p-5 ${full ? 'sm:col-span-2' : ''}`}>
      <dt className="text-[10px] uppercase tracking-widest text-silver-600">{term}</dt>
      <dd className="mt-1 text-sm text-silver-300">{desc}</dd>
    </div>
  );
}
