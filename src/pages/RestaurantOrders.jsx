import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// MOCK DATA — reemplazar con:
// GET /api/restaurant/orders
// PATCH /api/orders/:id/status
// ─────────────────────────────────────────────
const initialOrders = [
  {
    id: "ORD-0042", customer: "María G.",  time: "2 min ago",  placedAt: "3:12 PM",
    items: [{ name: "Classic Smash", qty: 2, price: 10.99 }, { name: "Crispy Fries", qty: 1, price: 3.99 }],
    total: 25.97, deliveryPoint: "Campus Central", status: "pending", notes: "No pickles please",
  },
  {
    id: "ORD-0041", customer: "Carlos R.", time: "8 min ago",  placedAt: "3:06 PM",
    items: [{ name: "BBQ Bacon Stack", qty: 1, price: 14.99 }, { name: "Chocolate Shake", qty: 1, price: 5.99 }],
    total: 20.98, deliveryPoint: "Torre Empresarial", status: "preparing", notes: "",
  },
  {
    id: "ORD-0040", customer: "Ana L.",    time: "15 min ago", placedAt: "2:59 PM",
    items: [{ name: "Mushroom Swiss", qty: 1, price: 12.49 }, { name: "Onion Rings", qty: 1, price: 4.49 }],
    total: 16.98, deliveryPoint: "Plaza Fontabella", status: "on_the_way", notes: "",
  },
  {
    id: "ORD-0039", customer: "Luis M.",   time: "32 min ago", placedAt: "2:42 PM",
    items: [{ name: "Classic Smash", qty: 1, price: 10.99 }],
    total: 12.98, deliveryPoint: "USAC Campus", status: "delivered", notes: "",
  },
  {
    id: "ORD-0038", customer: "Sofía P.",  time: "45 min ago", placedAt: "2:29 PM",
    items: [{ name: "Spicy Jalapeño", qty: 2, price: 11.99 }, { name: "Craft Lemonade", qty: 2, price: 3.49 }],
    total: 30.96, deliveryPoint: "Oakland Mall", status: "delivered", notes: "Extra spicy",
  },
  {
    id: "ORD-0037", customer: "Diego F.",  time: "1 hr ago",   placedAt: "2:15 PM",
    items: [{ name: "Classic Smash", qty: 3, price: 10.99 }],
    total: 34.96, deliveryPoint: "Centro Histórico", status: "cancelled", notes: "",
  },
];
// ─────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:    { label: "Pendiente",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: "🕐" },
  confirmed:  { label: "Confirmado", color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  icon: "✅" },
  preparing:  { label: "Preparando", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: "👨‍🍳" },
  on_the_way: { label: "En camino",  color: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: "🛵" },
  delivered:  { label: "Entregado",  color: "#52c49b", bg: "rgba(82,196,155,0.12)",  icon: "✓"  },
  cancelled:  { label: "Cancelado",  color: "#e05c5c", bg: "rgba(224,92,92,0.12)",   icon: "✕"  },
};

// Next logical status for each state
const NEXT_STATUS = {
  pending:    { status: "confirmed",  label: "Confirmar pedido",   icon: "✅" },
  confirmed:  { status: "preparing",  label: "Empezar preparación", icon: "👨‍🍳" },
  preparing:  { status: "on_the_way", label: "Salió a entregar",    icon: "🛵" },
  on_the_way: { status: "delivered",  label: "Marcar entregado",    icon: "✓"  },
};

const FILTERS = ["Todos", "Pendientes", "Preparando", "En camino", "Entregados", "Cancelados"];

const filterMap = {
  "Todos":      null,
  "Pendientes": "pending",
  "Preparando": "preparing",
  "En camino":  "on_the_way",
  "Entregados": "delivered",
  "Cancelados": "cancelled",
};

