// src/services/api.js - ClickBite API service
// Base: http://localhost:8080/api/v1

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

// Generic fetch wrapper
async function request(method, path, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(BASE_URL + path, options);

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || "Error " + res.status);
    err.status = res.status;
    throw err;
  }
  return data;
}

const get   = (path)       => request("GET",    path);
const post  = (path, body) => request("POST",   path, body);
const put   = (path, body) => request("PUT",    path, body);
const patch = (path, body) => request("PATCH",  path, body);
const del   = (path)       => request("DELETE", path);


// RESTAURANTS
export const restaurants = {
  getAll:     ()        => get("/restaurants"),
  getById:    (id)      => get("/restaurants/" + id),
  getByOwner: (userId)  => get("/restaurants/owner/" + userId),
  getNearby:  (lng, lat, maxDistance) =>
    get("/restaurants/nearby?lng=" + lng + "&lat=" + lat + "&max_distance=" + (maxDistance || 5000)),
  create:  (data)       => post("/restaurants", data),
  update:  (id, data)   => put("/restaurants/" + id, data),
  delete:  (id)         => del("/restaurants/" + id),
};


// USERS
export const users = {
  getAll:  ()         => get("/users"),
  getById: (id)       => get("/users/" + id),
  create:  (data)     => post("/users", data),
  update:  (id, data) => put("/users/" + id, data),
  delete:  (id)       => del("/users/" + id),

  // Login: match client-side (dev only) - TODO: replace with POST /auth/login once JWT added
  login: async (email, password) => {
    const all = await get("/users");
    const match = all.find(u => u.email === email && u.password === password);
    if (!match) throw new Error("Invalid email or password");
    return match;
  },
};


// MENU ITEMS
export const menuItems = {
  getAll:          ()             => get("/menu-items"),
  getById:         (id)           => get("/menu-items/" + id),
  getByRestaurant: (restaurantId) => get("/menu-items/restaurant/" + restaurantId),
  create:          (data)         => post("/menu-items", data),
  createBatch:     (restaurantId, items) => post("/menu-items/batch/" + restaurantId, items),
  update:          (id, data)     => put("/menu-items/" + id, data),
  delete:          (id)           => del("/menu-items/" + id),
};


// ORDERS
export const orders = {
  getAll:       ()           => get("/orders"),
  getById:      (id)         => get("/orders/" + id),
  getByUser:    (userId)     => get("/orders/user/" + userId),
  create:       (data)       => post("/orders", data),
  updateStatus: (id, status) => patch("/orders/" + id + "/status", { status }),
  delete:       (id)         => del("/orders/" + id),
};


// REVIEWS
export const reviews = {
  getAll:          ()             => get("/reviews"),
  getById:         (id)           => get("/reviews/" + id),
  getByRestaurant: (restaurantId) => get("/reviews/restaurant/" + restaurantId),
  create:          (data)         => post("/reviews", data),
  update:          (id, data)     => put("/reviews/" + id, data),
  delete:          (id)           => del("/reviews/" + id),
};


// ANALYTICS
export const analytics = {
  getTopRatedRestaurants: () => get("/analytics/top-restaurants"),
  getTopSellingItems:     () => get("/analytics/top-items"),
  getSalesByRestaurant:   () => get("/analytics/sales-by-restaurant"),
  getOrderSummaryByUser:  () => get("/analytics/orders-by-user"),
};


// HELPERS
export const helpers = {

  toLocation: (lng, lat) => ({
    type: "Point",
    coordinates: [parseFloat(lng), parseFloat(lat)],
  }),

  fromLocation: (location) => ({
    lng: location && location.coordinates ? location.coordinates[0] : null,
    lat: location && location.coordinates ? location.coordinates[1] : null,
  }),

  toContact: (phone, email) => ({ phone, email }),

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

  toRegisterPayload: ({ name, email, password, role }) => ({
    name,
    email,
    password,
    role:      role || "customer",
    is_active: true,
    delivery_address: { type: "Point", coordinates: [0, 0] },
    favorite_restaurants: [],
  }),

  toCreateRestaurantPayload: (form) => ({
    name:        form.name,
    description: form.description || "",
    categories:  [form.category],
    location:    { type: "Point", coordinates: [0, 0] },
    contact: {
      phone: form.phone,
      email: form.email,
    },
    owner_id:  form.ownerId || undefined,
    is_active: true,
  }),

  toCreateOwnerPayload: (form) => ({
    name:      form.ownerName,
    email:     form.ownerEmail,
    password:  form.ownerPassword,
    role:      "restaurant",
    is_active: true,
    delivery_address: { type: "Point", coordinates: [0, 0] },
    favorite_restaurants: [],
  }),

  toCreateMenuItemPayload: (restaurantId, item) => ({
    restaurant_id: restaurantId,
    name:          item.name,
    description:   item.description || "",
    price:         parseFloat(item.price),
    category:      item.category,
    is_available:  item.available !== false,
    stock:         item.stock || 99,
  }),

  toCreateOrderPayload: ({ userId, restaurantId, cartItems, deliveryPoint }) => {
    const items = cartItems.map(i => ({
      menu_item_id: i.id,
      name:         i.name,
      quantity:     i.qty,
      unit_price:   i.price,
      subtotal:     parseFloat((i.price * i.qty).toFixed(2)),
    }));
    const total = parseFloat(items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));
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

  toCreateReviewPayload: ({ userId, restaurantId, rating, comment }) => ({
    user_id:       userId,
    restaurant_id: restaurantId,
    rating:        parseFloat(rating),
    comment:       comment || "",
  }),

  toRestaurantCard: (r) => ({
    id:           r.id,
    name:         r.name,
    description:  r.description,
    categories:   r.categories || [],
    rating:       r.avg_rating || 0,
    totalReviews: r.total_reviews || 0,
    contact:      r.contact,
    location:     r.location,
    isActive:     r.is_active,
  }),

  toOrderCard: (o) => ({
    id:               o.id,
    restaurantId:     o.restaurant_id,
    items:            (o.items || []).map(i => ({
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

  toMenuItem: (m) => ({
    id:           m.id,
    restaurantId: m.restaurant_id,
    name:         m.name,
    description:  m.description,
    price:        m.price,
    category:     m.category,
    available:    m.is_available,
    stock:        m.stock,
    popular:      false,
    image:        "🍽️",
  }),
};


const api = { restaurants, users, menuItems, orders, reviews, analytics, helpers };
export default api;
