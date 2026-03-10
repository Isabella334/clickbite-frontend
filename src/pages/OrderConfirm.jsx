import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { helpers, orders as ordersApi } from "../services/api";

// Puntos de entrega predefinidos (Guatemala City)
// Reemplazar con GET /api/v1/delivery-points cuando el backend lo implemente
const DELIVERY_POINTS = [
  { id: 1, name: "Campus Central",      zone: "Zona 12", address: "Av. Petapa 2-01, Zona 12",          icon: "🏫", lat: 14.5894, lng: -90.5513 },
  { id: 2, name: "Torre Empresarial",   zone: "Zona 10", address: "Blvd. Los Próceres 24-69, Zona 10", icon: "🏢", lat: 14.5981, lng: -90.5133 },
  { id: 3, name: "Plaza Fontabella",    zone: "Zona 10", address: "Av. La Reforma 15-54, Zona 10",     icon: "🛍️", lat: 14.6016, lng: -90.5069 },
  { id: 4, name: "Parque Las Américas", zone: "Zona 13", address: "Av. Las Américas, Zona 13",         icon: "🌳", lat: 14.5918, lng: -90.5234 },
  { id: 5, name: "Centro Histórico",    zone: "Zona 1",  address: "6a Av. & 6a Calle, Zona 1",         icon: "🏛️", lat: 14.6407, lng: -90.5133 },
];

const groupByZone = (points) =>
  points.reduce((acc, p) => {
    if (!acc[p.zone]) acc[p.zone] = [];
    acc[p.zone].push(p);
    return acc;
  }, {});

