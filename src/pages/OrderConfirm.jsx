import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// MOCK DATA — reemplazar con fetch al backend
// ─────────────────────────────────────────────
const mockOrder = {
  restaurant: {
    name: "Burger Palace",
    image: "🍔",
    color: "#f97316",
  },
  items: [
    { id: 1, name: "Classic Smash",   image: "🍔", price: 10.99, qty: 2 },
    { id: 2, name: "Crispy Fries",    image: "🍟", price: 3.99,  qty: 1 },
    { id: 3, name: "Chocolate Shake", image: "🥤", price: 5.99,  qty: 1 },
  ],
  deliveryFee: 1.99,
};

// GET /api/delivery-points  →  lista de puntos geoespaciales disponibles
const mockDeliveryPoints = [
  { id: 1, name: "Campus Central",        zone: "Zone 12", address: "Av. Petapa 2-01, Zona 12",           icon: "🏫", lat: 14.5894, lng: -90.5513 },
  { id: 2, name: "Torre Empresarial",     zone: "Zone 10", address: "Blvd. Los Próceres 24-69, Zona 10",  icon: "🏢", lat: 14.5981, lng: -90.5133 },
  { id: 3, name: "Plaza Fontabella",      zone: "Zone 10", address: "Av. La Reforma 15-54, Zona 10",      icon: "🛍️", lat: 14.6016, lng: -90.5069 },
  { id: 4, name: "Parque Las Américas",   zone: "Zone 13", address: "Av. Las Américas, Zona 13",          icon: "🌳", lat: 14.5918, lng: -90.5234 },
  { id: 5, name: "Centro Histórico",      zone: "Zone 1",  address: "6a Av. & 6a Calle, Zona 1",          icon: "🏛️", lat: 14.6407, lng: -90.5133 },
  { id: 6, name: "Oakland Mall",          zone: "Zone 10", address: "Diagonal 6 13-01, Zona 10",          icon: "🏬", lat: 14.6011, lng: -90.5022 },
  { id: 7, name: "USAC Campus",           zone: "Zone 12", address: "Ciudad Universitaria, Zona 12",      icon: "🎓", lat: 14.5836, lng: -90.5528 },
  { id: 8, name: "Aeropuerto La Aurora",  zone: "Zone 13", address: "7a Av. 11-03, Zona 13",              icon: "✈️", lat: 14.5833, lng: -90.5275 },
];
// ─────────────────────────────────────────────

const PAYMENT_METHODS = [
  { key: "card",   label: "Credit / Debit Card", icon: "💳" },
  { key: "cash",   label: "Cash on delivery",    icon: "💵" },
  { key: "wallet", label: "Digital Wallet",       icon: "📱" },
];

// Agrupa puntos por zona
const groupByZone = (points) => {
  return points.reduce((acc, p) => {
    if (!acc[p.zone]) acc[p.zone] = [];
    acc[p.zone].push(p);
    return acc;
  }, {});
};

