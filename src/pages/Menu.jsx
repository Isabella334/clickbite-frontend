import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { helpers, menuItems as menuItemsApi, restaurants as restaurantsApi, stats as statsApi } from "../services/api";

const getCategoryStyle = (categories) => {
  const key = Array.isArray(categories) ? categories[0] : categories;
  return CATEGORY_STYLE[key] ?? CATEGORY_STYLE.Default;
};

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
  const [availableCount, setAvailableCount] = useState(null);

  // -- Fetch restaurant + menu items ----------------------------------------
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
        // Fetch available items count via dedicated endpoint
        statsApi.getMenuItemsCount(restaurantId)
          .then(d => setAvailableCount(d.available_count ?? null))
          .catch(() => {});
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  // -- Helpers de carrito --
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
    <div style={{minHeight:"100vh",background:"#0f1117",fontFamily:"'DM Sans',sans-serif",color:"#e8eaf0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .mn-nav{height:52px;display:flex;align-items:center;gap:12px;padding:0 28px;border-bottom:1px solid #1e2230;background:#0f1117;position:sticky;top:0;z-index:100}
        .mn-nav-logo{font-family:'DM Mono',monospace;font-size:0.9rem;color:#52c49b;letter-spacing:0.05em}
        .mn-nav-logo span{color:#e8eaf0}
        .mn-back{padding:6px 12px;background:transparent;border:1px solid #1e2230;border-radius:4px;color:#4a5068;font-size:0.78rem;cursor:pointer;font-family:'DM Sans',sans-serif}
        .mn-back:hover{color:#e8eaf0;border-color:#2a3040}

        .mn-header{padding:28px;border-bottom:1px solid #1e2230;display:flex;align-items:flex-start;gap:20px}
        .mn-header-emoji{width:72px;height:72px;background:#1a1e2e;border:1px solid #1e2230;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0}
        .mn-header-info{flex:1}
        .mn-header-name{font-size:1.4rem;font-weight:500;color:#e8eaf0;margin-bottom:6px}
        .mn-header-desc{font-size:0.82rem;color:#4a5068;line-height:1.5;margin-bottom:8px;max-width:500px}
        .mn-header-meta{display:flex;flex-wrap:wrap;gap:16px}
        .mn-meta{font-size:0.78rem;color:#4a5068}
        .mn-meta strong{color:#52c49b;font-family:'DM Mono',monospace}

        .mn-body{display:flex;gap:0;min-height:calc(100vh - 200px)}
        .mn-sidebar{width:180px;padding:20px 16px;border-right:1px solid #1e2230;flex-shrink:0}
        .mn-sidebar-label{font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;color:#3d4255;margin-bottom:8px}
        .mn-cat-btn{display:block;width:100%;padding:7px 10px;background:transparent;border:none;border-radius:4px;text-align:left;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.83rem;cursor:pointer;margin-bottom:2px}
        .mn-cat-btn:hover{background:#1a1e2e;color:#c8ccd8}
        .mn-cat-btn.active{background:#52c49b1a;color:#52c49b}

        .mn-items{flex:1;padding:20px 24px}
        .mn-items-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}

        .mn-item{background:#131720;border:1px solid #1e2230;border-radius:7px;padding:14px;display:flex;gap:12px;align-items:flex-start;cursor:pointer}
        .mn-item:hover{border-color:#2a3040}
        .mn-item-emoji{width:44px;height:44px;background:#1a1e2e;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}
        .mn-item-info{flex:1;min-width:0}
        .mn-item-name{font-size:0.88rem;font-weight:500;color:#e8eaf0;margin-bottom:3px}
        .mn-item-desc{font-size:0.75rem;color:#3d4255;line-height:1.4;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .mn-item-footer{display:flex;align-items:center;justify-content:space-between}
        .mn-item-price{font-family:'DM Mono',monospace;font-size:0.85rem;color:#52c49b}
        .mn-item-tags{display:flex;gap:4px}
        .mn-tag{padding:2px 6px;border-radius:3px;font-size:0.65rem;letter-spacing:0.05em;text-transform:uppercase}
        .mn-tag-pop{background:#52c49b1a;color:#52c49b}
        .mn-tag-na{background:#1e2230;color:#3d4255}
        .mn-add-btn{width:28px;height:28px;border-radius:4px;border:1px solid #1e2230;background:transparent;color:#4a5068;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .mn-add-btn:hover{background:#52c49b;border-color:#52c49b;color:#0a0e14}

        .mn-empty{padding:60px 20px;text-align:center;color:#3d4255;font-size:0.88rem}

        /* Cart FAB */
        .mn-cart-fab{position:fixed;bottom:24px;right:24px;z-index:200;display:flex;align-items:center;gap:10px;padding:12px 20px;background:#52c49b;border:none;border-radius:6px;color:#0a0e14;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;cursor:pointer}
        .mn-cart-count{background:#0a0e14;color:#52c49b;font-family:'DM Mono',monospace;font-size:0.75rem;padding:2px 7px;border-radius:3px}

        /* Cart drawer */
        .mn-cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:300}
        .mn-cart{position:fixed;right:0;top:0;bottom:0;width:360px;background:#131720;border-left:1px solid #1e2230;z-index:301;display:flex;flex-direction:column}
        .mn-cart-header{padding:20px 20px 16px;border-bottom:1px solid #1e2230;display:flex;align-items:center;justify-content:space-between}
        .mn-cart-title{font-size:1rem;font-weight:500}
        .mn-cart-close{background:transparent;border:1px solid #1e2230;border-radius:4px;color:#4a5068;width:28px;height:28px;cursor:pointer;font-size:1rem}
        .mn-cart-items{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px}
        .mn-cart-row{display:flex;align-items:center;gap:10px}
        .mn-cart-row-name{flex:1;font-size:0.85rem;color:#c8ccd8}
        .mn-cart-qty{display:flex;align-items:center;gap:8px}
        .mn-qty-btn{width:24px;height:24px;border-radius:3px;border:1px solid #1e2230;background:transparent;color:#c8ccd8;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;justify-content:center}
        .mn-qty-btn:hover{border-color:#52c49b;color:#52c49b}
        .mn-qty-val{font-family:'DM Mono',monospace;font-size:0.82rem;color:#e8eaf0;min-width:16px;text-align:center}
        .mn-cart-price{font-family:'DM Mono',monospace;font-size:0.82rem;color:#52c49b;white-space:nowrap}
        .mn-cart-footer{padding:16px 20px;border-top:1px solid #1e2230}
        .mn-cart-total{display:flex;justify-content:space-between;margin-bottom:14px;font-size:0.9rem}
        .mn-cart-total strong{font-family:'DM Mono',monospace;color:#52c49b}
        .mn-checkout-btn{width:100%;padding:11px;background:#52c49b;border:none;border-radius:5px;color:#0a0e14;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;cursor:pointer}
        .mn-checkout-btn:hover{background:#60d4a8}
        .mn-cart-empty{padding:40px;text-align:center;color:#3d4255;font-size:0.85rem}
      `}</style>

      {/* NAV */}
      <nav className="mn-nav">
        <div className="mn-nav-logo">Click<span>Bite</span></div>
        <button className="mn-back" onClick={()=>navigate("/restaurants")}>Back</button>
      </nav>

      {loading ? (
        <div style={{padding:80,textAlign:"center",color:"#3d4255"}}>Loading...</div>
      ) : error ? (
        <div style={{padding:80,textAlign:"center",color:"#e05555"}}>{error}</div>
      ) : !restaurant ? null : (
        <>
          {/* Restaurant header */}
          <div className="mn-header">
            <div className="mn-header-emoji">{getCategoryStyle(restaurant.categories).image}</div>
            <div className="mn-header-info">
              <div className="mn-header-name">{restaurant.name}</div>
              <div className="mn-header-desc">{restaurant.description}</div>
              <div className="mn-header-meta">
                <span className="mn-meta"><strong>{(restaurant.avg_rating??0).toFixed(1)}</strong> rating ({restaurant.total_reviews??0} reviews)</span>
                <span className="mn-meta">{restaurant.contact?.phone ?? "-"}</span>
                {availableCount !== null && <span className="mn-meta"><strong>{availableCount}</strong> items available</span>}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="mn-body">
            {/* Sidebar */}
            <aside className="mn-sidebar">
              <div className="mn-sidebar-label">Categories</div>
              {categories.map(cat => (
                <button key={cat} className={"mn-cat-btn"+(activeCategory===cat?" active":"")} onClick={()=>setActiveCategory(cat)}>{cat}</button>
              ))}
            </aside>

            {/* Items */}
            <div className="mn-items">
              {filteredItems.length === 0 ? (
                <div className="mn-empty">No items in this category.</div>
              ) : (
                <div className="mn-items-grid">
                  {filteredItems.map(item => (
                    <div key={item.id} className="mn-item">
                      <div className="mn-item-emoji">
                        {item.imageFileId
                          ? <img src={"/api/v1/files/"+item.imageFileId} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:4}}/>
                          : item.image}
                      </div>
                      <div className="mn-item-info">
                        <div className="mn-item-name">{item.name}</div>
                        <div className="mn-item-desc">{item.description}</div>
                        <div className="mn-item-footer">
                          <span className="mn-item-price">Q{item.price.toFixed(2)}</span>
                          <div className="mn-item-tags">
                            {item.popular && <span className="mn-tag mn-tag-pop">Popular</span>}
                            {!item.available && <span className="mn-tag mn-tag-na">Unavailable</span>}
                          </div>
                        </div>
                      </div>
                      {item.available && (
                        <button className="mn-add-btn" onClick={()=>addToCart(item.id)}>+</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart FAB */}
          {cartCount > 0 && !cartOpen && (
            <button className="mn-cart-fab" onClick={()=>setCartOpen(true)}>
              Cart <span className="mn-cart-count">{cartCount}</span>
            </button>
          )}

          {/* Cart drawer */}
          {cartOpen && (
            <>
              <div className="mn-cart-overlay" onClick={()=>setCartOpen(false)}/>
              <div className="mn-cart">
                <div className="mn-cart-header">
                  <span className="mn-cart-title">Your order</span>
                  <button className="mn-cart-close" onClick={()=>setCartOpen(false)}>x</button>
                </div>
                {cartItems.length === 0 ? (
                  <div className="mn-cart-empty">Your cart is empty</div>
                ) : (
                  <>
                    <div className="mn-cart-items">
                      {cartItems.map(item => (
                        <div key={item.id} className="mn-cart-row">
                          <span className="mn-cart-row-name">{item.name}</span>
                          <div className="mn-cart-qty">
                            <button className="mn-qty-btn" onClick={()=>removeFromCart(item.id)}>-</button>
                            <span className="mn-qty-val">{cart[item.id]}</span>
                            <button className="mn-qty-btn" onClick={()=>addToCart(item.id)}>+</button>
                          </div>
                          <span className="mn-cart-price">Q{(item.price*cart[item.id]).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mn-cart-footer">
                      <div className="mn-cart-total">
                        <span>Total</span>
                        <strong>Q{cartTotal.toFixed(2)}</strong>
                      </div>
                      <button className="mn-checkout-btn" onClick={handleConfirmOrder}>Checkout</button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
