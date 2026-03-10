import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { helpers, menuItems as menuItemsApi, restaurants as restaurantsApi } from "../services/api";

const CATEGORY_STYLE = {
  Burgers: { image: "🍔", color: "#f97316" },
  Pizza:   { image: "🍕", color: "#ef4444" },
  Sushi:   { image: "🍣", color: "#8b5cf6" },
  Mexican: { image: "🌮", color: "#f59e0b" },
  Asian:   { image: "🍜", color: "#06b6d4" },
  Healthy: { image: "🥗", color: "#22c55e" },
  Chicken: { image: "🍗", color: "#ec4899" },
  Italian: { image: "🍝", color: "#a78bfa" },
  Indian:  { image: "🍛", color: "#fb923c" },
  Default: { image: "🍽️", color: "#52c49b" },
};

export default function Menu() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const restaurantId = location.state?.restaurantId;

  const [restaurant,     setRestaurant]     = useState(null);
  const [menuItems,      setMenuItems]      = useState([]);
  const [categories,     setCategories]     = useState(["All"]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart,           setCart]           = useState({}); // { itemId: quantity }
  const [cartOpen,       setCartOpen]       = useState(false);

  // ── Fetch restaurant + menu items ────────────────────────────────────────
  useEffect(() => {
    if (!restaurantId) { setError("No restaurant selected."); setLoading(false); return; }

    Promise.all([
      restaurantsApi.getById(restaurantId),
      menuItemsApi.getByRestaurant(restaurantId),
    ])
      .then(([rest, items]) => {
        setRestaurant(rest);
        const mapped = (items ?? []).map(helpers.toMenuItem);
        setMenuItems(mapped);
        const cats = ["All", ...new Set(mapped.map(i => i.category).filter(Boolean))];
        setCategories(cats);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  // ── Helpers de carrito ──
  const addToCart = (itemId) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) updated[itemId]--;
      else delete updated[itemId];
      return updated;
    });
  };

  const cartItems = Object.entries(cart).map(([id, qty]) => ({
    ...menuItems.find(i => i.id === id),
    qty,
  }));

  const cartTotal = cartItems.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const filteredItems = activeCategory === "All"
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory);

  const handleConfirmOrder = () => {
    if (cartItems.length === 0) return;
    navigate("/confirm", {
      state: {
        restaurantId,
        restaurantName: restaurant?.name,
        cartItems,
        cartTotal,
      },
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mn-page {
          min-height: 100vh;
          background: #0d1117;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* ── NAVBAR ── */
        .mn-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 64px;
          background: #111820;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 200;
        }

        .mn-nav-back {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
        }

        .mn-nav-back:hover { color: #52c49b; }

        .mn-nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: #52c49b;
          letter-spacing: -0.5px;
        }

        .mn-nav-logo span { color: #fff; }

        .mn-cart-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 18px;
          background: #52c49b;
          border: none;
          border-radius: 10px;
          color: #0d1f1c;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .mn-cart-btn:hover { background: #63d4ab; transform: translateY(-1px); }
        .mn-cart-btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); transform: none; cursor: default; }

        .mn-cart-badge {
          background: #0d1f1c;
          color: #52c49b;
          font-size: 0.75rem;
          font-weight: 700;
          width: 20px; height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── RESTAURANT HEADER ── */
        .mn-header {
          padding: 36px 40px 0;
          display: flex;
          align-items: flex-start;
          gap: 24px;
        }

        .mn-header-emoji {
          width: 80px; height: 80px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.4rem;
          flex-shrink: 0;
        }

        .mn-header-info { flex: 1; }

        .mn-header-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .mn-header-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }

        .mn-open-badge {
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .mn-open-badge.open { background: rgba(82,196,155,0.15); color: #52c49b; border: 1px solid rgba(82,196,155,0.3); }
        .mn-open-badge.closed { background: rgba(224,92,92,0.15); color: #e05c5c; border: 1px solid rgba(224,92,92,0.3); }

        .mn-header-desc {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.4);
          margin-bottom: 12px;
          font-weight: 300;
          max-width: 500px;
        }

        .mn-header-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .mn-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.4);
        }

        .mn-meta-item strong { color: rgba(255,255,255,0.75); }

        /* ── DIVIDER ── */
        .mn-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 28px 40px 0;
        }

        /* ── LAYOUT ── */
        .mn-body {
          display: flex;
          gap: 0;
          padding: 0 40px 60px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* ── SIDEBAR CATEGORIES ── */
        .mn-sidebar {
          width: 180px;
          min-width: 180px;
          padding-top: 32px;
          position: sticky;
          top: 64px;
          height: calc(100vh - 64px);
          overflow-y: auto;
        }

        .mn-sidebar-title {
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
          padding-left: 4px;
        }

        .mn-cat-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 9px 12px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: rgba(255,255,255,0.45);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.18s;
          margin-bottom: 2px;
        }

        .mn-cat-item:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); }

        .mn-cat-item.active {
          background: rgba(82,196,155,0.1);
          color: #52c49b;
          font-weight: 600;
        }

        /* ── ITEMS GRID ── */
        .mn-content { flex: 1; padding-top: 32px; padding-left: 32px; }

        .mn-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .mn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
          margin-bottom: 36px;
        }

        /* ── ITEM CARD ── */
        .mn-card {
          background: #111820;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.22s;
          display: flex;
          flex-direction: column;
          animation: fadeUp 0.3s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mn-card:hover {
          border-color: rgba(82,196,155,0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }

        .mn-card-img {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.6rem;
          position: relative;
        }

        .mn-popular-tag {
          position: absolute;
          top: 8px; left: 8px;
          padding: 3px 8px;
          background: rgba(251,191,36,0.15);
          border: 1px solid rgba(251,191,36,0.3);
          border-radius: 999px;
          font-size: 0.68rem;
          font-weight: 600;
          color: #fbbf24;
          letter-spacing: 0.04em;
        }

        .mn-card-body {
          padding: 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .mn-card-name {
          font-family: 'Syne', sans-serif;
          font-size: 0.98rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }

        .mn-card-desc {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.4;
          font-weight: 300;
          flex: 1;
          margin-bottom: 14px;
        }

        .mn-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mn-card-price {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #52c49b;
        }

        /* ── QTY CONTROLS ── */
        .mn-qty {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mn-qty-btn {
          width: 28px; height: 28px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          line-height: 1;
        }

        .mn-qty-btn:hover { background: rgba(82,196,155,0.15); border-color: #52c49b; color: #52c49b; }

        .mn-qty-btn.add-first {
          width: auto;
          padding: 0 14px;
          background: rgba(82,196,155,0.1);
          border-color: rgba(82,196,155,0.3);
          color: #52c49b;
          font-size: 0.82rem;
          font-weight: 600;
          gap: 4px;
        }

        .mn-qty-btn.add-first:hover { background: #52c49b; color: #0d1f1c; }

        .mn-qty-num {
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          min-width: 16px;
          text-align: center;
        }

        /* ── CART DRAWER ── */
        .mn-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 300;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .mn-drawer {
          position: fixed;
          top: 0; right: 0;
          width: 380px;
          height: 100vh;
          background: #111820;
          border-left: 1px solid rgba(255,255,255,0.08);
          z-index: 400;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.25s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .mn-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .mn-drawer-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
        }

        .mn-drawer-close {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .mn-drawer-close:hover { background: rgba(255,255,255,0.06); color: #fff; }

        .mn-drawer-items {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }

        .mn-drawer-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .mn-drawer-item-emoji {
          font-size: 1.6rem;
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mn-drawer-item-info { flex: 1; }

        .mn-drawer-item-name {
          font-size: 0.88rem;
          font-weight: 500;
          color: #fff;
          margin-bottom: 2px;
        }

        .mn-drawer-item-price {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
        }

        .mn-drawer-item-qty { display: flex; align-items: center; gap: 8px; }

        .mn-drawer-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .mn-drawer-summary {
          margin-bottom: 16px;
        }

        .mn-drawer-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          margin-bottom: 6px;
        }

        .mn-drawer-row.total {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .mn-drawer-row.total span:last-child { color: #52c49b; }

        .mn-checkout-btn {
          width: 100%;
          padding: 14px;
          background: #52c49b;
          border: none;
          border-radius: 10px;
          color: #0d1f1c;
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mn-checkout-btn:hover { background: #63d4ab; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(82,196,155,0.3); }

        .mn-empty-cart {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.2);
          gap: 10px;
          padding: 40px;
          text-align: center;
        }

        .mn-empty-cart-icon { font-size: 2.5rem; }
        .mn-empty-cart p { font-size: 0.88rem; line-height: 1.5; }

        /* ── RESPONSIVE ── */
        @media (max-width: 700px) {
          .mn-nav { padding: 0 20px; }
          .mn-header { padding: 24px 20px 0; }
          .mn-divider { margin: 20px 20px 0; }
          .mn-body { padding: 0 20px 60px; flex-direction: column; }
          .mn-sidebar { width: 100%; min-width: unset; height: auto; position: static; padding-top: 20px; display: flex; gap: 6px; flex-wrap: wrap; }
          .mn-sidebar-title { display: none; }
          .mn-content { padding-left: 0; padding-top: 20px; }
          .mn-drawer { width: 100%; }
        }
      `}</style>

      <div className="mn-page">

        {/* LOADING / ERROR */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
            ⏳ Loading menu…
          </div>
        )}
        {error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12, fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: "2rem" }}>⚠️</div>
            <div style={{ color: "#e05c5c" }}>{error}</div>
            <button onClick={() => navigate("/restaurants")} style={{ marginTop: 8, padding: "10px 20px", background: "#52c49b", border: "none", borderRadius: 8, color: "#0d1f1c", fontWeight: 700, cursor: "pointer" }}>← Back to restaurants</button>
          </div>
        )}
        {!loading && !error && restaurant && (<>

        {/* NAVBAR */}
        <nav className="mn-nav">
          <button className="mn-nav-back" onClick={() => navigate("/restaurants")}>
            ← Back
          </button>
          <div className="mn-nav-logo">Click<span>Bite</span></div>
          <button
            className="mn-cart-btn"
            onClick={() => setCartOpen(true)}
            disabled={cartCount === 0}
          >
            🛒 Cart
            {cartCount > 0 && <span className="mn-cart-badge">{cartCount}</span>}
          </button>
        </nav>

        {/* RESTAURANT HEADER */}
        <div className="mn-header">
          <div className="mn-header-emoji"
            style={{ background: "linear-gradient(135deg, " + (CATEGORY_STYLE[restaurant.categories?.[0]] ?? CATEGORY_STYLE.Default).color + "33, " + (CATEGORY_STYLE[restaurant.categories?.[0]] ?? CATEGORY_STYLE.Default).color + "66)" }}
          >
            {(CATEGORY_STYLE[restaurant.categories?.[0]] ?? CATEGORY_STYLE.Default).image}
          </div>
          <div className="mn-header-info">
            <div className="mn-header-top">
              <h1 className="mn-header-name">{restaurant.name}</h1>
              <span className={"mn-open-badge " + (restaurant.is_active ? "open" : "closed")}>
                {restaurant.is_active ? "● Open" : "● Closed"}
              </span>
            </div>
            <p className="mn-header-desc">{restaurant.description}</p>
            <div className="mn-header-meta">
              <span className="mn-meta-item">⭐ <strong>{(restaurant.avg_rating ?? 0).toFixed(1)}</strong> ({restaurant.total_reviews ?? 0} reviews)</span>
              <span className="mn-meta-item">📞 <strong>{restaurant.contact?.phone ?? "—"}</strong></span>
              <span className="mn-meta-item">✉️ <strong>{restaurant.contact?.email ?? "—"}</strong></span>
            </div>
          </div>
        </div>

        <div className="mn-divider" />

        {/* BODY */}
        <div className="mn-body">

          {/* SIDEBAR */}
          <aside className="mn-sidebar">
            <div className="mn-sidebar-title">Menu</div>
            {categories.map(cat => (
              <button
                key={cat}
                className={"mn-cat-item" + (activeCategory === cat ? " active" : "")}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </aside>

          {/* ITEMS */}
          <main className="mn-content">
            {activeCategory === "All" ? (
              // Agrupa por categoría cuando se muestra "All"
              categories.filter(c => c !== "All").map(cat => {
                const items = menuItems.filter(i => i.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="mn-section-title">{cat}</div>
                    <div className="mn-grid">
                      {items.map((item, idx) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          qty={cart[item.id] || 0}
                          onAdd={() => addToCart(item.id)}
                          onRemove={() => removeFromCart(item.id)}
                          delay={idx}
                          color={(CATEGORY_STYLE[restaurant.categories?.[0]] ?? CATEGORY_STYLE.Default).color}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="mn-section-title">{activeCategory}</div>
                <div className="mn-grid">
                  {filteredItems.map((item, idx) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      qty={cart[item.id] || 0}
                      onAdd={() => addToCart(item.id)}
                      onRemove={() => removeFromCart(item.id)}
                      delay={idx}
                      color={(CATEGORY_STYLE[restaurant.categories?.[0]] ?? CATEGORY_STYLE.Default).color}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>

        {/* CART DRAWER */}
        {cartOpen && (
          <>
            <div className="mn-overlay" onClick={() => setCartOpen(false)} />
            <div className="mn-drawer">
              <div className="mn-drawer-header">
                <span className="mn-drawer-title">Your Order</span>
                <button className="mn-drawer-close" onClick={() => setCartOpen(false)}>✕</button>
              </div>

              {cartItems.length === 0 ? (
                <div className="mn-empty-cart">
                  <div className="mn-empty-cart-icon">🛒</div>
                  <p>Your cart is empty.<br />Add items from the menu.</p>
                </div>
              ) : (
                <>
                  <div className="mn-drawer-items">
                    {cartItems.map(item => (
                      <div key={item.id} className="mn-drawer-item">
                        <div className="mn-drawer-item-emoji">{item.image}</div>
                        <div className="mn-drawer-item-info">
                          <div className="mn-drawer-item-name">{item.name}</div>
                          <div className="mn-drawer-item-price">${(item.price * item.qty).toFixed(2)}</div>
                        </div>
                        <div className="mn-drawer-item-qty">
                          <button className="mn-qty-btn" onClick={() => removeFromCart(item.id)}>−</button>
                          <span className="mn-qty-num">{item.qty}</span>
                          <button className="mn-qty-btn" onClick={() => addToCart(item.id)}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mn-drawer-footer">
                    <div className="mn-drawer-summary">
                      <div className="mn-drawer-row">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="mn-drawer-row total">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <button className="mn-checkout-btn" onClick={handleConfirmOrder}>
                      Confirm Order →
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
        </>
        )} {/* end !loading && !error && restaurant */}
      </div> {/* end mn-page */}
    </>
  );
}

// ── Componente separado para la tarjeta de item ──
function ItemCard({ item, qty, onAdd, onRemove, delay, color }) {
  return (
    <div className="mn-card" style={{ animationDelay: delay * 0.04 + "s" }}>
      <div
        className="mn-card-img"
        style={{ background: "linear-gradient(135deg, " + color + "1a, " + color + "33)" }}
      >
        {item.image}
        {item.popular && <span className="mn-popular-tag">⭐ Popular</span>}
      </div>
      <div className="mn-card-body">
        <div className="mn-card-name">{item.name}</div>
        <div className="mn-card-desc">{item.description}</div>
        <div className="mn-card-footer">
          <span className="mn-card-price">${item.price.toFixed(2)}</span>
          <div className="mn-qty">
            {qty === 0 ? (
              <button className="mn-qty-btn add-first" onClick={onAdd}>+ Add</button>
            ) : (
              <>
                <button className="mn-qty-btn" onClick={onRemove}>−</button>
                <span className="mn-qty-num">{qty}</span>
                <button className="mn-qty-btn" onClick={onAdd}>+</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}