export default function RestaurantOrders() {
  const navigate = useNavigate();
  const [orders,   setOrders]   = useState(initialOrders);
  const [filter,   setFilter]   = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [search,   setSearch]   = useState("");

  const filtered = orders.filter(o => {
    const matchesFilter = !filterMap[filter] || o.status === filterMap[filter];
    const matchesSearch = search === "" ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const advanceStatus = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const next = NEXT_STATUS[o.status];
      return next ? { ...o, status: next.status } : o;
    }));
  };

  const cancelOrder = (orderId) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: "cancelled" } : o
    ));
  };

  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ro-page {
          min-height: 100vh; background: #0d1117;
          font-family: 'DM Sans', sans-serif; color: #fff;
          display: flex;
        }

        /* ── SIDEBAR (same as dashboard) ── */
        .ro-sidebar {
          width: 220px; min-width: 220px; background: #111820;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          padding: 28px 0; position: sticky; top: 0; height: 100vh;
        }

        .ro-sidebar-logo {
          font-family: 'Syne', sans-serif; font-size: 1.3rem;
          font-weight: 800; color: #52c49b; letter-spacing: -0.5px;
          padding: 0 24px; margin-bottom: 32px;
        }

        .ro-sidebar-logo span { color: #fff; }

        .ro-restaurant-info { padding: 0 16px; margin-bottom: 28px; }

        .ro-restaurant-card {
          display: flex; align-items: center; gap: 10px; padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;
        }

        .ro-restaurant-emoji {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; flex-shrink: 0;
          background: linear-gradient(135deg, #f9731633, #f9731655);
        }

        .ro-restaurant-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #fff; }
        .ro-restaurant-cat  { font-size: 0.72rem; color: rgba(255,255,255,0.3); margin-top: 2px; }

        .ro-nav-section {
          font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.2);
          text-transform: uppercase; letter-spacing: 0.1em;
          padding: 0 24px; margin-bottom: 6px;
        }

        .ro-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 24px; cursor: pointer; transition: all 0.18s;
          color: rgba(255,255,255,0.45); font-size: 0.88rem;
          border: none; background: transparent; width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
          border-left: 3px solid transparent;
        }

        .ro-nav-item:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.03); }

        .ro-nav-item.active {
          color: #52c49b; background: rgba(82,196,155,0.08);
          border-left-color: #52c49b; font-weight: 500;
        }

        .ro-nav-badge {
          margin-left: auto; background: #e05c5c; color: #fff;
          font-size: 0.68rem; font-weight: 700; padding: 2px 7px;
          border-radius: 999px;
        }

        .ro-sidebar-bottom {
          margin-top: auto; padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .ro-logout {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 10px 14px; background: transparent; border: none;
          color: rgba(255,255,255,0.3); font-family: 'DM Sans', sans-serif;
          font-size: 0.83rem; cursor: pointer; transition: color 0.2s;
          border-radius: 8px; text-align: left;
        }

        .ro-logout:hover { color: #e05c5c; background: rgba(224,92,92,0.06); }

        /* ── MAIN ── */
        .ro-main { flex: 1; overflow-y: auto; }

        .ro-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 36px; border-bottom: 1px solid rgba(255,255,255,0.06);
          background: #111820; position: sticky; top: 0; z-index: 50;
        }

        .ro-topbar-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; color: #fff; }
        .ro-topbar-sub { font-size: 0.8rem; color: rgba(255,255,255,0.3); margin-top: 2px; }

        /* search */
        .ro-search-wrap { position: relative; }

        .ro-search {
          padding: 9px 16px 9px 36px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 9px;
          color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          outline: none; width: 220px; transition: all 0.2s;
        }

        .ro-search::placeholder { color: rgba(255,255,255,0.25); }
        .ro-search:focus { border-color: #52c49b; background: rgba(82,196,155,0.05); width: 260px; }

        .ro-search-icon {
          position: absolute; left: 11px; top: 50%;
          transform: translateY(-50%); font-size: 0.85rem;
          color: rgba(255,255,255,0.25); pointer-events: none;
        }

        /* ── CONTENT ── */
        .ro-content { padding: 28px 36px; }

        /* ── FILTERS ── */
        .ro-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }

        .ro-filter {
          padding: 7px 16px; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px; background: transparent;
          color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; cursor: pointer; transition: all 0.18s;
        }

        .ro-filter:hover { border-color: rgba(82,196,155,0.3); color: rgba(255,255,255,0.7); }

        .ro-filter.active {
          background: #52c49b; border-color: #52c49b; color: #0d1f1c; font-weight: 600;
        }

        /* count */
        .ro-count { font-size: 0.8rem; color: rgba(255,255,255,0.25); margin-bottom: 16px; }
        .ro-count strong { color: #52c49b; }

        /* ── ORDER CARD ── */
        .ro-card {
          background: #111820; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; overflow: hidden; margin-bottom: 12px;
          transition: border-color 0.2s;
          animation: fadeUp 0.3s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ro-card:hover { border-color: rgba(255,255,255,0.1); }

        .ro-card.pending-card { border-color: rgba(148,163,184,0.2); }
        .ro-card.pending-card:hover { border-color: rgba(148,163,184,0.4); }

        /* ── CARD SUMMARY ROW ── */
        .ro-card-row {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 18px; cursor: pointer;
        }

        .ro-card-id {
          font-family: monospace; font-size: 0.8rem;
          color: rgba(255,255,255,0.3); min-width: 88px;
        }

        .ro-card-customer { font-size: 0.9rem; font-weight: 500; color: #fff; min-width: 90px; }

        .ro-card-preview {
          flex: 1; font-size: 0.8rem; color: rgba(255,255,255,0.35);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .ro-card-total {
          font-family: 'Syne', sans-serif; font-size: 0.95rem;
          font-weight: 700; color: #fff; min-width: 64px; text-align: right;
        }

        .ro-status-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 999px;
          font-size: 0.72rem; font-weight: 600; white-space: nowrap;
        }

        .ro-card-time { font-size: 0.74rem; color: rgba(255,255,255,0.2); min-width: 64px; text-align: right; }

        .ro-expand-icon { font-size: 0.68rem; color: rgba(255,255,255,0.2); transition: transform 0.2s; }
        .ro-expand-icon.open { transform: rotate(180deg); }

        /* ── EXPANDED DETAILS ── */
        .ro-details {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 18px; animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ro-details-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }

        .ro-detail-block {}
        .ro-detail-label { font-size: 0.7rem; font-weight: 600; color: rgba(255,255,255,0.22); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .ro-detail-value { font-size: 0.84rem; color: rgba(255,255,255,0.65); }

        /* items table */
        .ro-items-table { width: 100%; margin-bottom: 16px; }

        .ro-items-header {
          display: grid; grid-template-columns: 1fr auto auto;
          padding: 6px 10px; font-size: 0.7rem; font-weight: 600;
          color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.08em;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .ro-item-row {
          display: grid; grid-template-columns: 1fr auto auto;
          padding: 8px 10px; font-size: 0.84rem;
          color: rgba(255,255,255,0.6);
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .ro-item-row:last-child { border-bottom: none; }
        .ro-item-qty { color: #52c49b; font-weight: 600; text-align: center; }
        .ro-item-price { color: rgba(255,255,255,0.4); text-align: right; }

        /* notes */
        .ro-notes {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 12px; background: rgba(245,158,11,0.07);
          border: 1px solid rgba(245,158,11,0.15); border-radius: 8px;
          margin-bottom: 16px; font-size: 0.82rem; color: rgba(255,255,255,0.5);
        }

        /* ── ACTION BUTTONS ── */
        .ro-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .ro-btn-advance {
          flex: 1; padding: 10px 16px; background: #52c49b;
          border: none; border-radius: 9px; color: #0d1f1c;
          font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .ro-btn-advance:hover { background: #63d4ab; transform: translateY(-1px); }

        .ro-btn-cancel {
          padding: 10px 16px; background: transparent;
          border: 1px solid rgba(224,92,92,0.3); border-radius: 9px;
          color: #e05c5c; font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
        }

        .ro-btn-cancel:hover { background: rgba(224,92,92,0.08); border-color: #e05c5c; }

        .ro-btn-done {
          flex: 1; padding: 10px 16px; background: transparent;
          border: 1px solid rgba(82,196,155,0.2); border-radius: 9px;
          color: rgba(82,196,155,0.5); font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; cursor: default;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        /* ── EMPTY ── */
        .ro-empty {
          text-align: center; padding: 80px 20px; color: rgba(255,255,255,0.2);
        }

        .ro-empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .ro-empty p { font-size: 0.88rem; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .ro-details-grid { grid-template-columns: 1fr 1fr; }
          .ro-card-preview { display: none; }
        }

        @media (max-width: 720px) {
          .ro-sidebar { display: none; }
          .ro-content { padding: 20px; }
          .ro-topbar { padding: 16px 20px; }
          .ro-details-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ro-page">

        {/* ── SIDEBAR ── */}
        <aside className="ro-sidebar">
          <div className="ro-sidebar-logo">Click<span>Bite</span></div>

          <div className="ro-restaurant-info">
            <div className="ro-restaurant-card">
              <div className="ro-restaurant-emoji">🍔</div>
              <div>
                <div className="ro-restaurant-name">Burger Palace</div>
                <div className="ro-restaurant-cat">Burgers</div>
              </div>
            </div>
          </div>

          <div className="ro-nav-section">Menú</div>

          <button className="ro-nav-item" onClick={() => navigate("/restaurant-dashboard")}>
            <span>🍽️</span> Dashboard
          </button>
          <button className="ro-nav-item active">
            <span>📋</span> Pedidos
            {pendingCount > 0 && <span className="ro-nav-badge">{pendingCount}</span>}
          </button>

          <div className="ro-sidebar-bottom">
            <button className="ro-logout" onClick={() => navigate("/")}>← Cerrar sesión</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="ro-main">
          <div className="ro-topbar">
            <div>
              <div className="ro-topbar-title">Pedidos</div>
              <div className="ro-topbar-sub">{orders.length} en total · {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}</div>
            </div>
            <div className="ro-search-wrap">
              <span className="ro-search-icon">🔍</span>
              <input
                className="ro-search"
                type="text"
                placeholder="Buscar pedido o cliente…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="ro-content">

            {/* FILTERS */}
            <div className="ro-filters">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={"ro-filter" + (filter === f ? " active" : "")}
                  onClick={() => setFilter(f)}
                >
                  {f}
                  {f === "Pendientes" && pendingCount > 0 && (
                    <span style={{
                      marginLeft: 6, background: filter === "Pendientes" ? "#0d1f1c" : "#e05c5c",
                      color: filter === "Pendientes" ? "#52c49b" : "#fff",
                      borderRadius: "999px", padding: "0px 6px",
                      fontSize: "0.7rem", fontWeight: 700,
                    }}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="ro-count">
              Mostrando <strong>{filtered.length}</strong> pedido{filtered.length !== 1 ? "s" : ""}
            </div>

            {/* ORDERS */}
            {filtered.length === 0 ? (
              <div className="ro-empty">
                <div className="ro-empty-icon">📭</div>
                <p>No hay pedidos en esta categoría.</p>
              </div>
            ) : (
              filtered.map((order, i) => {
                const st         = STATUS_CONFIG[order.status];
                const next       = NEXT_STATUS[order.status];
                const isExpanded = expanded === order.id;
                const itemPreview = order.items.map(it => it.name + " ×" + it.qty).join(", ");

                return (
                  <div
                    key={order.id}
                    className={"ro-card" + (order.status === "pending" ? " pending-card" : "")}
                    style={{ animationDelay: i * 0.04 + "s" }}
                  >
                    {/* SUMMARY ROW */}
                    <div className="ro-card-row" onClick={() => setExpanded(isExpanded ? null : order.id)}>
                      <span className="ro-card-id">{order.id}</span>
                      <span className="ro-card-customer">{order.customer}</span>
                      <span className="ro-card-preview">{itemPreview}</span>
                      <span className="ro-card-total">${order.total.toFixed(2)}</span>
                      <span className="ro-status-badge" style={{ background: st.bg, color: st.color }}>
                        {st.icon} {st.label}
                      </span>
                      <span className="ro-card-time">{order.time}</span>
                      <span className={"ro-expand-icon" + (isExpanded ? " open" : "")}>▼</span>
                    </div>

                    {/* EXPANDED */}
                    {isExpanded && (
                      <div className="ro-details">
                        <div className="ro-details-grid">
                          <div className="ro-detail-block">
                            <div className="ro-detail-label">ID del pedido</div>
                            <div className="ro-detail-value" style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{order.id}</div>
                          </div>
                          <div className="ro-detail-block">
                            <div className="ro-detail-label">Cliente</div>
                            <div className="ro-detail-value">{order.customer}</div>
                          </div>
                          <div className="ro-detail-block">
                            <div className="ro-detail-label">Punto de entrega</div>
                            <div className="ro-detail-value">📍 {order.deliveryPoint}</div>
                          </div>
                          <div className="ro-detail-block">
                            <div className="ro-detail-label">Hora del pedido</div>
                            <div className="ro-detail-value">{order.placedAt}</div>
                          </div>
                          <div className="ro-detail-block">
                            <div className="ro-detail-label">Pago</div>
                            <div className="ro-detail-value">💳 Tarjeta</div>
                          </div>
                          <div className="ro-detail-block">
                            <div className="ro-detail-label">Estado</div>
                            <div className="ro-detail-value" style={{ color: st.color }}>{st.icon} {st.label}</div>
                          </div>
                        </div>

                        {/* ITEMS TABLE */}
                        <div className="ro-items-table">
                          <div className="ro-items-header">
                            <span>Producto</span><span>Cant.</span><span>Precio</span>
                          </div>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="ro-item-row">
                              <span>{item.name}</span>
                              <span className="ro-item-qty">{item.qty}</span>
                              <span className="ro-item-price">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="ro-item-row" style={{ fontWeight: 600, borderTop: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
                            <span>Total</span>
                            <span></span>
                            <span style={{ color: "#52c49b" }}>${order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* NOTES */}
                        {order.notes && (
                          <div className="ro-notes">
                            ⚠️ <span><strong style={{ color: "#f59e0b" }}>Nota del cliente:</strong> {order.notes}</span>
                          </div>
                        )}

                        {/* ACTIONS */}
                        <div className="ro-actions">
                          {next ? (
                            <>
                              <button
                                className="ro-btn-advance"
                                onClick={() => advanceStatus(order.id)}
                              >
                                {next.icon} {next.label}
                              </button>
                              {order.status === "pending" && (
                                <button
                                  className="ro-btn-cancel"
                                  onClick={() => cancelOrder(order.id)}
                                >
                                  Cancelar pedido
                                </button>
                              )}
                            </>
                          ) : order.status === "delivered" ? (
                            <div className="ro-btn-done">✓ Order completed</div>
                          ) : (
                            <div className="ro-btn-done">✕ Order cancelled</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}