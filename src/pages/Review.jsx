import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// MOCK DATA — en producción vendrá del pedido
// completado: GET /api/orders/:id
// ─────────────────────────────────────────────
const mockCompletedOrder = {
  id: "ORD-2024-0042",
  restaurant: {
    id: 1,
    name: "Burger Palace",
    image: "🍔",
    color: "#f97316",
    category: "Burgers",
  },
  items: [
    { id: 1, name: "Classic Smash",   image: "🍔", price: 10.99, qty: 2 },
    { id: 2, name: "Crispy Fries",    image: "🍟", price: 3.99,  qty: 1 },
    { id: 3, name: "Chocolate Shake", image: "🥤", price: 5.99,  qty: 1 },
  ],
  deliveryPoint: "Campus Central",
  deliveredAt: "Today at 2:34 PM",
};
// ─────────────────────────────────────────────

const RATING_LABELS = {
  0: "Tap a star to rate",
  1: "Terrible 😞",
  2: "Not great 😕",
  3: "It was okay 😐",
  4: "Pretty good 😊",
  5: "Excellent! 🤩",
};

const QUICK_TAGS = [
  "Great taste", "Fast delivery", "Hot & fresh",
  "Good portions", "Well packaged", "Friendly service",
  "Would order again", "Great value",
];

