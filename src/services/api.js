// ─────────────────────────────────────────────────────────────────────────────
// src/services/api.js — ClickBite API service
// Base: http://localhost:8080/api/v1
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

// ── Generic fetch wrapper ─────────────────────────────────────────────────────
async function request(method, path, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

const get   = (path)       => request("GET",    path);
const post  = (path, body) => request("POST",   path, body);
const put   = (path, body) => request("PUT",    path, body);
const patch = (path, body) => request("PATCH",  path, body);
const del   = (path)       => request("DELETE", path);


// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANTS
// { id, name, description, categories[], location, contact,
//   avg_rating, total_reviews, is_active, created_at }
// location / contact → see helpers.toLocation / toContact
// ─────────────────────────────────────────────────────────────────────────────
export const restaurants = {
  getAll:    ()           => get("/restaurants"),
  getById:   (id)         => get(`/restaurants/${id}`),
  getNearby: (lng, lat, maxDistance = 5000) =>
    get(`/restaurants/nearby?lng=${lng}&lat=${lat}&max_distance=${maxDistance}`),
  // body: { name, description, categories[], location, contact, is_active }
  create:    (data)       => post("/restaurants", data),
  // body: same as create
  update:    (id, data)   => put(`/restaurants/${id}`, data),
  delete:    (id)         => del(`/restaurants/${id}`),
};


// ─────────────────────────────────────────────────────────────────────────────
// USERS
// { id, name, email, password, role, delivery_address,
//   favorite_restaurants[], created_at, is_active }
// role: "customer" | "restaurant" | "admin"
// ─────────────────────────────────────────────────────────────────────────────
export const users = {
  getAll:  ()         => get("/users"),
  getById: (id)       => get(`/users/${id}`),
  // body: { name, email, password, role, delivery_address, is_active }
  create:  (data)     => post("/users", data),
  // body: same as create (partial fields OK)
  update:  (id, data) => put(`/users/${id}`, data),
  delete:  (id)       => del(`/users/${id}`),

  // ── Login: no /auth endpoint yet — match client-side (dev only)
  // TODO: replace with POST /auth/login once JWT is added
  login: async (email, password) => {
    const all = await get("/users");
    const match = all.find(u => u.email === email && u.password === password);
    if (!match) throw new Error("Invalid email or password");
    return match;
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// MENU ITEMS
// { id, restaurant_id, name, description, price, category,
//   is_available, stock, image_file_id, created_at }
// Note: no is_popular field in backend — popular is derived from analytics
// Note: image_file_id references GridFS (file upload — out of scope for now)
// ─────────────────────────────────────────────────────────────────────────────
export const menuItems = {
  getAll:         ()              => get("/menu-items"),
  getById:        (id)            => get(`/menu-items/${id}`),
  getByRestaurant:(restaurantId)  => get(`/menu-items/restaurant/${restaurantId}`),
  // body: { restaurant_id, name, description, price, category, is_available, stock }
  create:         (data)          => post("/menu-items", data),
  // body: same as create
  update:         (id, data)      => put(`/menu-items/${id}`, data),
  delete:         (id)            => del(`/menu-items/${id}`),
};


// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// { id, user_id, restaurant_id, items[], total, status,
//   delivery_location, created_at, updated_at }
//
// items[]: { menu_item_id, name, quantity, unit_price, subtotal }
// status:  "pending" | "confirmed" | "preparing" | "on_the_way" | "delivered" | "cancelled"
// delivery_location: { type: "Point", coordinates: [lng, lat] }
// ─────────────────────────────────────────────────────────────────────────────
export const orders = {
  getAll:       ()           => get("/orders"),
  getById:      (id)         => get(`/orders/${id}`),
  getByUser:    (userId)     => get(`/orders/user/${userId}`),
  // body: { user_id, restaurant_id, items[], total, delivery_location }
  create:       (data)       => post("/orders", data),
  // body: { status }
  updateStatus: (id, status) => patch(`/orders/${id}/status`, { status }),
  delete:       (id)         => del(`/orders/${id}`),
};


// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// { id, user_id, restaurant_id, rating, comment, created_at, updated_at }
// Note: no order_id, no tags[] in backend model
// ─────────────────────────────────────────────────────────────────────────────
export const reviews = {
  getAll:      ()             => get("/reviews"),
  getById:        (id)           => get(`/reviews/${id}`),
  getByRestaurant:(restaurantId) => get(`/reviews/restaurant/${restaurantId}`),
  // body: { user_id, restaurant_id, rating, comment }
  create:         (data)         => post("/reviews", data),
  // body: same as create
  update:         (id, data)     => put(`/reviews/${id}`, data),
  delete:         (id)           => del(`/reviews/${id}`),
};


// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS  (aggregation pipelines)
// ─────────────────────────────────────────────────────────────────────────────
export const analytics = {
  // Pipeline 1: reviews → $group $avg → $lookup restaurants → $sort → $limit
  getTopRatedRestaurants: () => get("/analytics/top-restaurants"),

  // Pipeline 2: orders → $unwind items → $group menu_item_id → $sum quantity → $sort
  getTopSellingItems:     () => get("/analytics/top-items"),

  // Pipeline 3: orders → $match delivered → $group restaurant_id → $sum total → $sort
  getSalesByRestaurant:   () => get("/analytics/sales-by-restaurant"),

  // Pipeline 4: orders → $group user_id → $sum count + $sum total
  getOrderSummaryByUser:  () => get("/analytics/orders-by-user"),
};


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — shape converters frontend ↔ backend
// ─────────────────────────────────────────────────────────────────────────────
export const helpers = {

  // ── Location ──────────────────────────────────────────────────────────────
  toLocation: (lng, lat) => ({
    type: "Point",
    coordinates: [parseFloat(lng), parseFloat(lat)],
  }),

  fromLocation: (location) => ({
    lng: location?.coordinates?.[0] ?? null,
    lat: location?.coordinates?.[1] ?? null,
  }),

  // ── Contact ───────────────────────────────────────────────────────────────
  toContact: (phone, email) => ({ phone, email }),

  // ── Session (localStorage) ────────────────────────────────────────────────
  saveSession: (user) => {
    localStorage.setItem("cb_user", JSON.stringify({
      id:       user.id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      isActive: user.is_active,
    }));
  },

  getSession: () => {
    try {
      const raw = localStorage.getItem("cb_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearSession: () => localStorage.removeItem("cb_user"),

  // ── Register payload ──────────────────────────────────────────────────────
  // Used in Login.jsx register form → POST /users
  toRegisterPayload: ({ name, email, password, role }) => ({
    name,
    email,
    password,
    role:      role ?? "customer",
    is_active: true,
    delivery_address: { type: "Point", coordinates: [0, 0] },
    favorite_restaurants: [],
  }),

  // ── Create restaurant payload (admin wizard step 0) ───────────────────────
  // POST /restaurants
  toCreateRestaurantPayload: (form) => ({
    name:        form.name,
    description: form.description || "",
    categories:  [form.category],
    location:    { type: "Point", coordinates: [0, 0] },
    contact: {
      phone: form.phone,
      email: form.email,
    },
    is_active: true,
  }),

  // ── Create owner payload (admin wizard step 1) ────────────────────────────
  // POST /users  (role: "restaurant")
  toCreateOwnerPayload: (form) => ({
    name:      form.ownerName,
    email:     form.ownerEmail,
    password:  form.ownerPassword,
    role:      "restaurant",
    is_active: true,
    delivery_address: { type: "Point", coordinates: [0, 0] },
    favorite_restaurants: [],
  }),

  // ── Create menu item payload (admin wizard step 2 / restaurant CRUD) ──────
  // POST /menu-items
  // Note: image_file_id is omitted — image upload is out of scope for now
  toCreateMenuItemPayload: (restaurantId, item) => ({
    restaurant_id: restaurantId,
    name:          item.name,
    description:   item.description || "",
    price:         parseFloat(item.price),
    category:      item.category,
    is_available:  item.available !== false,
    stock:         item.stock ?? 99,
  }),

  // ── Order payload ─────────────────────────────────────────────────────────
  // POST /orders
  // cartItems: array from Menu.jsx cart state
  // deliveryPoint: selected point { lat, lng } from OrderConfirm.jsx
  toCreateOrderPayload: ({ userId, restaurantId, cartItems, deliveryPoint }) => {
    const items = cartItems.map(i => ({
      menu_item_id: i.id,
      name:         i.name,
      quantity:     i.qty,
      unit_price:   i.price,
      subtotal:     parseFloat((i.price * i.qty).toFixed(2)),
    }));

    const total = parseFloat(
      items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)
    );

    return {
      user_id:       userId,
      restaurant_id: restaurantId,
      items,
      total,
      delivery_location: {
        type: "Point",
        coordinates: [deliveryPoint.lng, deliveryPoint.lat],
      },
    };
  },

  // ── Review payload ────────────────────────────────────────────────────────
  // POST /reviews
  // Note: no order_id or tags in backend model
  toCreateReviewPayload: ({ userId, restaurantId, rating, comment }) => ({
    user_id:       userId,
    restaurant_id: restaurantId,
    rating:        parseFloat(rating),
    comment:       comment || "",
  }),

  // ── Map backend restaurant → frontend card ────────────────────────────────
  toRestaurantCard: (r) => ({
    id:           r.id,
    name:         r.name,
    description:  r.description,
    categories:   r.categories ?? [],
    rating:       r.avg_rating ?? 0,
    totalReviews: r.total_reviews ?? 0,
    contact:      r.contact,
    location:     r.location,
    isActive:     r.is_active,
  }),

  // ── Map backend order → frontend card ────────────────────────────────────
  toOrderCard: (o) => ({
    id:               o.id,
    restaurantId:     o.restaurant_id,
    items:            (o.items ?? []).map(i => ({
      id:       i.menu_item_id,
      name:     i.name,
      qty:      i.quantity,
      price:    i.unit_price,
      subtotal: i.subtotal,
    })),
    total:            o.total,
    status:           o.status,
    deliveryLocation: o.delivery_location,
    createdAt:        o.created_at,
    updatedAt:        o.updated_at,
  }),

  // ── Map backend menu item → frontend item ────────────────────────────────
  toMenuItem: (m) => ({
    id:           m.id,
    restaurantId: m.restaurant_id,
    name:         m.name,
    description:  m.description,
    price:        m.price,
    category:     m.category,
    available:    m.is_available,
    stock:        m.stock,
    popular:      false, // derived from analytics/top-items, not stored in model
    image:        "🍽️",  // no emoji in backend — placeholder until image upload
  }),
};


// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────────────────────
const api = { restaurants, users, menuItems, orders, reviews, analytics, helpers };
export default api;
