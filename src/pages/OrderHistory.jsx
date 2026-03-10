import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// MOCK DATA — reemplazar con:
// GET /api/orders?userId=me
// ─────────────────────────────────────────────
const mockOrders = [
  {
    id: "ORD-2024-0042",
    restaurant: { name: "Burger Palace", image: "🍔", color: "#f97316" },
    items: [
      { name: "Classic Smash",   qty: 2 },
      { name: "Crispy Fries",    qty: 1 },
      { name: "Chocolate Shake", qty: 1 },
    ],
    total: 32.96,
    deliveryPoint: "Campus Central",
    status: "delivered",
    placedAt: "Today, 2:10 PM",
    deliveredAt: "Today, 2:34 PM",
    reviewed: false,
  },
  {
    id: "ORD-2024-0039",
    restaurant: { name: "Sushi Zen", image: "🍣", color: "#8b5cf6" },
    items: [
      { name: "Salmon Roll",  qty: 2 },
      { name: "Miso Soup",    qty: 1 },
    ],
    total: 28.47,
    deliveryPoint: "Torre Empresarial",
    status: "on_the_way",
    placedAt: "Today, 3:05 PM",
    deliveredAt: null,
    reviewed: false,
  },
  {
    id: "ORD-2024-0035",
    restaurant: { name: "Pizza Mondo", image: "🍕", color: "#ef4444" },
    items: [
      { name: "Margherita XL", qty: 1 },
      { name: "Garlic Bread",  qty: 2 },
    ],
    total: 21.97,
    deliveryPoint: "Plaza Fontabella",
    status: "confirmed",
    placedAt: "Today, 3:40 PM",
    deliveredAt: null,
    reviewed: false,
  },
  {
    id: "ORD-2024-0031",
    restaurant: { name: "Taco Fiesta", image: "🌮", color: "#f59e0b" },
    items: [
      { name: "Taco Trio",    qty: 1 },
      { name: "Horchata",     qty: 2 },
    ],
    total: 15.47,
    deliveryPoint: "USAC Campus",
    status: "delivered",
    placedAt: "Yesterday, 1:15 PM",
    deliveredAt: "Yesterday, 1:48 PM",
    reviewed: true,
  },
  {
    id: "ORD-2024-0028",
    restaurant: { name: "Green Bowl", image: "🥗", color: "#22c55e" },
    items: [
      { name: "Buddha Bowl",  qty: 1 },
      { name: "Lemon Water",  qty: 1 },
    ],
    total: 13.48,
    deliveryPoint: "Oakland Mall",
    status: "cancelled",
    placedAt: "Yesterday, 11:00 AM",
    deliveredAt: null,
    reviewed: false,
  },
];
// ─────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:      { label: "Pending",      color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  icon: "🕐", step: 0 },
  confirmed:    { label: "Confirmed",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)",   icon: "✅", step: 1 },
  preparing:    { label: "Preparing",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: "👨‍🍳", step: 2 },
  on_the_way:   { label: "On the way",   color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  icon: "🛵", step: 3 },
  delivered:    { label: "Delivered",    color: "#52c49b", bg: "rgba(82,196,155,0.1)",   icon: "✓",  step: 4 },
  cancelled:    { label: "Cancelled",    color: "#e05c5c", bg: "rgba(224,92,92,0.1)",    icon: "✕",  step: -1 },
};

const FILTERS = ["All", "Active", "Delivered", "Cancelled"];

const PROGRESS_STEPS = ["Confirmed", "Preparing", "On the way", "Delivered"];

