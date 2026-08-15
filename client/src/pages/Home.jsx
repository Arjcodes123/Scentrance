import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function Home() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    api.get('/products?featured=true').then((d) => setFeatured(d.products)).catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-700">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-ink-900 to-ink-900" />
        <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: 'radial-gradient(circle at 30% 25%, #c1953a 0, transparent 55%)' }} />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 80% 80%, #a9822b 0, transparent 45%)' }} />
        <div className="relative mx-auto max-w-7xl px-4 py-28 text-center md:px-8 md:py-40">
          <p className="mb-5 text-xs uppercase tracking-brand text-gold">The Signature Collection</p>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight text-silver-100 md:text-7xl">
            Scent is the memory<br />you leave behind.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-silver-400">
            Signature compositions in black and gold — crafted for those who walk into a room and change it.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/shop" className="btn-silver">Explore the Collection</Link>
            <Link to="/shop?gender=women" className="btn-outline">For Her</Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="brand-rule mb-4" />
            <h2 className="font-serif text-3xl text-silver-100 md:text-4xl">Signature Favourites</h2>
          </div>
          <Link to="/shop" className="text-xs uppercase tracking-widest text-silver-500 hover:text-silver-100">
            View all →
          </Link>
        </div>
        {!featured ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Value props */}
      <section className="border-y border-ink-700 bg-ink-800/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 text-center md:grid-cols-3 md:px-8">
          {[
            ['Long-Lasting', 'High-concentration parfum oils that linger for hours, not minutes.'],
            ['Three Sizes', 'From a 10ml travel companion to a 50ml signature bottle.'],
            ['Cash on Delivery', 'Pay when it arrives. Free shipping on orders over Rs 5,000.'],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-serif text-2xl text-silver-100">{t}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm text-silver-500">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
