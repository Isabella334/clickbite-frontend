import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { restaurants as restaurantsApi } from "../services/api";

// Emoji + color por categoría (el backend no los tiene — se derivan del lado del cliente)
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

const getCategoryStyle = (categories) => {
  if (!categories?.length) return CATEGORY_STYLE.Default;
  return CATEGORY_STYLE[categories[0]] ?? CATEGORY_STYLE.Default;
};

export default function Restaurants() {
  const navigate = useNavigate();
  const [search,          setSearch]          = useState("");
  const [activeCategory,  setActiveCategory]  = useState("All");
  const [sortBy,          setSortBy]          = useState("rating");
  const [allRestaurants,  setAllRestaurants]  = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  // ── Fetch restaurants from backend ──────────────────────────────────────
  useEffect(() => {
    restaurantsApi.getAll()
      .then(data => setAllRestaurants(data ?? []))
      .catch(err  => setError(err.message))
      .finally(()  => setLoading(false));
  }, []);

  // ── Derive categories from actual restaurant data ────────────────────────
  const categories = [
    "All",
    ...new Set(
      allRestaurants.flatMap(r => r.categories ?? [])
    ),
  ];

  // Reset filter if selected category no longer exists in data
  useEffect(() => {
    if (activeCategory !== "All" && !categories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [categories]);

  const filtered = allRestaurants
    .filter(r => r.is_active)
    .filter(r => activeCategory === "All" || r.categories?.includes(activeCategory))
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) ||
                 r.categories?.some(c => c.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === "rating") return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
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
              placeholder="Buscar restaurantes o categorías…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="rs-nav-right">
            <button className="rs-nav-history" onClick={() => navigate("/order-history")}>
              📋 Mis pedidos
            </button>
            <div className="rs-avatar" title="Profile">👤</div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="rs-main">
          <div className="rs-hero">
            <h1>¿Qué se te <em>antoja</em> hoy?</h1>
            <p>Elige entre {allRestaurants.length} restaurantes cerca de ti</p>
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
              <span>Ordenar por</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="rating">Mejor calificados</option>
              </select>
            </div>
          </div>

          <div className="rs-count">
            Mostrando <strong>{filtered.length}</strong> restaurante{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && <> en <strong>{activeCategory}</strong></>}
          </div>

          <div className="rs-grid">
            {loading ? (
              <div className="rs-empty">
                <div className="rs-empty-icon">⏳</div>
                <p>Cargando restaurantes…</p>
              </div>
            ) : error ? (
              <div className="rs-empty">
                <div className="rs-empty-icon">⚠️</div>
                <p>No se pudieron cargar los restaurantes: {error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rs-empty">
                <div className="rs-empty-icon">🍽️</div>
                <p>No se encontraron restaurantes. Intenta con otra búsqueda.</p>
              </div>
            ) : (
              filtered.map((r, i) => {
                const style    = getCategoryStyle(r.categories);
                const category = r.categories?.[0] ?? "Restaurant";
                return (
                  <div
                    key={r.id}
                    className="rs-card"
                    style={{ animationDelay: i * 0.05 + "s" }}
                    onClick={() => navigate("/menu", { state: { restaurantId: r.id } })}
                  >
                    <div
                      className="rs-card-image"
                      style={{ background: "linear-gradient(135deg, " + style.color + "22, " + style.color + "44)" }}
                    >
                      {style.image}
                      <span className="rs-card-badge">{category}</span>
                    </div>

                    <div className="rs-card-body">
                      <div className="rs-card-header">
                        <div className="rs-card-name">{r.name}</div>
                        <div className="rs-card-rating">⭐ {(r.avg_rating ?? 0).toFixed(1)}</div>
                      </div>

                      <div className="rs-card-meta">
                        <span className="rs-card-meta-item">💬 {r.total_reviews ?? 0} reseñas</span>
                        <span className="rs-card-meta-item">📞 {r.contact?.phone ?? "—"}</span>
                      </div>

                      <div className="rs-card-footer">
                        <span className="rs-card-category">{category}</span>
                        <button
                          className="rs-card-btn"
                          onClick={e => { e.stopPropagation(); navigate("/menu", { state: { restaurantId: r.id } }); }}
                        >
                          Ver menú →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </>
  );
}