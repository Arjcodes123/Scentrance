import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-700 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="font-serif text-2xl text-silver-100">Scentrances</h3>
          <p className="mt-1 text-[9px] uppercase tracking-brand text-silver-600">Signature Fragrances</p>
          <p className="mt-4 max-w-xs text-sm text-silver-500">
            Crafted compositions for those who leave an impression long after they’ve left the room.
          </p>
        </div>
        <FooterCol title="Shop" links={[
          ['All Fragrances', '/shop'],
          ['For Him', '/shop?gender=men'],
          ['For Her', '/shop?gender=women'],
          ['Unisex', '/shop?gender=unisex'],
        ]} />
        <FooterCol title="Company" links={[
          ['Our Story', '/shop'],
          ['Contact', '/shop'],
          ['Track Order', '/account'],
        ]} />
        <div>
          <h4 className="label">Stay in the know</h4>
          <p className="mb-3 text-sm text-silver-500">New releases and private offers.</p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <input className="input rounded-r-none" placeholder="Email address" type="email" />
            <button className="btn-silver rounded-l-none px-4">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-ink-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-silver-600 md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Scentrances. All rights reserved.</p>
          <p>Cash on Delivery · Free shipping over Rs 5,000</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="label">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-silver-400 hover:text-silver-100">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