export default function OrderConfirm() {
  const navigate = useNavigate();

  const order = mockOrder;
  const deliveryPoints = mockDeliveryPoints;
  const grouped = groupByZone(deliveryPoints);

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + order.deliveryFee;

  const handlePlace = () => {
    if (!selectedPoint) { setError("Please select a delivery point"); return; }
    setError("");
    setPlacing(true);
    // Simula POST /api/orders con { pointId: selectedPoint.id, paymentMethod, notes }
    setTimeout(() => {
      setPlacing(false);
      setPlaced(true);
    }, 1800);
  };

  // ── SUCCESS SCREEN ──
  if (placed) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .oc-success {
            min-height: 100vh;
            background: #0d1117;
            font-family: 'DM Sans', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
          }

          .oc-success-card {
            background: #111820;
            border: 1px solid rgba(82,196,155,0.2);
            border-radius: 24px;
            padding: 56px 48px;
            text-align: center;
            max-width: 440px;
            width: 100%;
            animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
          }

          @keyframes popIn {
            from { opacity: 0; transform: scale(0.85); }
            to   { opacity: 1; transform: scale(1); }
          }

          .oc-success-icon {
            width: 80px; height: 80px;
            background: rgba(82,196,155,0.12);
            border: 2px solid rgba(82,196,155,0.3);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem;
            margin: 0 auto 24px;
          }

          .oc-success-card h1 {
            font-family: 'Syne', sans-serif;
            font-size: 1.7rem; font-weight: 800; color: #fff; margin-bottom: 10px;
          }

          .oc-success-card p {
            font-size: 0.9rem; color: rgba(255,255,255,0.4);
            line-height: 1.6; font-weight: 300; margin-bottom: 24px;
          }

          .oc-success-point {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 18px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            margin-bottom: 16px;
            text-align: left;
          }

          .oc-success-point-icon { font-size: 1.4rem; }

          .oc-success-point-name {
            font-size: 0.9rem; font-weight: 600; color: #fff;
          }

          .oc-success-point-addr {
            font-size: 0.76rem; color: rgba(255,255,255,0.35); margin-top: 2px;
          }

          .oc-success-eta {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            padding: 14px 24px;
            background: rgba(82,196,155,0.08);
            border: 1px solid rgba(82,196,155,0.2);
            border-radius: 12px;
            margin-bottom: 28px;
            font-size: 0.88rem; color: #52c49b; font-weight: 500;
          }

          .oc-success-actions { display: flex; flex-direction: column; gap: 10px; }

          .oc-btn-primary {
            padding: 13px; background: #52c49b; border: none; border-radius: 10px;
            color: #0d1f1c; font-family: 'Syne', sans-serif;
            font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
          }

          .oc-btn-primary:hover { background: #63d4ab; transform: translateY(-1px); }

          .oc-btn-ghost {
            padding: 13px; background: transparent;
            border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
            color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif;
            font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
          }

          .oc-btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
        `}</style>

        <div className="oc-success">
          <div className="oc-success-card">
            <div className="oc-success-icon">✅</div>
            <h1>Order placed!</h1>
            <p>
              Your order from <strong style={{ color: "#fff" }}>{order.restaurant.name}</strong> is confirmed
              and will be delivered to:
            </p>
            <div className="oc-success-point">
              <span className="oc-success-point-icon">{selectedPoint.icon}</span>
              <div>
                <div className="oc-success-point-name">{selectedPoint.name}</div>
                <div className="oc-success-point-addr">{selectedPoint.address}</div>
              </div>
            </div>
            <div className="oc-success-eta">
              🕐 Estimated delivery: <strong>30–45 min</strong>
            </div>
            <div className="oc-success-actions">
              <button className="oc-btn-primary" onClick={() => navigate("/order-history")}>
                Track my order
              </button>
              <button className="oc-btn-ghost" onClick={() => navigate("/restaurants")}>
                Back to restaurants
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── MAIN SCREEN ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .oc-page {
          min-height: 100vh;
          background: #0d1117;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* ── NAVBAR ── */
        .oc-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 64px;
          background: #111820;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; z-index: 100;
        }

        .oc-nav-back {
          background: transparent; border: none;
          color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; cursor: pointer; transition: color 0.2s; padding: 0;
        }

        .oc-nav-back:hover { color: #52c49b; }

        .oc-nav-logo {
          font-family: 'Syne', sans-serif; font-size: 1.4rem;
          font-weight: 800; color: #52c49b; letter-spacing: -0.5px;
        }

        .oc-nav-logo span { color: #fff; }

        /* ── STEPS ── */
        .oc-steps {
          display: flex; align-items: center; justify-content: center;
          padding: 20px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .oc-step { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: rgba(255,255,255,0.25); }
        .oc-step.active { color: #52c49b; }
        .oc-step.done   { color: rgba(255,255,255,0.4); }

        .oc-step-dot {
          width: 24px; height: 24px; border-radius: 50%;
          border: 1.5px solid currentColor;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
        }

        .oc-step.active .oc-step-dot { background: #52c49b; border-color: #52c49b; color: #0d1f1c; }
        .oc-step.done .oc-step-dot   { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }

        .oc-step-line { width: 48px; height: 1px; background: rgba(255,255,255,0.1); margin: 0 4px; }

        /* ── LAYOUT ── */
        .oc-body {
          display: flex; gap: 28px; padding: 40px;
          max-width: 1000px; margin: 0 auto;
        }

        .oc-left { flex: 1; display: flex; flex-direction: column; gap: 20px; }

        /* ── SECTION CARD ── */
        .oc-card {
          background: #111820;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 24px;
          animation: fadeUp 0.35s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .oc-card-title {
          font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
          color: #fff; margin-bottom: 6px;
          display: flex; align-items: center; gap: 8px;
        }

        .oc-card-subtitle {
          font-size: 0.8rem; color: rgba(255,255,255,0.3);
          margin-bottom: 18px; font-weight: 300;
        }

        /* ── ZONE GROUP ── */
        .oc-zone-label {
          font-size: 0.72rem; font-weight: 600;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase; letter-spacing: 0.1em;
          margin: 16px 0 8px;
        }

        .oc-zone-label:first-child { margin-top: 0; }

        /* ── POINT OPTION ── */
        .oc-points-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .oc-point {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px;
          background: transparent;
          cursor: pointer;
          transition: all 0.18s;
          text-align: left;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
        }

        .oc-point:hover {
          border-color: rgba(82,196,155,0.35);
          background: rgba(82,196,155,0.04);
        }

        .oc-point.selected {
          border-color: #52c49b;
          background: rgba(82,196,155,0.08);
        }

        .oc-point-icon {
          font-size: 1.3rem;
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .oc-point.selected .oc-point-icon {
          background: rgba(82,196,155,0.12);
        }

        .oc-point-info { flex: 1; min-width: 0; }

        .oc-point-name {
          font-size: 0.88rem; font-weight: 600; color: #fff;
          margin-bottom: 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .oc-point.selected .oc-point-name { color: #52c49b; }

        .oc-point-addr {
          font-size: 0.74rem; color: rgba(255,255,255,0.3);
          line-height: 1.3; font-weight: 300;
        }

        .oc-point-check {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          flex-shrink: 0; margin-top: 2px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
          font-size: 0.65rem;
        }

        .oc-point.selected .oc-point-check {
          background: #52c49b; border-color: #52c49b; color: #0d1f1c;
        }

        /* Selected preview */
        .oc-selected-preview {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          background: rgba(82,196,155,0.07);
          border: 1px solid rgba(82,196,155,0.2);
          border-radius: 10px;
          margin-top: 16px;
          font-size: 0.84rem;
        }

        .oc-selected-preview-icon { font-size: 1.2rem; }
        .oc-selected-preview-text { flex: 1; color: rgba(255,255,255,0.6); }
        .oc-selected-preview-text strong { color: #52c49b; display: block; font-size: 0.88rem; }

        /* Error */
        .oc-field-error {
          margin-top: 12px; font-size: 0.78rem; color: #e05c5c;
          display: flex; align-items: center; gap: 6px;
        }

        /* ── NOTES FIELD ── */
        .oc-notes-field { margin-top: 4px; }
        .oc-notes-field label {
          display: block; font-size: 0.78rem; font-weight: 500;
          color: rgba(255,255,255,0.4); text-transform: uppercase;
          letter-spacing: 0.06em; margin-bottom: 7px;
        }
        .oc-notes-field textarea {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.92rem;
          outline: none; transition: all 0.2s; resize: none;
        }
        .oc-notes-field textarea::placeholder { color: rgba(255,255,255,0.2); }
        .oc-notes-field textarea:focus {
          border-color: #52c49b; background: rgba(82,196,155,0.05);
          box-shadow: 0 0 0 3px rgba(82,196,155,0.1);
        }

        /* ── PAYMENT ── */
        .oc-payment-options { display: flex; flex-direction: column; gap: 10px; }

        .oc-payment-opt {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; background: transparent;
          cursor: pointer; transition: all 0.18s;
          text-align: left; width: 100%; font-family: 'DM Sans', sans-serif;
        }

        .oc-payment-opt:hover { border-color: rgba(82,196,155,0.3); }
        .oc-payment-opt.active { border-color: #52c49b; background: rgba(82,196,155,0.07); }

        .oc-payment-icon { font-size: 1.3rem; }
        .oc-payment-label { font-size: 0.9rem; font-weight: 500; color: #fff; flex: 1; }

        .oc-payment-radio {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }

        .oc-payment-opt.active .oc-payment-radio { border-color: #52c49b; }

        .oc-payment-radio-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #52c49b; opacity: 0; transition: opacity 0.15s;
        }

        .oc-payment-opt.active .oc-payment-radio-dot { opacity: 1; }

        /* ── RIGHT SUMMARY ── */
        .oc-right { width: 320px; min-width: 320px; }

        .oc-summary-card {
          background: #111820;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
          position: sticky; top: 84px;
          animation: fadeUp 0.4s ease both; animation-delay: 0.1s;
        }

        .oc-restaurant-strip {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .oc-restaurant-emoji {
          width: 42px; height: 42px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; flex-shrink: 0;
        }

        .oc-restaurant-name { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff; }
        .oc-restaurant-sub  { font-size: 0.76rem; color: rgba(255,255,255,0.3); margin-top: 1px; }

        .oc-summary-items { padding: 16px 20px; }

        .oc-summary-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .oc-summary-item:last-child { border-bottom: none; }

        .oc-summary-item-left { display: flex; align-items: center; gap: 8px; }

        .oc-summary-item-qty {
          width: 22px; height: 22px; border-radius: 6px;
          background: rgba(82,196,155,0.1); color: #52c49b;
          font-size: 0.75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .oc-summary-item-name { font-size: 0.85rem; color: rgba(255,255,255,0.7); }
        .oc-summary-item-price { font-size: 0.85rem; color: rgba(255,255,255,0.5); white-space: nowrap; }

        .oc-totals { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); }

        .oc-total-row {
          display: flex; justify-content: space-between;
          font-size: 0.84rem; color: rgba(255,255,255,0.4); margin-bottom: 8px;
        }

        .oc-total-row.grand {
          font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700;
          color: #fff; margin-top: 12px; padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.08); margin-bottom: 0;
        }

        .oc-total-row.grand span:last-child { color: #52c49b; }

        .oc-place-btn {
          display: block; width: 100%; padding: 15px;
          background: #52c49b; border: none; border-radius: 0 0 16px 16px;
          color: #0d1f1c; font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.02em;
        }

        .oc-place-btn:hover:not(:disabled) { background: #63d4ab; }
        .oc-place-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .oc-spinner {
          display: inline-block; width: 15px; height: 15px;
          border: 2px solid rgba(13,31,28,0.3); border-top-color: #0d1f1c;
          border-radius: 50%; animation: spin 0.6s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── RESPONSIVE ── */
        @media (max-width: 760px) {
          .oc-nav { padding: 0 20px; }
          .oc-steps { padding: 16px 20px; }
          .oc-step-label { display: none; }
          .oc-body { flex-direction: column-reverse; padding: 20px; gap: 20px; }
          .oc-right { width: 100%; min-width: unset; }
          .oc-summary-card { position: static; }
          .oc-points-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="oc-page">

        {/* NAVBAR */}
        <nav className="oc-nav">
          <button className="oc-nav-back" onClick={() => navigate("/menu")}>← Back to menu</button>
          <div className="oc-nav-logo">Click<span>Bite</span></div>
          <div style={{ width: 120 }} />
        </nav>

        {/* STEPS */}
        <div className="oc-steps">
          <div className="oc-step done">
            <div className="oc-step-dot">✓</div>
            <span className="oc-step-label">Menu</span>
          </div>
          <div className="oc-step-line" />
          <div className="oc-step active">
            <div className="oc-step-dot">2</div>
            <span className="oc-step-label">Confirm</span>
          </div>
          <div className="oc-step-line" />
          <div className="oc-step">
            <div className="oc-step-dot">3</div>
            <span className="oc-step-label">Track</span>
          </div>
        </div>

        {/* BODY */}
        <div className="oc-body">
          <div className="oc-left">

            {/* DELIVERY POINT SELECTOR */}
            <div className="oc-card" style={{ animationDelay: "0s" }}>
              <div className="oc-card-title">
                <span>📍</span> Delivery point
              </div>
              <div className="oc-card-subtitle">
                Choose one of the available drop-off locations near you
              </div>

              {Object.entries(grouped).map(([zone, points]) => (
                <div key={zone}>
                  <div className="oc-zone-label">{zone}</div>
                  <div className="oc-points-grid">
                    {points.map(point => (
                      <button
                        key={point.id}
                        className={"oc-point" + (selectedPoint?.id === point.id ? " selected" : "")}
                        onClick={() => { setSelectedPoint(point); setError(""); }}
                      >
                        <div className="oc-point-icon">{point.icon}</div>
                        <div className="oc-point-info">
                          <div className="oc-point-name">{point.name}</div>
                          <div className="oc-point-addr">{point.address}</div>
                        </div>
                        <div className="oc-point-check">
                          {selectedPoint?.id === point.id && "✓"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {error && <div className="oc-field-error">⚠️ {error}</div>}

              {selectedPoint && (
                <div className="oc-selected-preview">
                  <span className="oc-selected-preview-icon">{selectedPoint.icon}</span>
                  <div className="oc-selected-preview-text">
                    <strong>{selectedPoint.name}</strong>
                    {selectedPoint.address}
                  </div>
                </div>
              )}

              <div className="oc-notes-field" style={{ marginTop: 20 }}>
                <label>
                  Additional notes&nbsp;
                  <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 300, textTransform: "none", letterSpacing: 0 }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Allergies, special requests…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* PAYMENT */}
            <div className="oc-card" style={{ animationDelay: "0.08s" }}>
              <div className="oc-card-title"><span>💳</span> Payment method</div>
              <div className="oc-payment-options">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.key}
                    className={"oc-payment-opt" + (paymentMethod === pm.key ? " active" : "")}
                    onClick={() => setPaymentMethod(pm.key)}
                  >
                    <span className="oc-payment-icon">{pm.icon}</span>
                    <span className="oc-payment-label">{pm.label}</span>
                    <div className="oc-payment-radio">
                      <div className="oc-payment-radio-dot" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="oc-right">
            <div className="oc-summary-card">
              <div className="oc-restaurant-strip">
                <div
                  className="oc-restaurant-emoji"
                  style={{ background: "linear-gradient(135deg, " + order.restaurant.color + "33, " + order.restaurant.color + "55)" }}
                >
                  {order.restaurant.image}
                </div>
                <div>
                  <div className="oc-restaurant-name">{order.restaurant.name}</div>
                  <div className="oc-restaurant-sub">{order.items.length} items</div>
                </div>
              </div>

              <div className="oc-summary-items">
                {order.items.map(item => (
                  <div key={item.id} className="oc-summary-item">
                    <div className="oc-summary-item-left">
                      <div className="oc-summary-item-qty">{item.qty}</div>
                      <span className="oc-summary-item-name">{item.name}</span>
                    </div>
                    <span className="oc-summary-item-price">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="oc-totals">
                <div className="oc-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="oc-total-row"><span>Delivery fee</span><span>${order.deliveryFee.toFixed(2)}</span></div>
                <div className="oc-total-row grand">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button className="oc-place-btn" onClick={handlePlace} disabled={placing}>
                {placing && <span className="oc-spinner" />}
                {placing ? "Placing order…" : "Place order  →"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}