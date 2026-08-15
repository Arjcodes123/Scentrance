import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';
import { products } from './products.data.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@scentrances.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

console.log('Seeding database...');

const reset = db.transaction(() => {
  db.exec('DELETE FROM order_items; DELETE FROM orders; DELETE FROM variants; DELETE FROM products;');

  const insProduct = db.prepare(`
    INSERT INTO products
      (slug, name, gender, family, tagline, description, notes_top, notes_mid, notes_base,
       personality, mood, season, best_time, image, featured, active)
    VALUES
      (@slug, @name, @gender, @family, @tagline, @description, @notes_top, @notes_mid, @notes_base,
       @personality, @mood, @season, @best_time, @image, @featured, 1)
  `);
  const insVariant = db.prepare(
    'INSERT INTO variants (product_id, size, sku, price, stock) VALUES (?, ?, ?, ?, ?)'
  );

  for (const p of products) {
    const info = insProduct.run({
      ...p,
      notes_top: JSON.stringify(p.notes_top),
      notes_mid: JSON.stringify(p.notes_mid),
      notes_base: JSON.stringify(p.notes_base),
      featured: p.featured ? 1 : 0,
    });
    const productId = info.lastInsertRowid;
    p.variants.forEach((v, i) => {
      const sku = `${p.slug.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${v.size.toUpperCase()}`;
      insVariant.run(productId, v.size, sku, v.price, v.stock ?? 0);
    });
  }
});
reset();
console.log(`  • inserted ${products.length} products with variants`);

// Admin user (upsert)
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL);
const hash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
if (existing) {
  db.prepare('UPDATE users SET password = ?, role = ? WHERE id = ?').run(hash, 'admin', existing.id);
  console.log(`  • updated admin user ${ADMIN_EMAIL}`);
} else {
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Administrator', ADMIN_EMAIL, hash, 'admin'
  );
  console.log(`  • created admin user ${ADMIN_EMAIL}`);
}

console.log('Done. Admin login:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
process.exit(0);
