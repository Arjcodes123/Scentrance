import { Router } from 'express';
import db from '../db.js';
import { mapProduct } from '../util.js';

const router = Router();

const getVariants = db.prepare('SELECT * FROM variants WHERE product_id = ? ORDER BY price DESC');

// GET /api/products?gender=&family=&q=&featured=&sort=
router.get('/', (req, res) => {
  const { gender, family, q, featured, sort } = req.query;
  const where = ['active = 1'];
  const params = {};
  if (gender) { where.push('gender = @gender'); params.gender = String(gender); }
  if (family) { where.push('family = @family'); params.family = String(family); }
  if (featured === 'true') where.push('featured = 1');
  if (q) { where.push('(name LIKE @q OR description LIKE @q OR family LIKE @q)'); params.q = `%${q}%`; }

  let order = 'created_at DESC';
  if (sort === 'name') order = 'name ASC';

  const rows = db.prepare(`SELECT * FROM products WHERE ${where.join(' AND ')} ORDER BY ${order}`).all(params);
  const products = rows.map((r) => mapProduct(r, getVariants.all(r.id)));
  res.json({ products });
});

router.get('/families', (_req, res) => {
  const rows = db.prepare("SELECT DISTINCT family FROM products WHERE active = 1 AND family IS NOT NULL ORDER BY family").all();
  res.json({ families: rows.map((r) => r.family) });
});

router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE slug = ? AND active = 1').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  const product = mapProduct(row, getVariants.all(row.id));

  // A few "you may also like" picks from the same gender.
  const related = db
    .prepare('SELECT * FROM products WHERE gender = ? AND id != ? AND active = 1 ORDER BY RANDOM() LIMIT 4')
    .all(row.gender, row.id)
    .map((r) => mapProduct(r, getVariants.all(r.id)));

  res.json({ product, related });
});

export default router;
