import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockRestaurants = [
  { id: 1, name: "Burger Palace", category: "Burgers", rating: 4.8, time: "20-30", delivery: 1.99, image: "🍔", color: "#f97316" },
  { id: 2, name: "Pizza Mondo",   category: "Pizza",   rating: 4.6, time: "25-35", delivery: 0,    image: "🍕", color: "#ef4444" },
  { id: 3, name: "Sushi Zen",     category: "Sushi",   rating: 4.9, time: "30-45", delivery: 2.49, image: "🍣", color: "#8b5cf6" },
  { id: 4, name: "Taco Fiesta",   category: "Mexican", rating: 4.5, time: "15-25", delivery: 0,    image: "🌮", color: "#f59e0b" },
  { id: 5, name: "Noodle House",  category: "Asian",   rating: 4.7, time: "20-30", delivery: 1.49, image: "🍜", color: "#06b6d4" },
  { id: 6, name: "Green Bowl",    category: "Healthy", rating: 4.4, time: "15-20", delivery: 0,    image: "🥗", color: "#22c55e" },
  { id: 7, name: "Wing Stop",     category: "Chicken", rating: 4.3, time: "25-35", delivery: 1.99, image: "🍗", color: "#ec4899" },
  { id: 8, name: "The Pasta Co.", category: "Italian", rating: 4.6, time: "30-40", delivery: 0,    image: "🍝", color: "#a78bfa" },
  { id: 9, name: "Curry House",   category: "Indian",  rating: 4.8, time: "35-50", delivery: 2.99, image: "🍛", color: "#fb923c" },
];

const categories = ["All", "Burgers", "Pizza", "Sushi", "Mexican", "Asian", "Healthy", "Chicken", "Italian", "Indian"];

