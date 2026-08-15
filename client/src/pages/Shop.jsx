import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const GENDERS = [
  ['', 'All'],
  ['men', 'For Him'],
  ['women', 'For Her'],
  ['unisex', 'Unisex'],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState(null);
  const gender = params.get('gender') || '';
  const q = params.get('q') || '';

  useEffect(() => {
    setProducts(null);
    const qs = new URLSearchParams();
    if (gender) qs.set('gender', gender);
    if (q) qs.set('q', q);
    api.get(`/products?${qs.toString()}`).then((d) => setProducts(d.products)).catch(() => setProducts([]));
  }, [gender, q]);

  const setGender = (g) => {
    const next = new URLSearchParams(params);
    g ? next.set('gender', g) : next.delete('gender');
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <div className="mb-10 text-center">
        <div className="brand-rule mx-auto mb-4" />
        <h1 className="font-serif text-4xl text-silver-100">The Collection</h1>
        <p className="mt-2 text-silver-500">{products ? `${products.length} fragrances` : ' '}</p>
      </div>

      <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
        {GENDERS.map(([value, label]) => (
          <button
            key={label}
            onClick={() => setGender(value)}
            className={`px-5 py-2 text-xs uppercase tracking-widest transition-colors ${
              gender === value
                ? 'bg-gold text-silver-100'
                : 'border border-ink-600 text-silver-400 hover:border-silver-400 hover:text-silver-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!products ? (
        <Spinner />
      ) : products.length === 0 ? (
        <p className="py-24 text-center text-silver-500">No fragrances found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
