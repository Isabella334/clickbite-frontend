import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { restaurants as restaurantsApi, analytics, users as usersApi, helpers } from "../services/api";

// Emoji + color por categoria (el backend no los tiene - se derivan del lado del cliente)
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
  const [topRestaurants,  setTopRestaurants]  = useState([]);
  const [topItems,        setTopItems]        = useState([]);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [favorites,       setFavorites]       = useState(new Set()); // Set of restaurant IDs
  const [favLoading,      setFavLoading]       = useState(new Set()); // IDs currently toggling
  const session = helpers.getSession();
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [nearbyStatus,      setNearbyStatus]      = useState("idle"); // idle | requesting | loading | ok | denied | error

  // -- Fetch restaurants from backend --------------------------------------
  useEffect(() => {
    restaurantsApi.getAll()
      .then(data => setAllRestaurants(data ?? []))
      .catch(err  => setError(err.message))
      .finally(()  => setLoading(false));
  }, []);

  // -- Load favorites from session user ----------------------------------------
  useEffect(() => {
    if (!session?.id) return;
    usersApi.getById(session.id)
      .then(u => {
        const favIds = (u.favorite_restaurants ?? []).map(id =>
          typeof id === "string" ? id : id.$oid ?? String(id)
        );
        setFavorites(new Set(favIds));
      })
      .catch(() => {});
  }, [session?.id]);

  const toggleFavorite = async (e, restaurantId) => {
    e.stopPropagation();
    if (!session?.id) return;
    const isFav = favorites.has(restaurantId);
    setFavLoading(prev => new Set([...prev, restaurantId]));
    try {
      if (isFav) {
        await usersApi.removeFavorite(session.id, restaurantId);
        setFavorites(prev => { const s = new Set(prev); s.delete(restaurantId); return s; });
      } else {
        await usersApi.addFavorite(session.id, restaurantId);
        setFavorites(prev => new Set([...prev, restaurantId]));
      }
    } catch (_) {}
    finally {
      setFavLoading(prev => { const s = new Set(prev); s.delete(restaurantId); return s; });
    }
  };

  // -- Fetch analytics (top restaurants + top items) ------------------------
  useEffect(() => {
    Promise.all([
      analytics.getTopRatedRestaurants(),
      analytics.getTopSellingItems(),
    ]).then(([topR, topI]) => {
      setTopRestaurants(topR ?? []);
      setTopItems((topI ?? []).slice(0, 6));
      setAnalyticsLoaded(true);
    }).catch(() => setAnalyticsLoaded(true)); // fail silently - not critical
  }, []);

  // -- Nearby restaurants (geolocation) ------------------------------------
  const requestNearby = () => {
    if (!navigator.geolocation) { setNearbyStatus("error"); return; }
    setNearbyStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearbyStatus("loading");
        restaurantsApi.getNearby(pos.coords.longitude, pos.coords.latitude, 5000)
          .then(data => { setNearbyRestaurants(data ?? []); setNearbyStatus("ok"); })
          .catch(() => setNearbyStatus("error"));
      },
      () => setNearbyStatus("denied")
    );
  };

  // -- Derive categories from actual restaurant data ------------------------
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
    <div style={{minHeight:"100vh",background:"#0f1117",fontFamily:"'DM Sans',sans-serif",color:"#e8eaf0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .rs-nav{height:56px;display:flex;align-items:center;gap:16px;padding:0 32px;border-bottom:1px solid #1e2230;background:#0f1117;position:sticky;top:0;z-index:100}
        .rs-logo{font-family:'DM Mono',monospace;font-size:0.95rem;font-weight:500;color:#52c49b;letter-spacing:0.05em;white-space:nowrap}
        .rs-logo span{color:#e8eaf0}
        .rs-search{flex:1;max-width:360px;padding:8px 12px;background:#1a1e2e;border:1px solid #1e2230;border-radius:5px;color:#e8eaf0;font-family:'DM Sans',sans-serif;font-size:0.88rem;outline:none}
        .rs-search:focus{border-color:#52c49b}
        .rs-search::placeholder{color:#3d4255}
        .rs-nav-btn{padding:7px 14px;background:transparent;border:1px solid #1e2230;border-radius:5px;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.8rem;cursor:pointer;white-space:nowrap}
        .rs-nav-btn:hover{border-color:#52c49b33;color:#e8eaf0}

        .rs-main{padding:32px}
        .rs-page-title{font-size:1.4rem;font-weight:400;color:#e8eaf0;margin-bottom:4px}
        .rs-page-sub{font-size:0.82rem;color:#3d4255;margin-bottom:24px}

        /* Analytics panels */
        .rs-analytics{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}
        @media(max-width:680px){.rs-analytics{grid-template-columns:1fr}}
        .rs-panel{background:#131720;border:1px solid #1e2230;border-radius:8px;padding:16px}
        .rs-panel-title{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:#3d4255;margin-bottom:12px}
        .rs-top-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #1a1e2e;cursor:pointer}
        .rs-top-row:last-child{border-bottom:none}
        .rs-top-row:hover .rs-top-name{color:#52c49b}
        .rs-top-rank{width:20px;font-family:'DM Mono',monospace;font-size:0.7rem;color:#3d4255;flex-shrink:0;text-align:right}
        .rs-top-name{flex:1;font-size:0.85rem;color:#c8ccd8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .rs-top-rating{font-family:'DM Mono',monospace;font-size:0.8rem;color:#52c49b;white-space:nowrap}
        .rs-items-list{display:flex;flex-direction:column;gap:6px}
        .rs-item-row{display:flex;align-items:center;gap:10px}
        .rs-item-name{flex:1;font-size:0.82rem;color:#c8ccd8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .rs-item-bar-wrap{width:80px;height:3px;background:#1e2230;border-radius:2px;flex-shrink:0}
        .rs-item-bar-fill{height:100%;background:#52c49b;border-radius:2px}
        .rs-item-sold{font-family:'DM Mono',monospace;font-size:0.7rem;color:#3d4255;white-space:nowrap}

        /* Filters */
        .rs-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:20px}
        .rs-pill{padding:5px 12px;background:transparent;border:1px solid #1e2230;border-radius:4px;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.78rem;cursor:pointer;white-space:nowrap}
        .rs-pill:hover{border-color:#52c49b33;color:#c8ccd8}
        .rs-pill.active{background:#52c49b;border-color:#52c49b;color:#0a0e14;font-weight:500}
        .rs-count{margin-left:auto;font-size:0.75rem;color:#3d4255;white-space:nowrap}

        /* Grid */
        .rs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}

        /* Card */
        .rs-card{background:#131720;border:1px solid #1e2230;border-radius:8px;cursor:pointer;position:relative;overflow:hidden}
        .rs-card:hover{border-color:#2a3040}
        .rs-card-header{height:100px;display:flex;align-items:center;justify-content:center;font-size:2.8rem;position:relative;background:#1a1e2e}
        .rs-card-cat{position:absolute;top:8px;left:8px;padding:3px 8px;background:#0f1117;border:1px solid #1e2230;border-radius:3px;font-size:0.68rem;color:#4a5068;letter-spacing:0.06em;text-transform:uppercase}
        .rs-fav{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:4px;background:#0f1117;border:1px solid #1e2230;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.85rem}
        .rs-fav:hover{border-color:#e0555533}
        .rs-fav.active{background:#1a0f0f;border-color:#e0555566}
        .rs-card-body{padding:12px}
        .rs-card-name{font-size:0.95rem;font-weight:500;color:#e8eaf0;margin-bottom:4px}
        .rs-card-meta{display:flex;gap:12px;margin-bottom:10px}
        .rs-meta-item{font-size:0.75rem;color:#3d4255}
        .rs-meta-rating{color:#52c49b;font-family:'DM Mono',monospace}
        .rs-card-btn{width:100%;padding:8px;background:#1e2230;border:none;border-radius:4px;color:#c8ccd8;font-family:'DM Sans',sans-serif;font-size:0.82rem;cursor:pointer;text-align:center}
        .rs-card-btn:hover{background:#52c49b;color:#0a0e14}

        .rs-empty{grid-column:1/-1;padding:80px 20px;text-align:center;color:#3d4255;font-size:0.9rem}

        /* Nearby */
        .rs-nearby{margin-bottom:32px}
        .rs-nearby-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
        .rs-nearby-title{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:#3d4255}
        .rs-nearby-btn{padding:5px 12px;background:transparent;border:1px solid #1e2230;border-radius:4px;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.75rem;cursor:pointer}
        .rs-nearby-btn:hover{border-color:#52c49b44;color:#52c49b}
        .rs-nearby-row{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}
        .rs-nearby-row::-webkit-scrollbar{height:3px}
        .rs-nearby-row::-webkit-scrollbar-track{background:#1a1e2e}
        .rs-nearby-row::-webkit-scrollbar-thumb{background:#2a3040;border-radius:2px}
        .rs-nearby-card{flex-shrink:0;width:200px;background:#131720;border:1px solid #1e2230;border-radius:7px;cursor:pointer;overflow:hidden}
        .rs-nearby-card:hover{border-color:#2a3040}
        .rs-nearby-thumb{height:64px;background:#1a1e2e;display:flex;align-items:center;justify-content:center;font-size:1.8rem}
        .rs-nearby-info{padding:10px}
        .rs-nearby-name{font-size:0.85rem;font-weight:500;color:#e8eaf0;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .rs-nearby-meta{display:flex;gap:8px;font-size:0.72rem;color:#3d4255}
        .rs-nearby-dist{font-family:'DM Mono',monospace;color:#52c49b}
        .rs-nearby-status{font-size:0.82rem;color:#3d4255;padding:12px 0}
      `}</style>

      {/* NAV */}
      <nav className="rs-nav">
        <div className="rs-logo">Click<span>Bite</span></div>
        <input className="rs-search" type="text" placeholder="Search restaurants..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <button className="rs-nav-btn" onClick={()=>navigate("/order-history")}>My Orders</button>
        <div style={{width:30,height:30,borderRadius:"50%",background:"#1a1e2e",border:"1px solid #1e2230",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",cursor:"pointer"}}>
          {session?.name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
      </nav>

      <main className="rs-main">
        <div className="rs-page-title">What are you craving?</div>
        <div className="rs-page-sub">{allRestaurants.length} restaurants available</div>

        {/* Nearby */}
        <div className="rs-nearby">
          <div className="rs-nearby-header">
            <span className="rs-nearby-title">Near you</span>
            {nearbyStatus === "idle" && (
              <button className="rs-nearby-btn" onClick={requestNearby}>Use my location</button>
            )}
            {nearbyStatus === "ok" && (
              <button className="rs-nearby-btn" onClick={requestNearby}>Refresh</button>
            )}
          </div>
          {nearbyStatus === "idle" && (
            <div className="rs-nearby-status">Enable location to see restaurants near you.</div>
          )}
          {(nearbyStatus === "requesting" || nearbyStatus === "loading") && (
            <div className="rs-nearby-status">Locating...</div>
          )}
          {nearbyStatus === "denied" && (
            <div className="rs-nearby-status">Location permission denied.</div>
          )}
          {nearbyStatus === "error" && (
            <div className="rs-nearby-status">Could not load nearby restaurants.</div>
          )}
          {nearbyStatus === "ok" && nearbyRestaurants.length === 0 && (
            <div className="rs-nearby-status">No restaurants within 5 km.</div>
          )}
          {nearbyStatus === "ok" && nearbyRestaurants.length > 0 && (
            <div className="rs-nearby-row">
              {nearbyRestaurants.map(r => {
                const style = getCategoryStyle(r.categories);
                const dist  = r.distance_meters >= 1000
                  ? (r.distance_meters / 1000).toFixed(1) + " km"
                  : Math.round(r.distance_meters) + " m";
                return (
                  <div key={r.id ?? r._id} className="rs-nearby-card"
                    onClick={() => navigate("/menu", { state: { restaurantId: r.id ?? r._id } })}>
                    <div className="rs-nearby-thumb">{style.image}</div>
                    <div className="rs-nearby-info">
                      <div className="rs-nearby-name">{r.name}</div>
                      <div className="rs-nearby-meta">
                        <span className="rs-nearby-dist">{dist}</span>
                        <span>{(r.avg_rating ?? 0).toFixed(1)} ★</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Analytics */}
        {analyticsLoaded && (topRestaurants.length > 0 || topItems.length > 0) && (
          <div className="rs-analytics">
            <div className="rs-panel">
              <div className="rs-panel-title">Top rated</div>
              {topRestaurants.map((r, i) => (
                <div key={r.restaurant_id} className="rs-top-row" onClick={()=>navigate("/menu",{state:{restaurantId:r.restaurant_id}})}>
                  <span className="rs-top-rank">#{i+1}</span>
                  <span className="rs-top-name">{r.name}</span>
                  <span className="rs-top-rating">{Number(r.avg_rating).toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="rs-panel">
              <div className="rs-panel-title">Most ordered</div>
              <div className="rs-items-list">
                {topItems.map(item => {
                  const maxSold = topItems[0]?.total_sold || 1;
                  const pct = Math.round((item.total_sold / maxSold) * 100);
                  return (
                    <div key={item.menu_item_id} className="rs-item-row">
                      <span className="rs-item-name">{item.name}</span>
                      <div className="rs-item-bar-wrap"><div className="rs-item-bar-fill" style={{width:pct+"%"}}/></div>
                      <span className="rs-item-sold">{item.total_sold.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="rs-filters">
          {categories.map(cat => (
            <button key={cat} className={"rs-pill"+(activeCategory===cat?" active":"")} onClick={()=>setActiveCategory(cat)}>{cat}</button>
          ))}
          <span className="rs-count">{filtered.length} result{filtered.length!==1?"s":""}</span>
        </div>

        {/* Grid */}
        <div className="rs-grid">
          {loading ? (
            <div className="rs-empty">Loading...</div>
          ) : error ? (
            <div className="rs-empty">Error: {error}</div>
          ) : filtered.length === 0 ? (
            <div className="rs-empty">No restaurants found.</div>
          ) : filtered.map(r => {
            const style = getCategoryStyle(r.categories);
            const cat   = r.categories?.[0] ?? "Restaurant";
            const isFav = favorites.has(r.id);
            return (
              <div key={r.id} className="rs-card" onClick={()=>navigate("/menu",{state:{restaurantId:r.id}})}>
                <div className="rs-card-header" style={{background:"#1a1e2e"}}>
                  {style.image}
                  <span className="rs-card-cat">{cat}</span>
                  {session?.id && (
                    <button className={"rs-fav"+(isFav?" active":"")} onClick={e=>toggleFavorite(e,r.id)} disabled={favLoading.has(r.id)}>
                      {favLoading.has(r.id) ? "..." : isFav ? "♥" : "♡"}
                    </button>
                  )}
                </div>
                <div className="rs-card-body">
                  <div className="rs-card-name">{r.name}</div>
                  <div className="rs-card-meta">
                    <span className={"rs-meta-item rs-meta-rating"}>{(r.avg_rating??0).toFixed(1)} ★</span>
                    <span className="rs-meta-item">{r.total_reviews??0} reviews</span>
                  </div>
                  <button className="rs-card-btn" onClick={e=>{e.stopPropagation();navigate("/menu",{state:{restaurantId:r.id}})}}>
                    View menu
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
