import { Router } from 'express';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
import db from '../db.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../util.js';

const router = Router();
const orderId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

const FREE_SHIPPING_THRESHOLD = 5000; // PKR
const SHIPPING_FLAT = 250;

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email(),
    phone: z.string().trim().min(7).max(20),
    address: z.string().trim().min(5).max(200),
    city: z.string().trim().min(2).max(60),
    postalCode: z.string().trim().max(15).optional().or(z.literal('')),
  }),
  items: z
    .array(z.object({ variantId: z.number().int().positive(), quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(50),
});

// POST /api/orders — place an order (guest or logged in). Prices come from the DB, never the client.
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid order', details: parsed.error.flatten() });
    const { customer, items } = parsed.data;

    const getVariant = db.prepare(
      `SELECT v.*, p.name AS product_name, p.image AS image
       FROM variants v JOIN products p ON p.id = v.product_id
       WHERE v.id = ? AND p.active = 1`
    );

    const place = db.transaction(() => {
      const lines = [];
      let subtotal = 0;
      for (const item of items) {
        const v = getVariant.get(item.variantId);
        if (!v) throw httpError(400, `A product in your cart is no longer available`);
        if (v.stock < item.quantity) throw httpError(409, `Only ${v.stock} left of ${v.product_name} (${v.size})`);
        subtotal += v.price * item.quantity;
        lines.push({ v, qty: item.quantity });
      }

      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
      const total = subtotal + shipping;
      const publicId = 'SC-' + orderId();

      const info = db
        .prepare(
          `INSERT INTO orders
            (public_id, user_id, customer_name, email, phone, address, city, postal_code,
             subtotal, shipping, total, status, payment)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
        )
        .run(
          publicId,
          req.user?.id ?? null,
          customer.name,
          customer.email,
          customer.phone,
          customer.address,
          customer.city,
          customer.postalCode || null,
          subtotal,
          shipping,
          total,
          'pending',
          'cod'
        );

      const insItem = db.prepare(
        `INSERT INTO order_items (order_id, variant_id, product_name, size, unit_price, quantity, image)
         VALUES (?,?,?,?,?,?,?)`
      );
      const decStock = db.prepare('UPDATE variants SET stock = stock - ? WHERE id = ?');
      for (const { v, qty } of lines) {
        insItem.run(info.lastInsertRowid, v.id, v.product_name, v.size, v.price, qty, v.image);
        decStock.run(qty, v.id);
      }
      return { publicId, subtotal, shipping, total };
    });

    try {
      const result = place();
      res.status(201).json({ order: result });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      throw err;
    }
  })
);

// GET /api/orders/mine — order history for the logged-in user
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = db
      .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.user.id);
    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    res.json({ orders: orders.map((o) => ({ ...o, items: getItems.all(o.id) })) });
  })
);

// GET /api/orders/:publicId — track a single order (must own it, or be admin)
router.get(
  '/:publicId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE public_id = ?').get(req.params.publicId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const isOwner = req.user && order.user_id === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';
    if (order.user_id && !isOwner && !isAdmin) return res.status(403).json({ error: 'Not allowed' });
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ order: { ...order, items } });
  })
);

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

export default router;