export default function OrderConfirm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Datos recibidos desde Menu.jsx via navigate state
  const { restaurantId, restaurantName, cartItems = [], cartTotal = 0 } = location.state ?? {};
  const session = helpers.getSession();

  const grouped = groupByZone(DELIVERY_POINTS);

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [error,         setError]         = useState("");
  const [placing,       setPlacing]       = useState(false);
  const [placed,        setPlaced]        = useState(false);

  const handlePlace = async () => {
    if (!selectedPoint) { setError("Por favor selecciona un punto de entrega."); return; }
    if (!session?.id)   { setError("Debes iniciar sesión para realizar un pedido."); return; }
    setError("");
    setPlacing(true);
    try {
      const payload = helpers.toCreateOrderPayload({
        userId:        session.id,
        restaurantId,
        cartItems,
        deliveryPoint: selectedPoint,
      });
      await ordersApi.create(payload);
      setPlaced(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  // ── PANTALLA DE ÉXITO ─────────────────────────────────────────────────────
  if (placed) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .oc-success {
            min-height: 100vh; background: #0d1117;
            font-family: 'DM Sans', sans-serif;
            display: flex; align-items: center; justify-content: center;
            padding: 40px 20px;
          }
          .oc-success-card {
            background: #111820; border: 1px solid rgba(82,196,155,0.2);
            border-radius: 24px; padding: 56px 48px;
            text-align: center; max-width: 440px; width: 100%;
            animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
          }
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.85); }
            to   { opacity: 1; transform: scale(1); }
          }
          .oc-success-icon {
            width: 80px; height: 80px; background: rgba(82,196,155,0.12);
            border: 2px solid rgba(82,196,155,0.3); border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem; margin: 0 auto 24px;
          }
          .oc-success-card h1 {
            font-family: 'Syne', sans-serif; font-size: 1.7rem;
            font-weight: 800; color: #fff; margin-bottom: 10px;
          }
          .oc-success-card p {
            font-size: 0.9rem; color: rgba(255,255,255,0.4);
            line-height: 1.6; font-weight: 300; margin-bottom: 24px;
          }
          .oc-success-point {
            display: flex; align-items: center; gap: 10px;
            padding: 14px 18px; background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px; margin-bottom: 28px; text-align: left;
          }
          .oc-success-point-icon { font-size: 1.4rem; }
          .oc-success-point-name { font-size: 0.9rem; font-weight: 600; color: #fff; }
          .oc-success-point-addr { font-size: 0.76rem; color: rgba(255,255,255,0.35); margin-top: 2px; }
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
            <h1>¡Pedido realizado!</h1>
            <p>
              Tu pedido de <strong style={{ color: "#fff" }}>{restaurantName ?? "el restaurante"}</strong> fue
              confirmado y será entregado en:
            </p>
            <div className="oc-success-point">
              <span className="oc-success-point-icon">{selectedPoint.icon}</span>
              <div>
                <div className="oc-success-point-name">{selectedPoint.name}</div>
                <div className="oc-success-point-addr">{selectedPoint.address}</div>
              </div>
            </div>
            <div className="oc-success-actions">
              <button className="oc-btn-primary" onClick={() => navigate("/order-history")}>
                Ver mis pedidos
              </button>
              <button className="oc-btn-ghost" onClick={() => navigate("/restaurants")}>
                Volver a restaurantes
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── PANTALLA PRINCIPAL ────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .oc-page { min-height: 100vh; background: #0d1117; font-family: 'DM Sans', sans-serif; color: #fff; }

        /* NAVBAR */
        .oc-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 64px; background: #111820;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; z-index: 100;
        }
        .oc-nav-back {
          background: transparent; border: none; color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          cursor: pointer; transition: color 0.2s; padding: 0;
        }
        .oc-nav-back:hover { color: #52c49b; }
        .oc-nav-logo { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: #52c49b; letter-spacing: -0.5px; }
        .oc-nav-logo span { color: #fff; }

        /* PASOS */
        .oc-steps {
          display: flex; align-items: center; justify-content: center;
          padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05);
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

        /* LAYOUT */
        .oc-body { display: flex; gap: 28px; padding: 40px; max-width: 1000px; margin: 0 auto; }
        .oc-left { flex: 1; }

        /* CARD */
        .oc-card {
          background: #111820; border: 1px solid rgba(255,255,255,0.06);
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
        .oc-card-subtitle { font-size: 0.8rem; color: rgba(255,255,255,0.3); margin-bottom: 18px; font-weight: 300; }

        /* ZONA */
        .oc-zone-label {
          font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.25);
          text-transform: uppercase; letter-spacing: 0.1em; margin: 16px 0 8px;
        }
        .oc-zone-label:first-child { margin-top: 0; }

        /* PUNTOS */
        .oc-points-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .oc-point {
          display: flex; align-items: flex-start; gap: 10px; padding: 14px;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 11px;
          background: transparent; cursor: pointer; transition: all 0.18s;
          text-align: left; width: 100%; font-family: 'DM Sans', sans-serif;
        }
        .oc-point:hover { border-color: rgba(82,196,155,0.35); background: rgba(82,196,155,0.04); }
        .oc-point.selected { border-color: #52c49b; background: rgba(82,196,155,0.08); }
        .oc-point-icon {
          font-size: 1.3rem; width: 36px; height: 36px;
          background: rgba(255,255,255,0.04); border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .oc-point.selected .oc-point-icon { background: rgba(82,196,155,0.12); }
        .oc-point-info { flex: 1; min-width: 0; }
        .oc-point-name {
          font-size: 0.88rem; font-weight: 600; color: #fff; margin-bottom: 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .oc-point.selected .oc-point-name { color: #52c49b; }
        .oc-point-addr { font-size: 0.74rem; color: rgba(255,255,255,0.3); line-height: 1.3; font-weight: 300; }
        .oc-point-check {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15); flex-shrink: 0; margin-top: 2px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; font-size: 0.65rem;
        }
        .oc-point.selected .oc-point-check { background: #52c49b; border-color: #52c49b; color: #0d1f1c; }

        /* PREVIEW */
        .oc-selected-preview {
          display: flex; align-items: center; gap: 10px; padding: 12px 14px;
          background: rgba(82,196,155,0.07); border: 1px solid rgba(82,196,155,0.2);
          border-radius: 10px; margin-top: 16px; font-size: 0.84rem;
        }
        .oc-selected-preview-icon { font-size: 1.2rem; }
        .oc-selected-preview-text { flex: 1; color: rgba(255,255,255,0.6); }
        .oc-selected-preview-text strong { color: #52c49b; display: block; font-size: 0.88rem; }

        /* ERROR */
        .oc-field-error { margin-top: 12px; font-size: 0.78rem; color: #e05c5c; display: flex; align-items: center; gap: 6px; }

        /* RESUMEN */
        .oc-right { width: 320px; min-width: 320px; }
        .oc-summary-card {
          background: #111820; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
          position: sticky; top: 84px;
          animation: fadeUp 0.4s ease both; animation-delay: 0.1s;
        }
        .oc-restaurant-strip {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
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
          padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .oc-summary-item:last-child { border-bottom: none; }
        .oc-summary-item-left { display: flex; align-items: center; gap: 8px; }
        .oc-summary-item-qty {
          width: 22px; height: 22px; border-radius: 6px;
          background: rgba(82,196,155,0.1); color: #52c49b;
          font-size: 0.75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .oc-summary-item-name  { font-size: 0.85rem; color: rgba(255,255,255,0.7); }
        .oc-summary-item-price { font-size: 0.85rem; color: rgba(255,255,255,0.5); white-space: nowrap; }
        .oc-totals { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
        .oc-total-row {
          display: flex; justify-content: space-between;
          font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; color: #fff;
        }
        .oc-total-row span:last-child { color: #52c49b; }
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

        /* RESPONSIVE */
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
          <button className="oc-nav-back" onClick={() => navigate(-1)}>← Volver al menú</button>
          <div className="oc-nav-logo">Click<span>Bite</span></div>
          <div style={{ width: 120 }} />
        </nav>


        {/* CUERPO */}
        <div className="oc-body">
          <div className="oc-left">

            {/* SELECTOR DE PUNTO DE ENTREGA */}
            <div className="oc-card">
              <div className="oc-card-title">📍 Punto de entrega</div>
              <div className="oc-card-subtitle">Elige uno de los puntos de entrega disponibles</div>

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
            </div>

          </div>

          {/* RESUMEN DEL PEDIDO */}
          <div className="oc-right">
            <div className="oc-summary-card">
              <div className="oc-restaurant-strip">
                <div className="oc-restaurant-emoji" style={{ background: "linear-gradient(135deg, #52c49b33, #52c49b55)" }}>
                  🍽️
                </div>
                <div>
                  <div className="oc-restaurant-name">{restaurantName ?? "Restaurante"}</div>
                  <div className="oc-restaurant-sub">{cartItems.length} producto{cartItems.length !== 1 ? "s" : ""}</div>
                </div>
              </div>

              <div className="oc-summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="oc-summary-item">
                    <div className="oc-summary-item-left">
                      <div className="oc-summary-item-qty">{item.qty}</div>
                      <span className="oc-summary-item-name">{item.name}</span>
                    </div>
                    <span className="oc-summary-item-price">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="oc-totals">
                <div className="oc-total-row">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div style={{ color: "#e05c5c", fontSize: "0.82rem", padding: "0 20px 12px", textAlign: "center" }}>
                  ⚠️ {error}
                </div>
              )}

              <button className="oc-place-btn" onClick={handlePlace} disabled={placing}>
                {placing && <span className="oc-spinner" />}
                {placing ? "Procesando…" : "Realizar pedido →"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}