export default function Restaurants() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("rating");

  const filtered = mockRestaurants
    .filter(r => activeCategory === "All" || r.category === activeCategory)
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "time") return parseInt(a.time) - parseInt(b.time);
      if (sortBy === "delivery") return a.delivery - b.delivery;
      return 0;
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rs-page {
          min-height: 100vh;
          background: #0d1117;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* NAVBAR */
        .rs-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 64px;
          background: #111820;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .rs-nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: #52c49b;
          letter-spacing: -0.5px;
        }

        .rs-nav-logo span { color: #fff; }

        .rs-nav-search {
          flex: 1;
          max-width: 400px;
          margin: 0 32px;
          position: relative;
        }

        .rs-nav-search input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
        }

        .rs-nav-search input::placeholder { color: rgba(255,255,255,0.3); }

        .rs-nav-search input:focus {
          border-color: #52c49b;
          background: rgba(82,196,155,0.05);
          box-shadow: 0 0 0 3px rgba(82,196,155,0.1);
        }

        .rs-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.3);
          font-size: 0.95rem;
          pointer-events: none;
        }

        .rs-nav-right { display: flex; align-items: center; gap: 16px; }

        .rs-nav-history {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.6);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rs-nav-history:hover {
          border-color: rgba(82,196,155,0.4);
          color: #52c49b;
        }

        .rs-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #52c49b, #1a7a58);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
          border: 2px solid rgba(82,196,155,0.3);
          transition: border-color 0.2s;
        }

        .rs-avatar:hover { border-color: #52c49b; }

        /* MAIN CONTENT */
        .rs-main { padding: 40px; }

        /* HERO */
        .rs-hero { margin-bottom: 36px; }

        .rs-hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
        }

        .rs-hero h1 em { font-style: normal; color: #52c49b; }

        .rs-hero p {
          color: rgba(255,255,255,0.4);
          font-size: 0.95rem;
          font-weight: 300;
        }

        /* CONTROLS */
        .rs-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        /* CATEGORY PILLS */
        .rs-categories {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .rs-cat-pill {
          padding: 7px 16px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.83rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .rs-cat-pill:hover {
          border-color: rgba(82,196,155,0.4);
          color: rgba(255,255,255,0.8);
        }

        .rs-cat-pill.active {
          background: #52c49b;
          border-color: #52c49b;
          color: #0d1f1c;
          font-weight: 600;
        }

        /* SORT */
        .rs-sort {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rs-sort span {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.35);
          white-space: nowrap;
        }

        .rs-sort select {
          padding: 7px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.7);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.83rem;
          outline: none;
          cursor: pointer;
        }

        .rs-sort select option { background: #1a2535; }

        /* RESULTS COUNT */
        .rs-count {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.3);
          margin-bottom: 20px;
        }

        .rs-count strong { color: #52c49b; }

        /* GRID */
        .rs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        /* CARD */
        .rs-card {
          background: #111820;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.25s;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rs-card:hover {
          border-color: rgba(82,196,155,0.25);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }

        .rs-card-image {
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          position: relative;
          overflow: hidden;
        }

        .rs-card-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          background: rgba(0,0,0,0.5);
          color: #fff;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .rs-card-free {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          background: rgba(82,196,155,0.2);
          color: #52c49b;
          border: 1px solid rgba(82,196,155,0.3);
        }

        .rs-card-body { padding: 16px; }

        .rs-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .rs-card-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }

        .rs-card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #fbbf24;
          white-space: nowrap;
        }

        .rs-card-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 14px;
        }

        .rs-card-meta-item {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rs-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rs-card-category {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.04);
          padding: 4px 10px;
          border-radius: 6px;
        }

        .rs-card-btn {
          padding: 8px 18px;
          background: #52c49b;
          border: none;
          border-radius: 8px;
          color: #0d1f1c;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rs-card-btn:hover {
          background: #63d4ab;
          transform: scale(1.04);
        }

        /* EMPTY STATE */
        .rs-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          color: rgba(255,255,255,0.25);
        }

        .rs-empty-icon { font-size: 3rem; margin-bottom: 16px; }

        .rs-empty p { font-size: 0.95rem; }

        /* RESPONSIVE */
        @media (max-width: 600px) {
          .rs-nav { padding: 0 20px; }
          .rs-nav-search { max-width: 180px; margin: 0 12px; }
          .rs-main { padding: 24px 20px; }
          .rs-hero h1 { font-size: 1.5rem; }
        }
      `}</style>

      <div className="rs-page">
        {/* NAVBAR */}
        <nav className="rs-nav">
          <div className="rs-nav-logo">Click<span>Bite</span></div>

          <div className="rs-nav-search">
            <span className="rs-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search restaurants or cuisines…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="rs-nav-right">
            <button className="rs-nav-history" onClick={() => navigate("/order-history")}>
              📋 My Orders
            </button>
            <div className="rs-avatar" title="Profile">👤</div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="rs-main">
          <div className="rs-hero">
            <h1>What are you <em>craving</em> today?</h1>
            <p>Choose from {mockRestaurants.length} restaurants near you</p>
          </div>

          <div className="rs-controls">
            <div className="rs-categories">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={"rs-cat-pill" + (activeCategory === cat ? " active" : "")}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="rs-sort">
              <span>Sort by</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="rating">Top rated</option>
                <option value="time">Fastest</option>
                <option value="delivery">Delivery fee</option>
              </select>
            </div>
          </div>

          <div className="rs-count">
            Showing <strong>{filtered.length}</strong> restaurant{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && <> in <strong>{activeCategory}</strong></>}
          </div>

          <div className="rs-grid">
            {filtered.length === 0 ? (
              <div className="rs-empty">
                <div className="rs-empty-icon">🍽️</div>
                <p>No restaurants found. Try a different search.</p>
              </div>
            ) : (
              filtered.map((r, i) => (
                <div
                  key={r.id}
                  className="rs-card"
                  style={{ animationDelay: i * 0.05 + "s" }}
                  onClick={() => navigate("/menu")}
                >
                  <div
                    className="rs-card-image"
                    style={{ background: "linear-gradient(135deg, " + r.color + "22, " + r.color + "44)" }}
                  >
                    {r.image}
                    <span className="rs-card-badge">{r.category}</span>
                    {r.delivery === 0 && <span className="rs-card-free">Free delivery</span>}
                  </div>

                  <div className="rs-card-body">
                    <div className="rs-card-header">
                      <div className="rs-card-name">{r.name}</div>
                      <div className="rs-card-rating">⭐ {r.rating}</div>
                    </div>

                    <div className="rs-card-meta">
                      <span className="rs-card-meta-item">🕐 {r.time} min</span>
                      <span className="rs-card-meta-item">
                        🛵 {r.delivery === 0 ? "Free" : "$" + r.delivery.toFixed(2)}
                      </span>
                    </div>

                    <div className="rs-card-footer">
                      <span className="rs-card-category">{r.category}</span>
                      <button
                        className="rs-card-btn"
                        onClick={e => { e.stopPropagation(); navigate("/menu"); }}
                      >
                        View Menu →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}