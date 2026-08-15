import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import Spinner from '../../components/Spinner';

const BLANK = {
  name: '', slug: '', gender: 'men', family: '', tagline: '', description: '',
  notesTop: '', notesMid: '', notesBase: '',
  personality: '', mood: '', season: '', bestTime: '', image: '',
  featured: false, active: true,
  variants: [
    { size: '50ml', price: 0, stock: 0 },
    { size: '30ml', price: 0, stock: 0 },
    { size: '10ml', price: 0, stock: 0 },
  ],
};

const slugify = (s) => s.toLowerCase().trim().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get('/admin/products').then((d) => {
      const p = d.products.find((x) => String(x.id) === String(id));
      if (!p) { setError('Product not found'); setLoading(false); return; }
      setForm({
        name: p.name, slug: p.slug, gender: p.gender, family: p.family || '',
        tagline: p.tagline || '', description: p.description || '',
        notesTop: (p.notes.top || []).join(', '),
        notesMid: (p.notes.middle || []).join(', '),
        notesBase: (p.notes.base || []).join(', '),
        personality: p.personality || '', mood: p.mood || '', season: p.season || '',
        bestTime: p.bestTime || '', image: p.image || '',
        featured: p.featured, active: p.active,
        variants: p.variants.map((v) => ({ id: v.id, size: v.size, price: v.price, stock: v.stock })),
      });
      setLoading(false);
    }).catch((e) => { setError(e.message); setLoading(false); });
  }, [id, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setVariant = (i, k, v) =>
    setForm((f) => ({ ...f, variants: f.variants.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)) }));
  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { size: '', price: 0, stock: 0 }] }));
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const toList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name, slug: form.slug || slugify(form.name), gender: form.gender,
      family: form.family, tagline: form.tagline, description: form.description,
      notes: { top: toList(form.notesTop), middle: toList(form.notesMid), base: toList(form.notesBase) },
      personality: form.personality, mood: form.mood, season: form.season, bestTime: form.bestTime,
      image: form.image, featured: form.featured, active: form.active,
      variants: form.variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        size: v.size, price: Number(v.price), stock: Number(v.stock),
      })),
    };
    try {
      if (editing) await api.put(`/admin/products/${id}`, payload);
      else await api.post('/admin/products', payload);
      navigate('/admin/products');
    } catch (err) {
      setError(err.details ? JSON.stringify(err.details.fieldErrors || err.details) : err.message);
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-serif text-3xl text-silver-100">{editing ? 'Edit Product' : 'New Product'}</h1>
      <form onSubmit={submit} className="space-y-6">
        <div className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Name"><input className="input" required value={form.name}
              onChange={(e) => { set('name', e.target.value); if (!editing) set('slug', slugify(e.target.value)); }} /></F>
            <F label="Slug (URL)"><input className="input" required value={form.slug} onChange={(e) => set('slug', e.target.value)} /></F>
            <F label="Gender">
              <select className="input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option>
              </select>
            </F>
            <F label="Family"><input className="input" value={form.family} onChange={(e) => set('family', e.target.value)} /></F>
            <F label="Image filename" hint="in /uploads/products/"><input className="input" placeholder="e.g. sea-view.jpg" value={form.image} onChange={(e) => set('image', e.target.value)} /></F>
            <F label="Tagline"><input className="input" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} /></F>
          </div>
          <F label="Description"><textarea rows={4} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} /></F>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="font-serif text-xl text-silver-100">Notes & Profile</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <F label="Top notes" hint="comma separated"><input className="input" value={form.notesTop} onChange={(e) => set('notesTop', e.target.value)} /></F>
            <F label="Heart notes" hint="comma separated"><input className="input" value={form.notesMid} onChange={(e) => set('notesMid', e.target.value)} /></F>
            <F label="Base notes" hint="comma separated"><input className="input" value={form.notesBase} onChange={(e) => set('notesBase', e.target.value)} /></F>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Season"><input className="input" value={form.season} onChange={(e) => set('season', e.target.value)} /></F>
            <F label="Mood"><input className="input" value={form.mood} onChange={(e) => set('mood', e.target.value)} /></F>
          </div>
          <F label="Best time to wear"><input className="input" value={form.bestTime} onChange={(e) => set('bestTime', e.target.value)} /></F>
          <F label="Personality"><textarea rows={2} className="input" value={form.personality} onChange={(e) => set('personality', e.target.value)} /></F>
        </div>

        <div className="card space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-silver-100">Variants</h2>
            <button type="button" onClick={addVariant} className="text-xs uppercase tracking-widest text-silver-400 hover:text-silver-100">+ Add</button>
          </div>
          {form.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-12 gap-3">
              <input className="input col-span-4" placeholder="Size" value={v.size} onChange={(e) => setVariant(i, 'size', e.target.value)} required />
              <input className="input col-span-3" type="number" min="0" placeholder="Price" value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} required />
              <input className="input col-span-3" type="number" min="0" placeholder="Stock" value={v.stock} onChange={(e) => setVariant(i, 'stock', e.target.value)} required />
              <button type="button" onClick={() => removeVariant(i)} disabled={form.variants.length <= 1} className="col-span-2 text-silver-600 hover:text-red-600 disabled:opacity-30">Remove</button>
            </div>
          ))}
        </div>

        <div className="card flex flex-wrap items-center gap-6 p-6">
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} /> Active (visible in store)
          </label>
        </div>

        {error && <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button disabled={saving} className="btn-silver">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}</button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function F({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label} {hint && <span className="lowercase text-silver-700">— {hint}</span>}</label>
      {children}
    </div>
  );
}