export default function OrderHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = mockOrders.filter(o => {
    if (filter === "All")       return true;
    if (filter === "Active")    return ["pending","confirmed","preparing","on_the_way"].includes(o.status);
    if (filter === "Delivered") return o.status === "delivered";
    if (filter === "Cancelled") return o.status === "cancelled";
    return true;
  });

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .oh-page {
          min-height: 100vh; background: #0d1117;
          font-family: 'DM Sans', sans-serif; color: #fff;
        }

        /* ── NAVBAR ── */
        .oh-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 64px;
          background: #111820;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; z-index: 100;
        }

        .oh-nav-back {
          background: transparent; border: none;
          color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; cursor: pointer; transition: color 0.2s; padding: 0;
        }

        .oh-nav-back:hover { color: #52c49b; }

        .oh-nav-logo {
          font-family: 'Syne', sans-serif; font-size: 1.4rem;
          font-weight: 800; color: #52c49b; letter-spacing: -0.5px;
        }

        .oh-nav-logo span { color: #fff; }

        /* ── BODY ── */
        .oh-body { max-width: 720px; margin: 0 auto; padding: 40px 40px 80px; }

        /* ── HEADER ── */
        .oh-header { margin-bottom: 28px; }

        .oh-header h1 {
          font-family: 'Syne', sans-serif; font-size: 1.8rem;
          font-weight: 800; color: #fff; margin-bottom: 4px;
        }

        .oh-header p { font-size: 0.88rem; color: rgba(255,255,255,0.35); font-weight: 300; }

        /* ── FILTERS ── */
        .oh-filters {
          display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;
        }

        .oh-filter-btn {
          padding: 7px 18px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px; background: transparent;
          color: rgba(255,255,255,0.45); font-family: 'DM Sans', sans-serif;
          font-size: 0.83rem; cursor: pointer; transition: all 0.18s;
        }

        .oh-filter-btn:hover { border-color: rgba(82,196,155,0.3); color: rgba(255,255,255,0.8); }

        .oh-filter-btn.active {
          background: #52c49b; border-color: #52c49b;
          color: #0d1f1c; font-weight: 600;
        }

        /* ── ORDER CARD ── */
        .oh-card {
          background: #111820;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden; margin-bottom: 14px;
          transition: border-color 0.2s;
          animation: fadeUp 0.35s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .oh-card:hover { border-color: rgba(255,255,255,0.1); }

        /* ── CARD HEADER ── */
        .oh-card-header {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 20px; cursor: pointer;
        }

        .oh-restaurant-emoji {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; flex-shrink: 0;
        }

        .oh-card-info { flex: 1; min-width: 0; }

        .oh-card-top {
          display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;
        }

        .oh-restaurant-name {
          font-family: 'Syne', sans-serif; font-size: 0.98rem; font-weight: 700; color: #fff;
        }

        .oh-status-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 999px;
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.03em;
        }

        .oh-card-meta {
          font-size: 0.78rem; color: rgba(255,255,255,0.3);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .oh-card-right {
          display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0;
        }

        .oh-card-total {
          font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff;
        }

        .oh-expand-icon {
          font-size: 0.7rem; color: rgba(255,255,255,0.25);
          transition: transform 0.2s;
        }

        .oh-expand-icon.open { transform: rotate(180deg); }

        /* ── PROGRESS BAR (active orders) ── */
        .oh-progress {
          padding: 0 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .oh-progress-track {
          display: flex; align-items: center; gap: 0;
          position: relative; margin-bottom: 8px;
        }

        .oh-progress-step {
          display: flex; flex-direction: column; align-items: center; flex: 1;
          position: relative; z-index: 1;
        }

        .oh-progress-dot {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.12);
          background: #0d1117;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.3);
          transition: all 0.3s; margin-bottom: 6px;
        }

        .oh-progress-dot.done {
          background: #52c49b; border-color: #52c49b; color: #0d1f1c;
        }

        .oh-progress-dot.current {
          background: transparent; border-color: #52c49b; color: #52c49b;
          box-shadow: 0 0 0 3px rgba(82,196,155,0.15);
          animation: pulse 1.8s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(82,196,155,0.15); }
          50%       { box-shadow: 0 0 0 6px rgba(82,196,155,0.08); }
        }

        .oh-progress-label {
          font-size: 0.68rem; color: rgba(255,255,255,0.25); text-align: center;
          white-space: nowrap;
        }

        .oh-progress-label.done    { color: #52c49b; }
        .oh-progress-label.current { color: rgba(255,255,255,0.6); }

        .oh-progress-line {
          flex: 1; height: 2px; background: rgba(255,255,255,0.08);
          margin-bottom: 22px; transition: background 0.3s;
        }

        .oh-progress-line.done { background: #52c49b; }

        /* ── EXPANDED DETAILS ── */
        .oh-details {
          padding: 18px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .oh-details-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;
        }

        .oh-detail-block {}

        .oh-detail-label {
          font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.25);
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;
        }

        .oh-detail-value {
          font-size: 0.85rem; color: rgba(255,255,255,0.65);
        }

        .oh-detail-value.mono {
          font-family: monospace; font-size: 0.8rem; color: rgba(255,255,255,0.4);
        }

        .oh-items-list { margin-bottom: 16px; }

        .oh-item-row {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.83rem; color: rgba(255,255,255,0.5);
        }

        .oh-item-row:last-child { border-bottom: none; }
        .oh-item-qty { color: #52c49b; font-weight: 600; min-width: 20px; }

        /* ── ACTIONS ── */
        .oh-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .oh-btn-review {
          flex: 1; padding: 11px 16px;
          background: #52c49b; border: none; border-radius: 9px;
          color: #0d1f1c; font-family: 'Syne', sans-serif;
          font-size: 0.88rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .oh-btn-review:hover { background: #63d4ab; transform: translateY(-1px); }

        .oh-btn-reviewed {
          flex: 1; padding: 11px 16px;
          background: transparent; border: 1px solid rgba(82,196,155,0.2);
          border-radius: 9px; color: rgba(82,196,155,0.5);
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          cursor: default; display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .oh-btn-reorder {
          padding: 11px 16px;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px; color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 6px;
        }

        .oh-btn-reorder:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        /* ── EMPTY STATE ── */
        .oh-empty {
          text-align: center; padding: 80px 20px;
          color: rgba(255,255,255,0.2);
        }

        .oh-empty-icon { font-size: 3rem; margin-bottom: 16px; }
        .oh-empty p { font-size: 0.9rem; line-height: 1.6; }

        .oh-empty-btn {
          margin-top: 24px; padding: 12px 28px;
          background: #52c49b; border: none; border-radius: 10px;
          color: #0d1f1c; font-family: 'Syne', sans-serif;
          font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }

        .oh-empty-btn:hover { background: #63d4ab; }

        /* ── RESPONSIVE ── */
        @media (max-width: 600px) {
          .oh-nav  { padding: 0 20px; }
          .oh-body { padding: 28px 20px 60px; }
          .oh-details-grid { grid-template-columns: 1fr; gap: 10px; }
          .oh-progress-label { display: none; }
        }
      `}</style>

      <div className="oh-page">

        {/* NAVBAR */}
        <nav className="oh-nav">
          <button className="oh-nav-back" onClick={() => navigate("/restaurants")}>
            ← Restaurants
          </button>
          <div className="oh-nav-logo">Click<span>Bite</span></div>
          <div style={{ width: 100 }} />
        </nav>

        <div className="oh-body">

          {/* HEADER */}
          <div className="oh-header">
            <h1>My orders</h1>
            <p>{mockOrders.length} orders total</p>
          </div>

          {/* FILTERS */}
          <div className="oh-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={"oh-filter-btn" + (filter === f ? " active" : "")}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ORDER LIST */}
          {filtered.length === 0 ? (
            <div className="oh-empty">
              <div className="oh-empty-icon">📋</div>
              <p>No orders in this category yet.</p>
              <button className="oh-empty-btn" onClick={() => navigate("/restaurants")}>
                Browse restaurants
              </button>
            </div>
          ) : (
            filtered.map((order, i) => {
              const st = STATUS_CONFIG[order.status];
              const isExpanded = expanded === order.id;
              const isActive = ["pending","confirmed","preparing","on_the_way"].includes(order.status);
              const currentStep = st.step;

              return (
                <div
                  key={order.id}
                  className="oh-card"
                  style={{ animationDelay: i * 0.05 + "s" }}
                >
                  {/* HEADER ROW */}
                  <div className="oh-card-header" onClick={() => toggleExpand(order.id)}>
                    <div
                      className="oh-restaurant-emoji"
                      style={{ background: "linear-gradient(135deg, " + order.restaurant.color + "33, " + order.restaurant.color + "55)" }}
                    >
                      {order.restaurant.image}
                    </div>

                    <div className="oh-card-info">
                      <div className="oh-card-top">
                        <span className="oh-restaurant-name">{order.restaurant.name}</span>
                        <span
                          className="oh-status-badge"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.icon} {st.label}
                        </span>
                      </div>
                      <div className="oh-card-meta">
                        {order.items.map(i => i.name).join(", ")}
                      </div>
                    </div>

                    <div className="oh-card-right">
                      <span className="oh-card-total">${order.total.toFixed(2)}</span>
                      <span className={"oh-expand-icon" + (isExpanded ? " open" : "")}>▼</span>
                    </div>
                  </div>

                  {/* PROGRESS BAR — solo para órdenes activas */}
                  {isActive && (
                    <div className="oh-progress">
                      <div className="oh-progress-track">
                        {PROGRESS_STEPS.map((step, idx) => {
                          const stepNum = idx + 1;
                          const isDone    = currentStep > stepNum;
                          const isCurrent = currentStep === stepNum;
                          return (
                            <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                              <div className="oh-progress-step" style={{ flex: "none" }}>
                                <div className={"oh-progress-dot" + (isDone ? " done" : isCurrent ? " current" : "")}>
                                  {isDone ? "✓" : stepNum}
                                </div>
                                <span className={"oh-progress-label" + (isDone ? " done" : isCurrent ? " current" : "")}>
                                  {step}
                                </span>
                              </div>
                              {idx < PROGRESS_STEPS.length - 1 && (
                                <div className={"oh-progress-line" + (isDone ? " done" : "")} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="oh-details">
                      <div className="oh-details-grid">
                        <div className="oh-detail-block">
                          <div className="oh-detail-label">Order ID</div>
                          <div className="oh-detail-value mono">{order.id}</div>
                        </div>
                        <div className="oh-detail-block">
                          <div className="oh-detail-label">Delivery point</div>
                          <div className="oh-detail-value">📍 {order.deliveryPoint}</div>
                        </div>
                        <div className="oh-detail-block">
                          <div className="oh-detail-label">Placed at</div>
                          <div className="oh-detail-value">{order.placedAt}</div>
                        </div>
                        {order.deliveredAt && (
                          <div className="oh-detail-block">
                            <div className="oh-detail-label">Delivered at</div>
                            <div className="oh-detail-value">{order.deliveredAt}</div>
                          </div>
                        )}
                      </div>

                      <div className="oh-items-list">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="oh-item-row">
                            <span className="oh-item-qty">×{item.qty}</span>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* ACTIONS */}
                      <div className="oh-actions">
                        {order.status === "delivered" && !order.reviewed && (
                          <button
                            className="oh-btn-review"
                            onClick={() => navigate("/review")}
                          >
                            ⭐ Leave a review
                          </button>
                        )}

                        {order.status === "delivered" && order.reviewed && (
                          <div className="oh-btn-reviewed">
                            ✓ Review submitted
                          </div>
                        )}

                        {order.status !== "cancelled" && (
                          <button
                            className="oh-btn-reorder"
                            onClick={() => navigate("/restaurants")}
                          >
                            🔁 Reorder
                          </button>
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
    </>
  );
}