export default function Review() {
  const navigate = useNavigate();
  const order = mockCompletedOrder;

  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [comment, setComment]     = useState("");
  const [tags, setTags]           = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitting(true);
    // Simula POST /api/reviews  { orderId, restaurantId, rating, comment, tags }
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const displayRating = hovered || rating;

  // ── SUCCESS SCREEN ──
  if (submitted) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .rv-success {
            min-height: 100vh; background: #0d1117;
            font-family: 'DM Sans', sans-serif;
            display: flex; align-items: center; justify-content: center;
            padding: 40px 20px;
          }

          .rv-success-card {
            background: #111820;
            border: 1px solid rgba(82,196,155,0.2);
            border-radius: 24px;
            padding: 56px 48px;
            text-align: center;
            max-width: 420px; width: 100%;
            animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
          }

          @keyframes popIn {
            from { opacity: 0; transform: scale(0.85); }
            to   { opacity: 1; transform: scale(1); }
          }

          .rv-success-stars {
            font-size: 2rem; letter-spacing: 4px;
            margin-bottom: 20px;
            display: block;
          }

          .rv-success-card h1 {
            font-family: 'Syne', sans-serif;
            font-size: 1.7rem; font-weight: 800; color: #fff; margin-bottom: 10px;
          }

          .rv-success-card p {
            font-size: 0.9rem; color: rgba(255,255,255,0.4);
            line-height: 1.6; font-weight: 300; margin-bottom: 32px;
          }

          .rv-success-rating-display {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 20px;
            background: rgba(251,191,36,0.08);
            border: 1px solid rgba(251,191,36,0.2);
            border-radius: 999px;
            font-size: 0.88rem; color: #fbbf24; font-weight: 600;
            margin-bottom: 28px;
          }

          .rv-success-actions { display: flex; flex-direction: column; gap: 10px; }

          .rv-btn-primary {
            padding: 13px; background: #52c49b; border: none; border-radius: 10px;
            color: #0d1f1c; font-family: 'Syne', sans-serif;
            font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
          }

          .rv-btn-primary:hover { background: #63d4ab; transform: translateY(-1px); }

          .rv-btn-ghost {
            padding: 13px; background: transparent;
            border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
            color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif;
            font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
          }

          .rv-btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
        `}</style>

        <div className="rv-success">
          <div className="rv-success-card">
            <span className="rv-success-stars">
              {"⭐".repeat(rating)}
            </span>
            <h1>Thanks for your review!</h1>
            <p>
              Your feedback helps <strong style={{ color: "#fff" }}>{order.restaurant.name}</strong> and
              other customers make better choices.
            </p>
            <div className="rv-success-rating-display">
              ⭐ {rating}/5 — {RATING_LABELS[rating].split(" ").slice(0, -1).join(" ") || RATING_LABELS[rating]}
            </div>
            <div className="rv-success-actions">
              <button className="rv-btn-primary" onClick={() => navigate("/restaurants")}>
                Order again
              </button>
              <button className="rv-btn-ghost" onClick={() => navigate("/order-history")}>
                View my orders
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

        .rv-page {
          min-height: 100vh; background: #0d1117;
          font-family: 'DM Sans', sans-serif; color: #fff;
        }

        /* ── NAVBAR ── */
        .rv-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 64px;
          background: #111820;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; z-index: 100;
        }

        .rv-nav-back {
          background: transparent; border: none;
          color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; cursor: pointer; transition: color 0.2s; padding: 0;
        }

        .rv-nav-back:hover { color: #52c49b; }

        .rv-nav-logo {
          font-family: 'Syne', sans-serif; font-size: 1.4rem;
          font-weight: 800; color: #52c49b; letter-spacing: -0.5px;
        }

        .rv-nav-logo span { color: #fff; }

        /* ── MAIN LAYOUT ── */
        .rv-body {
          max-width: 620px; margin: 0 auto;
          padding: 48px 40px 80px;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* ── HEADER ── */
        .rv-header { text-align: center; margin-bottom: 8px; }

        .rv-header h1 {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem; font-weight: 800; color: #fff;
          margin-bottom: 8px;
        }

        .rv-header p {
          font-size: 0.9rem; color: rgba(255,255,255,0.35);
          font-weight: 300; line-height: 1.5;
        }

        /* ── ORDER SUMMARY STRIP ── */
        .rv-order-strip {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px;
          background: #111820;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          animation: fadeUp 0.3s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rv-strip-emoji {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; flex-shrink: 0;
        }

        .rv-strip-info { flex: 1; }

        .rv-strip-name {
          font-family: 'Syne', sans-serif; font-size: 1rem;
          font-weight: 700; color: #fff; margin-bottom: 3px;
        }

        .rv-strip-meta {
          font-size: 0.78rem; color: rgba(255,255,255,0.3); font-weight: 300;
        }

        .rv-strip-id {
          font-size: 0.72rem; color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
          padding: 4px 10px; border-radius: 6px;
          font-family: monospace; letter-spacing: 0.04em;
        }

        /* ── CARD ── */
        .rv-card {
          background: #111820;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 28px;
          animation: fadeUp 0.35s ease both;
        }

        .rv-card-title {
          font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
          color: #fff; margin-bottom: 6px;
          display: flex; align-items: center; gap: 8px;
        }

        .rv-card-subtitle {
          font-size: 0.82rem; color: rgba(255,255,255,0.3);
          margin-bottom: 24px; font-weight: 300;
        }

        /* ── STAR RATING ── */
        .rv-stars-wrap { text-align: center; }

        .rv-stars {
          display: flex; justify-content: center; gap: 8px;
          margin-bottom: 12px;
        }

        .rv-star {
          font-size: 2.6rem; cursor: pointer;
          transition: transform 0.15s, filter 0.15s;
          filter: grayscale(1) opacity(0.3);
          user-select: none;
          line-height: 1;
        }

        .rv-star.lit {
          filter: none;
          transform: scale(1.08);
        }

        .rv-star:hover { transform: scale(1.2); }

        .rv-rating-label {
          font-size: 0.9rem; font-weight: 500;
          color: rgba(255,255,255,0.4);
          min-height: 1.4em;
          transition: all 0.2s;
        }

        .rv-rating-label.has-rating { color: #fbbf24; }

        .rv-no-rating-warn {
          margin-top: 10px; font-size: 0.78rem; color: #e05c5c;
        }

        /* ── QUICK TAGS ── */
        .rv-tags {
          display: flex; flex-wrap: wrap; gap: 8px;
        }

        .rv-tag {
          padding: 7px 14px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px; background: transparent;
          color: rgba(255,255,255,0.45); font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; cursor: pointer;
          transition: all 0.18s;
        }

        .rv-tag:hover {
          border-color: rgba(82,196,155,0.35);
          color: rgba(255,255,255,0.8);
        }

        .rv-tag.active {
          background: rgba(82,196,155,0.1);
          border-color: #52c49b; color: #52c49b;
          font-weight: 500;
        }

        /* ── COMMENT ── */
        .rv-textarea {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.92rem;
          outline: none; transition: all 0.2s; resize: none;
          line-height: 1.6;
        }

        .rv-textarea::placeholder { color: rgba(255,255,255,0.2); }

        .rv-textarea:focus {
          border-color: #52c49b; background: rgba(82,196,155,0.04);
          box-shadow: 0 0 0 3px rgba(82,196,155,0.1);
        }

        .rv-char-count {
          text-align: right; font-size: 0.74rem;
          color: rgba(255,255,255,0.2); margin-top: 6px;
        }

        /* ── SUBMIT ── */
        .rv-submit-wrap { display: flex; flex-direction: column; gap: 10px; }

        .rv-submit {
          width: 100%; padding: 15px;
          background: #52c49b; border: none; border-radius: 12px;
          color: #0d1f1c; font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.02em;
        }

        .rv-submit:hover:not(:disabled) {
          background: #63d4ab; transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(82,196,155,0.3);
        }

        .rv-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .rv-skip {
          width: 100%; padding: 13px; background: transparent;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          color: rgba(255,255,255,0.35); font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
        }

        .rv-skip:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.55); }

        .rv-spinner {
          display: inline-block; width: 15px; height: 15px;
          border: 2px solid rgba(13,31,28,0.3); border-top-color: #0d1f1c;
          border-radius: 50%; animation: spin 0.6s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── ITEMS REVIEWED ── */
        .rv-items-list { display: flex; flex-direction: column; gap: 8px; }

        .rv-item-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
        }

        .rv-item-emoji { font-size: 1.1rem; }

        .rv-item-name {
          flex: 1; font-size: 0.85rem; color: rgba(255,255,255,0.6);
        }

        .rv-item-qty {
          font-size: 0.78rem; color: rgba(255,255,255,0.25);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 600px) {
          .rv-nav { padding: 0 20px; }
          .rv-body { padding: 32px 20px 60px; }
          .rv-star { font-size: 2rem; }
        }
      `}</style>

      <div className="rv-page">

        {/* NAVBAR */}
        <nav className="rv-nav">
          <button className="rv-nav-back" onClick={() => navigate("/order-history")}>
            ← My orders
          </button>
          <div className="rv-nav-logo">Click<span>Bite</span></div>
          <div style={{ width: 80 }} />
        </nav>

        <div className="rv-body">

          {/* HEADER */}
          <div className="rv-header">
            <h1>How was your order?</h1>
            <p>Your honest feedback helps the restaurant improve<br />and helps other customers choose.</p>
          </div>

          {/* ORDER STRIP */}
          <div className="rv-order-strip">
            <div
              className="rv-strip-emoji"
              style={{ background: "linear-gradient(135deg, " + order.restaurant.color + "33, " + order.restaurant.color + "55)" }}
            >
              {order.restaurant.image}
            </div>
            <div className="rv-strip-info">
              <div className="rv-strip-name">{order.restaurant.name}</div>
              <div className="rv-strip-meta">
                {order.items.length} items · {order.deliveryPoint} · {order.deliveredAt}
              </div>
            </div>
            <div className="rv-strip-id">{order.id}</div>
          </div>

          {/* STAR RATING */}
          <div className="rv-card" style={{ animationDelay: "0.05s" }}>
            <div className="rv-card-title">⭐ Overall rating</div>
            <div className="rv-card-subtitle">How would you rate your overall experience?</div>

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

          {/* QUICK TAGS */}
          <div className="rv-card" style={{ animationDelay: "0.1s" }}>
            <div className="rv-card-title">🏷️ What stood out?</div>
            <div className="rv-card-subtitle">Select all that apply — optional</div>
            <div className="rv-tags">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  className={"rv-tag" + (tags.includes(tag) ? " active" : "")}
                  onClick={() => toggleTag(tag)}
                >
                  {tags.includes(tag) ? "✓ " : ""}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* COMMENT */}
          <div className="rv-card" style={{ animationDelay: "0.15s" }}>
            <div className="rv-card-title">💬 Leave a comment</div>
            <div className="rv-card-subtitle">Optional — tell the restaurant more about your experience</div>
            <textarea
              className="rv-textarea"
              rows={4}
              maxLength={300}
              placeholder="The burger was amazing, fries were crispy and hot, delivery was fast…"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <div className="rv-char-count">{comment.length}/300</div>
          </div>

          {/* ITEMS ORDERED */}
          <div className="rv-card" style={{ animationDelay: "0.2s" }}>
            <div className="rv-card-title">🧾 Items you ordered</div>
            <div className="rv-card-subtitle">Your order from {order.restaurant.name}</div>
            <div className="rv-items-list">
              {order.items.map(item => (
                <div key={item.id} className="rv-item-row">
                  <span className="rv-item-emoji">{item.image}</span>
                  <span className="rv-item-name">{item.name}</span>
                  <span className="rv-item-qty">×{item.qty}  ${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SUBMIT */}
          <div className="rv-submit-wrap">
            <button
              className="rv-submit"
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              {submitting && <span className="rv-spinner" />}
              {submitting
                ? "Submitting…"
                : rating === 0
                ? "Select a rating to continue"
                : "Submit review"}
            </button>
            <button className="rv-skip" onClick={() => navigate("/order-history")}>
              Skip for now
            </button>
          </div>

        </div>
      </div>
    </>
  );
}