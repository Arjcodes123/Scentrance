import { Router } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, mapProduct } from '../util.js';

const router = Router();
router.use(requireAdmin); // every route below is admin-only

const getVariants = db.prepare('SELECT * FROM variants WHERE product_id = ? ORDER BY price DESC');

/* ----------------------------- Dashboard stats ---------------------------- */
router.get('/stats', (_req, res) => {
  const revenue = db.prepare("SELECT COALESCE(SUM(total),0) AS v FROM orders WHERE status != 'cancelled'").get().v;
  const orders = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  const pending = db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'").get().c;
  const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  const customers = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'customer'").get().c;
  const lowStock = db
    .prepare(
      `SELECT p.name, v.size, v.stock FROM variants v
       JOIN products p ON p.id = v.product_id WHERE v.stock <= 5 ORDER BY v.stock ASC LIMIT 10`
    )
    .all();
  const recent = db.prepare('SELECT public_id, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5').all();
  res.json({ stats: { revenue, orders, pending, productCount, customers }, lowStock, recent });
});

/* -------------------------------- Products -------------------------------- */
router.get('/products', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json({ products: rows.map((r) => mapProduct(r, getVariants.all(r.id))) });
});

const variantSchema = z.object({
  id: z.number().int().optional(),
  size: z.string().trim().min(1).max(20),
  price: z.number().int().min(0),
  stock: z.number().int().min(0),
});
const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and dashes only').max(80),
  gender: z.enum(['men', 'women', 'unisex']),
  family: z.string().trim().max(60).optional().or(z.literal('')),
  tagline: z.string().trim().max(160).optional().or(z.literal('')),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  notes: z.object({ top: z.array(z.string()), middle: z.array(z.string()), base: z.array(z.string()) }).partial().optional(),
  personality: z.string().max(2000).optional().or(z.literal('')),
  mood: z.string().max(300).optional().or(z.literal('')),
  season: z.string().max(120).optional().or(z.literal('')),
  bestTime: z.string().max(400).optional().or(z.literal('')),
  image: z.string().max(200).optional().or(z.literal('')),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  variants: z.array(variantSchema).min(1).max(6),
});

function writeProduct(id, data) {
  const fields = {
    slug: data.slug,
    name: data.name,
    gender: data.gender,
    family: data.family || null,
    tagline: data.tagline || null,
    description: data.description || null,
    notes_top: JSON.stringify(data.notes?.top || []),
    notes_mid: JSON.stringify(data.notes?.middle || []),
    notes_base: JSON.stringify(data.notes?.base || []),
    personality: data.personality || null,
    mood: data.mood || null,
    season: data.season || null,
    best_time: data.bestTime || null,
    image: data.image || null,
    featured: data.featured ? 1 : 0,
    active: data.active === false ? 0 : 1,
  };
  if (id) {
    db.prepare(
      `UPDATE products SET slug=@slug, name=@name, gender=@gender, family=@family, tagline=@tagline,
        description=@description, notes_top=@notes_top, notes_mid=@notes_mid, notes_base=@notes_base,
        personality=@personality, mood=@mood, season=@season, best_time=@best_time, image=@image,
        featured=@featured, active=@active WHERE id=@id`
    ).run({ ...fields, id });
    return id;
  }
  const info = db
    .prepare(
      `INSERT INTO products (slug,name,gender,family,tagline,description,notes_top,notes_mid,notes_base,
        personality,mood,season,best_time,image,featured,active)
       VALUES (@slug,@name,@gender,@family,@tagline,@description,@notes_top,@notes_mid,@notes_base,
        @personality,@mood,@season,@best_time,@image,@featured,@active)`
    )
    .run(fields);
  return info.lastInsertRowid;
}

function syncVariants(productId, variants) {
  const existing = db.prepare('SELECT id FROM variants WHERE product_id = ?').all(productId).map((r) => r.id);
  const keep = new Set();
  for (const v of variants) {
    const sku = `${'' + db.prepare('SELECT slug FROM products WHERE id=?').get(productId).slug
      .toUpperCase().replace(/[^A-Z0-9]/g, '')}-${v.size.toUpperCase()}`;
    if (v.id && existing.includes(v.id)) {
      db.prepare('UPDATE variants SET size=?, price=?, stock=?, sku=? WHERE id=?').run(v.size, v.price, v.stock, sku, v.id);
      keep.add(v.id);
    } else {
      const info = db.prepare('INSERT INTO variants (product_id, size, sku, price, stock) VALUES (?,?,?,?,?)').run(productId, v.size, sku, v.price, v.stock);
      keep.add(info.lastInsertRowid);
    }
  }
  for (const id of existing) if (!keep.has(id)) db.prepare('DELETE FROM variants WHERE id = ?').run(id);
}

router.post(
  '/products',
  asyncHandler(async (req, res) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid product', details: parsed.error.flatten() });
    if (db.prepare('SELECT id FROM products WHERE slug = ?').get(parsed.data.slug))
      return res.status(409).json({ error: 'A product with that slug already exists' });

    const save = db.transaction(() => {
      const id = writeProduct(null, parsed.data);
      syncVariants(id, parsed.data.variants);
      return id;
    });
    const id = save();
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json({ product: mapProduct(row, getVariants.all(id)) });
  })
);

router.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!current) return res.status(404).json({ error: 'Product not found' });
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid product', details: parsed.error.flatten() });

    const clash = db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').get(parsed.data.slug, id);
    if (clash) return res.status(409).json({ error: 'Another product already uses that slug' });

    const save = db.transaction(() => {
      writeProduct(id, parsed.data);
      syncVariants(id, parsed.data.variants);
    });
    save();
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({ product: mapProduct(row, getVariants.all(id)) });
  })
);

router.delete('/products/:id', (req, res) => {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true });
});

/* --------------------------------- Orders --------------------------------- */
router.get('/orders', (req, res) => {
  const { status } = req.query;
  const rows = status
    ? db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(String(status))
    : db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  res.json({ orders: rows.map((o) => ({ ...o, items: getItems.all(o.id) })) });
});

const statusSchema = z.object({ status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']) });
router.patch(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid status' });
    const info = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(parsed.data.status, Number(req.params.id));
    if (!info.changes) return res.status(404).json({ error: 'Order not found' });
    res.json({ ok: true, status: parsed.data.status });
  })
);

export default router;
