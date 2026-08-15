// Shared helpers for shaping DB rows into API responses.

export function mapProduct(row, variants = []) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    gender: row.gender,
    family: row.family,
    tagline: row.tagline,
    description: row.description,
    notes: {
      top: safeParse(row.notes_top),
      middle: safeParse(row.notes_mid),
      base: safeParse(row.notes_base),
    },
    personality: row.personality,
    mood: row.mood,
    season: row.season,
    bestTime: row.best_time,
    image: row.image,
    featured: !!row.featured,
    active: !!row.active,
    variants: variants.map(mapVariant),
    priceFrom: variants.length ? Math.min(...variants.map((v) => v.price)) : null,
  };
}

export function mapVariant(v) {
  return { id: v.id, size: v.size, sku: v.sku, price: v.price, stock: v.stock };
}

function safeParse(json) {
  try {
    return JSON.parse(json) || [];
  } catch {
    return [];
  }
}

// Wrap async route handlers so rejected promises hit the error middleware.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
