import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { helpers, reviews as reviewsApi } from "../services/api";

const RATING_LABELS = {
  0: "Toca una estrella para calificar",
  1: "Muy malo 😞",
  2: "No estuvo bien 😕",
  3: "Regular 😐",
  4: "Bastante bueno 😊",
  5: "¡Excelente! 🤩",
};

export default function Review() {
  const navigate = useNavigate();
  const location = useLocation();
  const session  = helpers.getSession();

  // Datos recibidos desde OrderHistory.jsx via navigate state
  const { restaurantId } = location.state ?? {};

  const [rating,     setRating]     = useState(0);
  const [hovered,    setHovered]    = useState(0);
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState("");

  const handleSubmit = async () => {
    if (rating === 0) return;
    if (!session?.id || !restaurantId) { setError("Faltan datos para enviar la reseña."); return; }
    setSubmitting(true);
    setError("");
    try {
      const payload = helpers.toCreateReviewPayload({
        userId:       session.id,
        restaurantId,
        rating,
        comment,
      });
      await reviewsApi.create(payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hovered || rating;

  // ── PANTALLA DE ÉXITO ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .rv-success {
            min-height: 100vh; background: #0d1117; font-family: 'DM Sans', sans-serif;
            display: flex; align-items: center; justify-content: center; padding: 40px 20px;
          }
          .rv-success-card {
            background: #111820; border: 1px solid rgba(82,196,155,0.2);
            border-radius: 24px; padding: 56px 48px;
            text-align: center; max-width: 420px; width: 100%;
            animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
          }
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.85); }
            to   { opacity: 1; transform: scale(1); }
          }
          .rv-success-stars { font-size: 2rem; letter-spacing: 4px; margin-bottom: 20px; display: block; }
          .rv-success-card h1 { font-family: 'Syne', sans-serif; font-size: 1.7rem; font-weight: 800; color: #fff; margin-bottom: 10px; }
          .rv-success-card p  { font-size: 0.9rem; color: rgba(255,255,255,0.4); line-height: 1.6; font-weight: 300; margin-bottom: 32px; }
          .rv-success-rating-display {
            display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
            background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2);
            border-radius: 999px; font-size: 0.88rem; color: #fbbf24; font-weight: 600; margin-bottom: 28px;
          }
          .rv-success-actions { display: flex; flex-direction: column; gap: 10px; }
          .rv-btn-primary {
            padding: 13px; background: #52c49b; border: none; border-radius: 10px;
            color: #0d1f1c; font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700;
            cursor: pointer; transition: all 0.2s;
          }
          .rv-btn-primary:hover { background: #63d4ab; transform: translateY(-1px); }
          .rv-btn-ghost {
            padding: 13px; background: transparent; border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px; color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif;
            font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
          }
          .rv-btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
        `}</style>

        <div className="rv-success">
          <div className="rv-success-card">
            <span className="rv-success-stars">{"⭐".repeat(rating)}</span>
            <h1>¡Gracias por tu reseña!</h1>
            <p>Tu opinión ayuda al restaurante a mejorar y a otros clientes a elegir mejor.</p>
            <div className="rv-success-rating-display">
              ⭐ {rating}/5 — {RATING_LABELS[rating]}
            </div>
            <div className="rv-success-actions">
              <button className="rv-btn-primary" onClick={() => navigate("/restaurants")}>
                Pedir de nuevo
              </button>
              <button className="rv-btn-ghost" onClick={() => navigate("/order-history")}>
                Ver mis pedidos
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

        .rv-page { min-height: 100vh; background: #0d1117; font-family: 'DM Sans', sans-serif; color: #fff; }

        /* NAVBAR */
        .rv-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 64px; background: #111820;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; z-index: 100;
        }
        .rv-nav-back {
          background: transparent; border: none; color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          cursor: pointer; transition: color 0.2s; padding: 0;
        }
        .rv-nav-back:hover { color: #52c49b; }
        .rv-nav-logo { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: #52c49b; letter-spacing: -0.5px; }
        .rv-nav-logo span { color: #fff; }

        /* LAYOUT */
        .rv-body { max-width: 620px; margin: 0 auto; padding: 48px 40px 80px; display: flex; flex-direction: column; gap: 20px; }

        /* HEADER */
        .rv-header { text-align: center; margin-bottom: 8px; }
        .rv-header h1 { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
        .rv-header p  { font-size: 0.9rem; color: rgba(255,255,255,0.35); font-weight: 300; line-height: 1.5; }

        /* CARD */
        .rv-card {
          background: #111820; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 24px; animation: fadeUp 0.35s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rv-card-title    { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
        .rv-card-subtitle { font-size: 0.8rem; color: rgba(255,255,255,0.3); margin-bottom: 20px; font-weight: 300; }

        /* ESTRELLAS */
        .rv-stars-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .rv-stars { display: flex; gap: 8px; }
        .rv-star {
          font-size: 2.4rem; cursor: pointer; color: rgba(255,255,255,0.12);
          transition: all 0.15s; user-select: none; line-height: 1;
        }
        .rv-star.lit  { color: #fbbf24; text-shadow: 0 0 12px rgba(251,191,36,0.4); }
        .rv-star:hover { transform: scale(1.15); }
        .rv-rating-label { font-size: 0.88rem; color: rgba(255,255,255,0.25); transition: all 0.2s; min-height: 1.2em; }
        .rv-rating-label.has-rating { color: #fbbf24; font-weight: 500; }

        /* TEXTAREA */
        .rv-textarea {
          width: 100%; padding: 14px 16px; resize: none;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; outline: none; transition: all 0.2s;
        }
        .rv-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .rv-textarea:focus { border-color: #52c49b; background: rgba(82,196,155,0.04); box-shadow: 0 0 0 3px rgba(82,196,155,0.08); }
        .rv-char-count { font-size: 0.74rem; color: rgba(255,255,255,0.2); text-align: right; margin-top: 6px; }

        /* ERROR */
        .rv-error { font-size: 0.82rem; color: #e05c5c; text-align: center; padding: 4px 0; }

        /* BOTONES */
        .rv-submit-wrap { display: flex; flex-direction: column; gap: 10px; }
        .rv-submit {
          width: 100%; padding: 16px; background: #52c49b; border: none; border-radius: 12px;
          color: #0d1f1c; font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .rv-submit:hover:not(:disabled) { background: #63d4ab; transform: translateY(-1px); }
        .rv-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .rv-skip {
          width: 100%; padding: 13px; background: transparent;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
          color: rgba(255,255,255,0.3); font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
        }
        .rv-skip:hover { border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.55); }
        .rv-spinner {
          display: inline-block; width: 15px; height: 15px;
          border: 2px solid rgba(13,31,28,0.3); border-top-color: #0d1f1c;
          border-radius: 50%; animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* RESPONSIVE */
        @media (max-width: 600px) {
          .rv-nav  { padding: 0 20px; }
          .rv-body { padding: 32px 20px 60px; }
          .rv-star { font-size: 2rem; }
        }
      `}</style>

      <div className="rv-page">

        {/* NAVBAR */}
        <nav className="rv-nav">
          <button className="rv-nav-back" onClick={() => navigate("/order-history")}>← Mis pedidos</button>
          <div className="rv-nav-logo">Click<span>Bite</span></div>
          <div style={{ width: 100 }} />
        </nav>

        <div className="rv-body">

          {/* HEADER */}
          <div className="rv-header">
            <h1>¿Cómo estuvo tu pedido?</h1>
            <p>Tu opinión honesta ayuda al restaurante a mejorar<br />y a otros clientes a elegir mejor.</p>
          </div>

          {/* CALIFICACIÓN */}
          <div className="rv-card" style={{ animationDelay: "0.05s" }}>
            <div className="rv-card-title">⭐ Calificación general</div>
            <div className="rv-card-subtitle">¿Cómo calificarías tu experiencia?</div>
            <div className="rv-stars-wrap">
              <div className="rv-stars">
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    className={"rv-star" + (n <= displayRating ? " lit" : "")}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className={"rv-rating-label" + (displayRating > 0 ? " has-rating" : "")}>
                {RATING_LABELS[displayRating]}
              </div>
            </div>
          </div>

          {/* COMENTARIO */}
          <div className="rv-card" style={{ animationDelay: "0.1s" }}>
            <div className="rv-card-title">💬 Deja un comentario</div>
            <div className="rv-card-subtitle">Opcional — cuéntale al restaurante tu experiencia</div>
            <textarea
              className="rv-textarea"
              rows={4}
              maxLength={300}
              placeholder="La hamburguesa estaba increíble, las papas crujientes y calientes, la entrega fue rápida…"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <div className="rv-char-count">{comment.length}/300</div>
          </div>

          {/* ENVIAR */}
          <div className="rv-submit-wrap">
            {error && <div className="rv-error">⚠️ {error}</div>}
            <button
              className="rv-submit"
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              {submitting && <span className="rv-spinner" />}
              {submitting
                ? "Enviando…"
                : rating === 0
                ? "Selecciona una calificación para continuar"
                : "Enviar reseña"}
            </button>
            <button className="rv-skip" onClick={() => navigate("/order-history")}>
              Omitir por ahora
            </button>
          </div>

        </div>
      </div>
    </>
  );
}