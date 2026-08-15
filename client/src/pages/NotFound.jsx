import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <p className="font-serif text-7xl text-silver-700">404</p>
      <h1 className="mt-4 font-serif text-3xl text-silver-100">Page not found</h1>
      <p className="mt-2 text-silver-500">The scent you’re looking for has drifted away.</p>
      <Link to="/" className="btn-silver mt-8">Back to Home</Link>
    </div>
  );
}
