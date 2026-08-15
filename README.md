# Scentrances — E-commerce Store

A full-stack perfume store for the **Scentrances** brand, in a black & silver theme.
Storefront + customer accounts + cart/checkout + a complete admin dashboard.

- **Frontend:** React 18 + Vite + React Router + Tailwind CSS
- **Backend:** Node/Express + SQLite (better-sqlite3)
- **Auth:** JWT in httpOnly cookies, bcrypt password hashing, role-based access (customer / admin)
- **Security:** Helmet headers, CORS lock, rate limiting, Zod input validation, parameterised SQL, server-side price calculation

```
scentrances/
├── server/   Express API + SQLite database + product seed + images
└── client/   React storefront and admin dashboard
```

## Quick start

You need **Node 18+**. From the `scentrances/` folder:

```bash
# 1. Install dependencies for both apps
npm run install:all          # or: cd server && npm i  then  cd client && npm i

# 2. Configure the server (already copied for you in dev)
#    Edit server/.env and change JWT_SECRET + ADMIN_PASSWORD before deploying.

# 3. Seed the database (12 products, variants, admin user)
npm run seed

# 4a. Run both apps together (needs `npm install` at root for concurrently)
npm install
npm run dev

# 4b. …or run them in two terminals
npm run dev:server           # http://localhost:4000  (API)
npm run dev:client           # http://localhost:5173  (store)
```

Open **http://localhost:5173**.

## Logins

| Role  | Email                     | Password      |
|-------|---------------------------|---------------|
| Admin | `admin@scentrances.com`   | `Admin@12345` |

Customers self-register at `/register`. The admin dashboard lives at **`/admin`**
(only accounts with the `admin` role can reach it).

> Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env` and re-run `npm run seed`
> to set your own admin credentials.

## Features

**Storefront**
- Home with hero + featured fragrances
- Shop with For Him / For Her / Unisex filters
- A dedicated page per product (`/product/:slug`) with the notes pyramid, variant
  picker, personality/mood/season meta and "you may also like"
- Cart (persisted in localStorage), checkout (Cash on Delivery), order confirmation
- Customer accounts with order history

**Admin dashboard** (`/admin`)
- Stats: revenue, orders, pending, products, customers, low-stock alerts
- Product CRUD — create/edit/delete with variants, notes and visibility toggles
- Order management — view details, change status (pending → delivered / cancelled)

## Catalogue notes

- 12 fragrances, each in **3 sizes** (50ml / 30ml / 10ml) with prices scaled from the 50ml base.
- Descriptions for **Boom Boom** and **Deenar** were written to match their imagery/notes
  (the rest use the brand's supplied copy).
- **Zahra** uses the higher-quality of its two supplied images.
- *Scent of Empire* from the original copy is **not** included — no product image was supplied.
  Add it any time from the admin dashboard once you have a photo.

## Editing products & images

Product images live in `server/uploads/products/`. To add a new perfume:
1. Drop the image file into `server/uploads/products/` (e.g. `my-scent.jpg`).
2. In the admin dashboard, **New Product** → set the *Image filename* to `my-scent.jpg`.

## Before going live (production checklist)

- Set a strong random `JWT_SECRET` and a real `ADMIN_PASSWORD` in `server/.env`.
- Set `NODE_ENV=production` (enables `secure` cookies — serve over HTTPS).
- Point `CLIENT_ORIGIN` at your deployed frontend URL.
- Build the client (`npm run build`) and serve `client/dist` behind your web server/CDN.
- Consider a managed DB and an image/object store if traffic grows; SQLite is great to start.
