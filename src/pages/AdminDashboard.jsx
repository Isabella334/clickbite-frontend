import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const mockStats = {
  totalRevenue: 14820.50, totalOrders: 1043,
  totalUsers: 512, totalRestaurants: 28,
  ordersToday: 87, ingresosToday: 1240.75,
  newUsersWeek: 34, activeRestaurants: 21,
};

const mockWeekData = [
  { day: "Lun", ingresos: 1820, orders: 124 },
  { day: "Mar", ingresos: 1540, orders: 108 },
  { day: "Mié", ingresos: 2310, orders: 162 },
  { day: "Jue", ingresos: 1980, orders: 140 },
  { day: "Vie", ingresos: 2740, orders: 195 },
  { day: "Sáb", ingresos: 3190, orders: 227 },
  { day: "Dom", ingresos: 1240, orders:  87 },
];

const initialRestaurants = [
  { id: 1, name: "Burger Palace", owner: "John D.",  category: "Burgers", orders: 320, rating: 4.8, status: "activo",   joined: "Dec 5, 2023",  image: "🍔", email: "bp@restaurant.com",   phone: "555-0101", menuItems: 12 },
  { id: 2, name: "Sushi Zen",     owner: "Kenji T.", category: "Sushi",   orders: 210, rating: 4.9, status: "activo",   joined: "Nov 20, 2023", image: "🍣", email: "zen@restaurant.com",  phone: "555-0102", menuItems: 18 },
  { id: 3, name: "Pizza Mondo",   owner: "Marco R.", category: "Pizza",   orders: 89,  rating: 4.2, status: "inactivo", joined: "Jan 8, 2024",  image: "🍕", email: "pizza@restaurant.com",phone: "555-0103", menuItems: 9  },
  { id: 4, name: "Taco Fiesta",   owner: "Rosa M.",  category: "Mexican", orders: 178, rating: 4.5, status: "activo",   joined: "Oct 14, 2023", image: "🌮", email: "tacos@restaurant.com",phone: "555-0104", menuItems: 14 },
];

// ── Pipeline 4: Historial resumido por usuario
// GET /api/admin/analytics/user-order-summary
// db.orders.aggregate([ {$group:{_id:"$user_id", totalOrders:{$sum:1}, totalSpent:{$sum:"$total"}}} ])
const initialUsers = [
  { id: 1, name: "María García",     email: "maria@email.com",      role: "customer",   status: "activo",    joined: "Jan 12, 2024", orders: 18, totalSpent: 284.50 },
  { id: 2, name: "Carlos Rodríguez", email: "carlos@email.com",     role: "customer",   status: "activo",    joined: "Feb 3, 2024",  orders: 7,  totalSpent: 98.75  },
  { id: 3, name: "Ana López",        email: "ana@email.com",        role: "customer",   status: "suspendido", joined: "Mar 1, 2024",  orders: 2,  totalSpent: 31.98  },
  { id: 4, name: "Burger Palace",    email: "bp@restaurant.com",    role: "restaurant", status: "activo",    joined: "Dec 5, 2023",  orders: 320,totalSpent: null   },
  { id: 5, name: "Sushi Zen",        email: "zen@restaurant.com",   role: "restaurant", status: "activo",    joined: "Nov 20, 2023", orders: 210,totalSpent: null   },
  { id: 6, name: "Luis Méndez",      email: "luis@email.com",       role: "customer",   status: "activo",    joined: "Feb 18, 2024", orders: 5,  totalSpent: 67.45  },
];

const mockOrders = [
  { id: "ORD-0042", customer: "María G.",   restaurant: "Burger Palace", total: 25.97, status: "delivered",  date: "Today, 3:12 PM" },
  { id: "ORD-0041", customer: "Carlos R.",  restaurant: "Sushi Zen",     total: 38.48, status: "on_the_way", date: "Today, 3:06 PM" },
  { id: "ORD-0040", customer: "Ana L.",     restaurant: "Pizza Mondo",   total: 16.98, status: "preparing",  date: "Today, 2:59 PM" },
  { id: "ORD-0039", customer: "Luis M.",    restaurant: "Taco Fiesta",   total: 12.98, status: "delivered",  date: "Today, 2:42 PM" },
  { id: "ORD-0038", customer: "Sofía P.",   restaurant: "Burger Palace", total: 30.96, status: "delivered",  date: "Today, 2:29 PM" },
  { id: "ORD-0037", customer: "Diego F.",   restaurant: "Sushi Zen",     total: 44.97, status: "cancelled",  date: "Today, 2:15 PM" },
];

// ── Pipeline 1: Restaurantes mejor calificados
// GET /api/admin/analytics/top-rated-restaurants
// db.reseñas.aggregate([ {$group:{_id:"$restaurant_id", avgRating:{$avg:"$rating"}, totalReviews:{$sum:1}}},
//   {$lookup:{from:"restaurants",localField:"_id",foreignField:"_id",as:"restaurant"}},
//   {$sort:{avgRating:-1}}, {$limit:5} ])
const mockTopRated = [
  { id: 2, name: "Sushi Zen",    image: "🍣", avgRating: 4.9, totalReviews: 184 },
  { id: 1, name: "Burger Palace",image: "🍔", avgRating: 4.8, totalReviews: 320 },
  { id: 6, name: "Noodle House", image: "🍜", avgRating: 4.7, totalReviews: 97  },
  { id: 4, name: "Taco Fiesta",  image: "🌮", avgRating: 4.5, totalReviews: 142 },
  { id: 5, name: "Green Bowl",   image: "🥗", avgRating: 4.4, totalReviews: 73  },
];

// ── Pipeline 3: Total de ventas por restaurante (solo órdenes delivered)
// GET /api/admin/analytics/ingresos-by-restaurant
// db.orders.aggregate([ {$match:{status:"delivered"}},
//   {$group:{_id:"$restaurant_id", totalRevenue:{$sum:"$total"}, totalOrders:{$sum:1}}},
//   {$sort:{totalRevenue:-1}} ])
const mockRevenueByRestaurant = [
  { id: 1, name: "Burger Palace", image: "🍔", totalRevenue: 4820.50, totalOrders: 320 },
  { id: 2, name: "Sushi Zen",     image: "🍣", totalRevenue: 3940.20, totalOrders: 210 },
  { id: 4, name: "Taco Fiesta",   image: "🌮", totalRevenue: 2615.80, totalOrders: 178 },
  { id: 6, name: "Noodle House",  image: "🍜", totalRevenue: 1988.40, totalOrders: 143 },
  { id: 5, name: "Green Bowl",    image: "🥗", totalRevenue: 1240.10, totalOrders: 95  },
  { id: 3, name: "Pizza Mondo",   image: "🍕", totalRevenue:  980.75, totalOrders: 89  },
];

const CATEGORIES   = ["Burgers", "Pizza", "Sushi", "Mexican", "Asian", "Healthy", "Chicken", "Italian", "Indian"];
const MENU_CATS    = ["Entradas", "Platos principales", "Acompañamientos", "Bebidas", "Postres"];
const EMOJI_OPTS   = ["🍔","🍕","🍣","🌮","🍜","🥗","🍗","🍝","🍛","🥤","🍟","🧅","🍫","🥧","🍋","🌶️","🥩","🍄","🫔","🍱"];
const TABS         = ["Resumen", "Restaurantes", "Usuarios", "Pedidos"];

const STATUS_CONFIG = {
  pending:    { label: "Pendiente",    color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: "🕐" },
  confirmed:  { label: "Confirmado",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  icon: "✅" },
  preparing:  { label: "Preparando",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: "👨‍🍳" },
  on_the_way: { label: "En camino", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: "🛵" },
  delivered:  { label: "Entregado",  color: "#52c49b", bg: "rgba(82,196,155,0.12)",  icon: "✓"  },
  cancelled:  { label: "Cancelado",  color: "#e05c5c", bg: "rgba(224,92,92,0.12)",   icon: "✕"  },
};

const EMPTY_REST = { name: "", email: "", phone: "", category: "Burgers", image: "🍔", ownerName: "", ownerEmail: "", ownerPassword: "" };
const EMPTY_MENU_ITEM = { name: "", description: "", price: "", category: "Platos principales", image: "🍔", popular: false };
const EMPTY_USER = { name: "", email: "", password: "", role: "customer" };

// ── Wizard steps for restaurant creation ──
const WIZARD_STEPS = ["Info del restaurante", "Cuenta del dueño", "Menú inicial", "Revisar"];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab,      setActiveTab]      = useState("Resumen");
  const [restaurants,    setRestaurants]    = useState(initialRestaurants);
  const [users,          setUsers]          = useState(initialUsers);
  const [search,         setSearch]         = useState("");
  const [restFilter,     setRestFilter]     = useState("All");
  const [userFilter,     setUserFilter]     = useState("All");
  const [orderFilter,    setOrderFilter]    = useState("All");
  const [chartMetric,    setChartMetric]    = useState("ingresos");
  const [topRatedLimit,  setTopRatedLimit]  = useState(5);
  const [ingresosLimit,   setRevenueLimit]   = useState(6);
  const [toast,          setToast]          = useState("");

  // ── Restaurant wizard ──
  const [restModal,      setRestModal]      = useState(false);
  const [wizardStep,     setWizardStep]     = useState(0);
  const [restForm,       setRestForm]       = useState(EMPTY_REST);
  const [menuItems,      setMenuItems]      = useState([]);
  const [menuForm,       setMenuForm]       = useState(EMPTY_MENU_ITEM);
  const [restErrors,     setRestErrors]     = useState({});
  const [saving,         setSaving]         = useState(false);

  // ── Delete restaurant ──
  const [deleteRestId,   setDeleteRestId]   = useState(null);

  // ── User modal ──
  const [userModal,      setUserModal]      = useState(false);
  const [userForm,       setUserForm]       = useState(EMPTY_USER);
  const [userErrors,     setUserErrors]     = useState({});
  const [savingUser,     setSavingUser]     = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ════════════════════════════════
  // RESTAURANT WIZARD
  // ════════════════════════════════
  const openRestModal = () => {
    setRestForm(EMPTY_REST); setMenuItems([]); setMenuForm(EMPTY_MENU_ITEM);
    setWizardStep(0); setRestErrors({}); setRestModal(true);
  };

  const closeRestModal = () => { setRestModal(false); setWizardStep(0); };

  const validateStep = (step) => {
    const e = {};
    if (step === 0) {
      if (!restForm.name.trim())     e.name     = "Obligatorio";
      if (!restForm.email.includes("@")) e.email = "Correo inválido";
      if (!restForm.phone.trim())    e.phone    = "Obligatorio";
      if (!restForm.category)        e.category = "Obligatorio";
    }
    if (step === 1) {
      if (!restForm.ownerName.trim())  e.ownerName  = "Obligatorio";
      if (!restForm.ownerEmail.includes("@")) e.ownerEmail = "Correo inválido";
      if (restForm.ownerPassword.length < 6) e.ownerPassword = "Mínimo 6 caracteres";
    }
    return e;
  };

  const nextStep = () => {
    if (wizardStep < 2) {
      const e = validateStep(wizardStep);
      if (Object.keys(e).length) { setRestErrors(e); return; }
      setRestErrors({});
    }
    setWizardStep(s => s + 1);
  };

  const prevStep = () => setWizardStep(s => s - 1);

  // Add menu item to draft
  const addMenuItem = () => {
    const e = {};
    if (!menuForm.name.trim()) e.name = "Obligatorio";
    if (!menuForm.price || isNaN(parseFloat(menuForm.price)) || parseFloat(menuForm.price) <= 0) e.price = "Valor inválido";
    if (Object.keys(e).length) { setRestErrors(e); return; }
    setMenuItems(prev => [...prev, { ...menuForm, id: Date.now(), price: parseFloat(menuForm.price) }]);
    setMenuForm(EMPTY_MENU_ITEM);
    setRestErrors({});
  };

  const removeMenuItem = (id) => setMenuItems(prev => prev.filter(i => i.id !== id));

  const handleRestFormChange = (field, value) => {
    setRestForm(prev => ({ ...prev, [field]: value }));
    if (restErrors[field]) setRestErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleMenuFormChange = (field, value) => {
    setMenuForm(prev => ({ ...prev, [field]: value }));
    if (restErrors[field]) setRestErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // Final save
  const saveRestaurant = () => {
    setSaving(true);
    setTimeout(() => {
      // POST /api/admin/restaurants  +  POST /api/admin/restaurants/:id/menu
      const newRest = {
        id: Date.now(), name: restForm.name, owner: restForm.ownerName,
        category: restForm.category, orders: 0, rating: 0,
        status: "activo", joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        image: restForm.image, email: restForm.email, phone: restForm.phone,
        menuItems: menuItems.length,
      };
      setRestaurants(prev => [newRest, ...prev]);
      // Also add owner as user
      setUsers(prev => [{
        id: Date.now() + 1, name: restForm.ownerName, email: restForm.ownerEmail,
        role: "restaurant", status: "activo",
        joined: newRest.joined, orders: 0,
      }, ...prev]);
      setSaving(false);
      closeRestModal();
      showToast("Restaurant \"" + restForm.name + "\" creado con " + menuItems.length + " productos en el menú");
    }, 1200);
  };

  // Toggle restaurant
  const toggleRestStatus = (id) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = r.status === "activo" ? "inactivo" : "activo";
      showToast(next === "activo" ? "Restaurante activado" : "Restaurante desactivado");
      return { ...r, status: next };
    }));
  };

  const confirmDeleteRest = (id) => setDeleteRestId(id);

  const handleDeleteRest = () => {
    const name = restaurants.find(r => r.id === deleteRestId)?.name;
    setRestaurants(prev => prev.filter(r => r.id !== deleteRestId));
    setDeleteRestId(null);
    showToast("\"" + name + "\" has been removed");
  };

  // ════════════════════════════════
  // USER CRUD
  // ════════════════════════════════
  const openUserModal = () => { setUserForm(EMPTY_USER); setUserErrors({}); setUserModal(true); };
  const closeUserModal = () => setUserModal(false);

  const validateUser = () => {
    const e = {};
    if (!userForm.name.trim())              e.name     = "Obligatorio";
    if (!userForm.email.includes("@"))      e.email    = "Correo inválido";
    if (userForm.password.length < 6)       e.password = "Mínimo 6 caracteres";
    return e;
  };

  const saveUser = () => {
    const e = validateUser();
    if (Object.keys(e).length) { setUserErrors(e); return; }
    setSavingUser(true);
    setTimeout(() => {
      // POST /api/admin/users
      setUsers(prev => [{
        id: Date.now(), name: userForm.name, email: userForm.email,
        role: userForm.role, status: "activo",
        joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        orders: 0,
      }, ...prev]);
      setSavingUser(false);
      closeUserModal();
      showToast("User \"" + userForm.name + "\" creado exitosamente");
    }, 800);
  };

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const next = u.status === "activo" ? "suspendido" : "activo";
      showToast(next === "activo" ? "Usuario reactivado" : "Usuario suspendido");
      return { ...u, status: next };
    }));
  };

  // ── Filtered lists ──
  const filteredRests = restaurants.filter(r => {
    const matchStatus = restFilter === "Todos" || r.status === restFilter.toLowerCase();
    const matchSearch = search === "" || r.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredUsers = users.filter(u => {
    const matchRole   = userFilter === "Todos" || u.role === userFilter.toLowerCase() || (userFilter === "Suspenderidos" && u.status === "suspendido");
    const matchSearch = search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const filteredOrders = mockOrders.filter(o => {
    const matchStatus = orderFilter === "All" || o.status === orderFilter.toLowerCase().replace(/ /g, "_");
    const matchSearch = search === "" || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const chartMax = chartMetric === "ingresos"
    ? Math.max(...mockWeekData.map(d => d.ingresos))
    : Math.max(...mockWeekData.map(d => d.orders));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ad-page { min-height: 100vh; background: #0d1117; font-family: 'DM Sans', sans-serif; color: #fff; display: flex; }

        /* ── SIDEBAR ── */
        .ad-sidebar { width: 220px; min-width: 220px; background: #111820; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; padding: 28px 0; position: sticky; top: 0; height: 100vh; }
        .ad-logo { font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800; color: #52c49b; letter-spacing: -0.5px; padding: 0 24px; margin-bottom: 4px; }
        .ad-logo span { color: #fff; }
        .ad-logo-sub { font-size: 0.68rem; color: rgba(255,255,255,0.2); padding: 0 24px; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 0.1em; }
        .ad-nav-section { font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.1em; padding: 0 24px; margin-bottom: 6px; }
        .ad-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 24px; cursor: pointer; transition: all 0.18s; color: rgba(255,255,255,0.45); font-size: 0.88rem; border: none; background: transparent; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; border-left: 3px solid transparent; }
        .ad-nav-item:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.03); }
        .ad-nav-item.active { color: #52c49b; background: rgba(82,196,155,0.08); border-left-color: #52c49b; font-weight: 500; }
        .ad-sidebar-bottom { margin-top: auto; padding: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
        .ad-admin-card { display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; margin-bottom: 10px; }
        .ad-admin-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #52c49b, #1a7a58); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
        .ad-admin-name { font-size: 0.84rem; font-weight: 600; color: #fff; }
        .ad-admin-role { font-size: 0.7rem; color: rgba(255,255,255,0.3); margin-top: 1px; }
        .ad-logout { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; background: transparent; border: none; color: rgba(255,255,255,0.3); font-family: 'DM Sans', sans-serif; font-size: 0.82rem; cursor: pointer; transition: color 0.2s; border-radius: 8px; text-align: left; }
        .ad-logout:hover { color: #e05c5c; background: rgba(224,92,92,0.06); }

        /* ── MAIN ── */
        .ad-main { flex: 1; overflow-y: auto; }
        .ad-topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 36px; border-bottom: 1px solid rgba(255,255,255,0.06); background: #111820; position: sticky; top: 0; z-index: 50; gap: 16px; flex-wrap: wrap; }
        .ad-tabs { display: flex; gap: 4px; }
        .ad-tab { padding: 8px 18px; border-radius: 8px; border: none; background: transparent; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 0.88rem; cursor: pointer; transition: all 0.18s; }
        .ad-tab:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.04); }
        .ad-tab.active { background: rgba(82,196,155,0.1); color: #52c49b; font-weight: 600; }
        .ad-topbar-right { display: flex; align-items: center; gap: 10px; }
        .ad-search-wrap { position: relative; }
        .ad-search { padding: 8px 14px 8px 34px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.86rem; outline: none; width: 200px; transition: all 0.2s; }
        .ad-search::placeholder { color: rgba(255,255,255,0.25); }
        .ad-search:focus { border-color: #52c49b; background: rgba(82,196,155,0.05); width: 240px; }
        .ad-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 0.82rem; color: rgba(255,255,255,0.25); pointer-events: none; }
        .ad-add-btn { display: flex; align-items: center; gap: 7px; padding: 8px 16px; background: #52c49b; border: none; border-radius: 8px; color: #0d1f1c; font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .ad-add-btn:hover { background: #63d4ab; transform: translateY(-1px); }

        /* ── CONTENT ── */
        .ad-content { padding: 28px 36px; }

        /* ── STAT CARDS ── */
        .ad-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .ad-stat { background: #111820; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 18px 20px; animation: fadeUp 0.3s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ad-stat-label { font-size: 0.73rem; font-weight: 500; color: rgba(255,255,255,0.28); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .ad-stat-value { font-family: 'Syne', sans-serif; font-size: 1.65rem; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 5px; }
        .ad-stat-value.green { color: #52c49b; }
        .ad-stat-value.yellow { color: #fbbf24; }
        .ad-stat-sub { font-size: 0.74rem; color: rgba(255,255,255,0.22); font-weight: 300; }

        /* ── GRID ── */
        .ad-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; margin-bottom: 20px; }
        .ad-card { background: #111820; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; animation: fadeUp 0.35s ease both; }
        .ad-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .ad-card-title { font-family: 'Syne', sans-serif; font-size: 0.92rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
        .ad-card-link { background: none; border: none; color: #52c49b; font-size: 0.78rem; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; }
        .ad-card-link:hover { opacity: 0.7; }

        /* ── CHART ── */
        .ad-chart-wrap { padding: 18px 20px; }
        .ad-chart-toggles { display: flex; gap: 6px; margin-bottom: 16px; }
        .ad-chart-toggle { padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.35); font-family: 'DM Sans', sans-serif; font-size: 0.76rem; cursor: pointer; transition: all 0.18s; }
        .ad-chart-toggle.active { background: rgba(82,196,155,0.1); border-color: #52c49b; color: #52c49b; }
        .ad-chart { display: flex; align-items: flex-end; gap: 6px; height: 120px; }
        .ad-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; height: 100%; justify-content: flex-end; }
        .ad-bar-val { font-size: 0.62rem; color: rgba(255,255,255,0.2); text-align: center; }
        .ad-bar { width: 100%; border-radius: 5px 5px 0 0; background: linear-gradient(to top, #52c49b, #63d4ab); min-height: 4px; transition: height 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .ad-bar.today { background: linear-gradient(to top, #60a5fa, #93c5fd); }
        .ad-bar-day { font-size: 0.68rem; color: rgba(255,255,255,0.28); }
        .ad-bar-day.today { color: #60a5fa; font-weight: 600; }

        /* quick orders */
        .ad-qrow { display: flex; align-items: center; gap: 10px; padding: 11px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.82rem; }
        .ad-qrow:last-child { border-bottom: none; }
        .ad-qrow-id { font-family: monospace; color: rgba(255,255,255,0.28); min-width: 82px; font-size: 0.76rem; }
        .ad-qrow-customer { color: rgba(255,255,255,0.7); min-width: 80px; }
        .ad-qrow-rest { flex: 1; color: rgba(255,255,255,0.35); font-size: 0.78rem; }
        .ad-qrow-total { font-family: 'Syne', sans-serif; font-weight: 700; color: #fff; min-width: 52px; text-align: right; font-size: 0.86rem; }
        .ad-badge { padding: 3px 8px; border-radius: 999px; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }

        /* ── FILTERS ── */
        .ad-filters { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
        .ad-filter { padding: 6px 14px; border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; background: transparent; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 0.8rem; cursor: pointer; transition: all 0.18s; }
        .ad-filter:hover { border-color: rgba(82,196,155,0.3); color: rgba(255,255,255,0.7); }
        .ad-filter.active { background: #52c49b; border-color: #52c49b; color: #0d1f1c; font-weight: 600; }

        /* ── TABLE ── */
        .ad-table-wrap { background: #111820; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; animation: fadeUp 0.3s ease; }
        .ad-table { width: 100%; border-collapse: collapse; }
        .ad-table th { padding: 12px 16px; text-align: left; font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.22); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); white-space: nowrap; }
        .ad-table td { padding: 13px 16px; font-size: 0.84rem; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; color: rgba(255,255,255,0.7); }
        .ad-table tr:last-child td { border-bottom: none; }
        .ad-table tr:hover td { background: rgba(255,255,255,0.02); }
        .ad-name-cell { display: flex; align-items: center; gap: 10px; }
        .ad-user-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, rgba(82,196,155,0.3), rgba(82,196,155,0.1)); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #52c49b; font-weight: 700; flex-shrink: 0; }
        .ad-rest-emoji { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; background: rgba(255,255,255,0.04); }
        .ad-name-main { font-weight: 500; color: #fff; margin-bottom: 2px; }
        .ad-name-sub { font-size: 0.74rem; color: rgba(255,255,255,0.28); }
        .ad-role-pill { padding: 3px 9px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; }
        .ad-role-customer { background: rgba(96,165,250,0.12); color: #60a5fa; }
        .ad-role-restaurant { background: rgba(251,191,36,0.12); color: #fbbf24; }
        .ad-status { padding: 3px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; }
        .ad-status.active { background: rgba(82,196,155,0.12); color: #52c49b; }
        .ad-status.inactive { background: rgba(148,163,184,0.12); color: #94a3b8; }
        .ad-status.suspended { background: rgba(224,92,92,0.12); color: #e05c5c; }
        .ad-rating { color: #fbbf24; font-size: 0.82rem; font-weight: 600; }
        .ad-tbl-actions { display: flex; gap: 6px; }
        .ad-btn-sm { padding: 5px 11px; border-radius: 7px; font-size: 0.76rem; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.18s; white-space: nowrap; }
        .ad-btn-toggle-on  { background: transparent; border: 1px solid rgba(224,92,92,0.3); color: #e05c5c; }
        .ad-btn-toggle-on:hover  { background: rgba(224,92,92,0.08); border-color: #e05c5c; }
        .ad-btn-toggle-off { background: transparent; border: 1px solid rgba(82,196,155,0.3); color: #52c49b; }
        .ad-btn-toggle-off:hover { background: rgba(82,196,155,0.08); border-color: #52c49b; }
        .ad-btn-del { background: transparent; border: 1px solid rgba(224,92,92,0.2); color: rgba(224,92,92,0.6); }
        .ad-btn-del:hover { background: rgba(224,92,92,0.08); border-color: #e05c5c; color: #e05c5c; }

        /* toggle switch */
        .ad-switch-wrap { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; background: transparent; border: none; padding: 0; font-family: 'DM Sans', sans-serif; }
        .ad-switch { width: 34px; height: 18px; border-radius: 999px; position: relative; transition: background 0.2s; flex-shrink: 0; }
        .ad-switch.on { background: #52c49b; }
        .ad-switch.off { background: rgba(255,255,255,0.12); }
        .ad-switch-knob { position: absolute; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: left 0.2s; }
        .ad-switch.on .ad-switch-knob { left: 18px; }
        .ad-switch.off .ad-switch-knob { left: 2px; }

        /* ══ OVERLAY ══ */
        .ad-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* ══ WIZARD MODAL ══ */
        .ad-wizard { background: #111820; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes popIn { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }

        .ad-wizard-header { padding: 22px 24px 0; }
        .ad-wizard-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
        .ad-wizard-close { width: 28px; height: 28px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: all 0.15s; }
        .ad-wizard-close:hover { background: rgba(255,255,255,0.06); color: #fff; }

        /* step indicator */
        .ad-steps-row { display: flex; align-items: center; gap: 0; margin-bottom: 24px; }
        .ad-step-item { display: flex; align-items: center; gap: 8px; flex: 1; }
        .ad-step-dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.3); flex-shrink: 0; transition: all 0.2s; }
        .ad-step-dot.done    { background: #52c49b; border-color: #52c49b; color: #0d1f1c; }
        .ad-step-dot.current { border-color: #52c49b; color: #52c49b; box-shadow: 0 0 0 3px rgba(82,196,155,0.15); }
        .ad-step-label { font-size: 0.72rem; color: rgba(255,255,255,0.25); white-space: nowrap; }
        .ad-step-label.current { color: #52c49b; }
        .ad-step-label.done    { color: rgba(255,255,255,0.4); }
        .ad-step-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); margin: 0 6px; }
        .ad-step-line.done { background: #52c49b; }

        /* wizard body */
        .ad-wizard-body { padding: 0 24px 8px; }
        .ad-section-label { font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }

        /* form fields */
        .ad-field { margin-bottom: 14px; }
        .ad-field label { display: block; font-size: 0.78rem; font-weight: 500; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .ad-field input, .ad-field select, .ad-field textarea { width: 100%; padding: 11px 13px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; transition: all 0.2s; }
        .ad-field input::placeholder, .ad-field textarea::placeholder { color: rgba(255,255,255,0.2); }
        .ad-field input:focus, .ad-field select:focus, .ad-field textarea:focus { border-color: #52c49b; background: rgba(82,196,155,0.05); box-shadow: 0 0 0 3px rgba(82,196,155,0.1); }
        .ad-field input.err { border-color: #e05c5c; }
        .ad-field select option { background: #1a2535; }
        .ad-field-error { font-size: 0.74rem; color: #e05c5c; margin-top: 4px; }
        .ad-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* emoji picker */
        .ad-emoji-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .ad-emoji-opt { width: 36px; height: 36px; border-radius: 8px; font-size: 1.1rem; border: 1.5px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .ad-emoji-opt:hover { border-color: rgba(82,196,155,0.4); }
        .ad-emoji-opt.selected { border-color: #52c49b; background: rgba(82,196,155,0.1); }

        /* menu item draft list */
        .ad-menu-draft { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; }
        .ad-draft-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 9px; }
        .ad-draft-emoji { font-size: 1.1rem; }
        .ad-draft-name { flex: 1; font-size: 0.85rem; color: rgba(255,255,255,0.7); }
        .ad-draft-price { font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; color: #52c49b; }
        .ad-draft-cat { font-size: 0.72rem; color: rgba(255,255,255,0.25); }
        .ad-draft-remove { background: transparent; border: none; color: rgba(224,92,92,0.5); cursor: pointer; font-size: 0.9rem; transition: color 0.15s; padding: 0; }
        .ad-draft-remove:hover { color: #e05c5c; }
        .ad-add-item-btn { display: flex; align-items: center; gap: 6px; padding: 9px 14px; background: rgba(82,196,155,0.08); border: 1px solid rgba(82,196,155,0.25); border-radius: 8px; color: #52c49b; font-family: 'DM Sans', sans-serif; font-size: 0.84rem; font-weight: 500; cursor: pointer; transition: all 0.18s; margin-top: 12px; }
        .ad-add-item-btn:hover { background: rgba(82,196,155,0.15); }

        /* review step */
        .ad-review-block { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .ad-review-block-title { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
        .ad-review-row { display: flex; justify-content: space-between; font-size: 0.83rem; padding: 4px 0; }
        .ad-review-label { color: rgba(255,255,255,0.35); }
        .ad-review-value { color: #fff; font-weight: 500; }
        .ad-menu-count { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(82,196,155,0.08); border: 1px solid rgba(82,196,155,0.2); border-radius: 999px; font-size: 0.78rem; color: #52c49b; font-weight: 600; }

        /* wizard footer */
        .ad-wizard-footer { display: flex; gap: 10px; padding: 18px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .ad-wizard-prev { padding: 11px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
        .ad-wizard-prev:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
        .ad-wizard-next { flex: 1; padding: 11px; background: #52c49b; border: none; border-radius: 9px; color: #0d1f1c; font-family: 'Syne', sans-serif; font-size: 0.92rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .ad-wizard-next:hover:not(:disabled) { background: #63d4ab; }
        .ad-wizard-next:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── USER MODAL ── */
        .ad-modal { background: #111820; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 100%; max-width: 440px; animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .ad-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ad-modal-title { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; color: #fff; }
        .ad-modal-close { width: 28px; height: 28px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: all 0.15s; }
        .ad-modal-close:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .ad-modal-body { padding: 22px 24px; }
        .ad-modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .ad-modal-save { flex: 1; padding: 12px; background: #52c49b; border: none; border-radius: 9px; color: #0d1f1c; font-family: 'Syne', sans-serif; font-size: 0.92rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .ad-modal-save:hover:not(:disabled) { background: #63d4ab; }
        .ad-modal-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .ad-modal-cancel { padding: 12px 18px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
        .ad-modal-cancel:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        /* ── DELETE CONFIRM ── */
        .ad-delete-modal { background: #111820; border: 1px solid rgba(224,92,92,0.25); border-radius: 18px; width: 100%; max-width: 360px; padding: 32px; text-align: center; animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .ad-delete-icon { font-size: 2rem; margin-bottom: 14px; }
        .ad-delete-modal h3 { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .ad-delete-modal p { font-size: 0.84rem; color: rgba(255,255,255,0.35); margin-bottom: 24px; line-height: 1.5; }
        .ad-delete-actions { display: flex; gap: 10px; }
        .ad-delete-confirm { flex: 1; padding: 11px; background: #e05c5c; border: none; border-radius: 9px; color: #fff; font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .ad-delete-confirm:hover { background: #ef7070; }
        .ad-delete-cancel { flex: 1; padding: 11px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
        .ad-delete-cancel:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        /* spinner */
        .ad-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(13,31,28,0.3); border-top-color: #0d1f1c; border-radius: 50%; animation: spin 0.6s linear infinite; vertical-align: middle; margin-right: 6px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── TOAST ── */
        .ad-toast { position: fixed; bottom: 24px; right: 24px; display: flex; align-items: center; gap: 10px; padding: 13px 18px; background: #1a2535; border: 1px solid rgba(82,196,155,0.3); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 500; font-size: 0.88rem; color: #fff; animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes toastIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* ── PIPELINE CARDS ── */
        .ad-pipeline-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

        .ad-rank-row { display: flex; align-items: center; gap: 10px; padding: 11px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .ad-rank-row:last-child { border-bottom: none; }
        .ad-rank-num { font-family: 'Syne', sans-serif; font-size: 0.78rem; font-weight: 800; color: rgba(255,255,255,0.15); min-width: 20px; text-align: center; }
        .ad-rank-num.top { color: #fbbf24; }
        .ad-rank-emoji { font-size: 1.1rem; }
        .ad-rank-name { flex: 1; font-size: 0.86rem; font-weight: 500; color: #fff; }
        .ad-rank-meta { font-size: 0.74rem; color: rgba(255,255,255,0.28); }

        .ad-stars { color: #fbbf24; font-size: 0.75rem; letter-spacing: 1px; }

        .ad-rev-bar-wrap { flex: 1; }
        .ad-rev-bar-track { height: 5px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; margin-top: 4px; }
        .ad-rev-bar-fill  { height: 100%; background: linear-gradient(90deg, #52c49b, #63d4ab); border-radius: 999px; transition: width 0.5s ease; }
        .ad-rev-amount { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #52c49b; white-space: nowrap; }

        .ad-limit-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 7px; color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif; font-size: 0.76rem; padding: 4px 8px; outline: none; cursor: pointer; transition: all 0.18s; }
        .ad-limit-select:focus, .ad-limit-select:hover { border-color: #52c49b; color: #fff; }
        .ad-limit-select option { background: #1a2535; }
        @media (max-width: 1100px) { .ad-pipeline-grid { grid-template-columns: 1fr; } }
        @media (max-width: 720px) { .ad-sidebar { display: none; } .ad-content { padding: 20px; } .ad-topbar { padding: 14px 20px; } .ad-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div className="ad-page">

        {/* ── SIDEBAR ── */}
        <aside className="ad-sidebar">
          <div className="ad-logo">Click<span>Bite</span></div>
          <div className="ad-logo-sub">Admin Panel</div>
          <div className="ad-nav-section">Navigation</div>
          {TABS.map(tab => (
            <button key={tab} className={"ad-nav-item" + (activeTab === tab ? " active" : "")} onClick={() => { setActiveTab(tab); setSearch(""); }}>
              <span>{tab === "Resumen" ? "📊" : tab === "Restaurantes" ? "🍽️" : tab === "Usuarios" ? "👥" : "📦"}</span>
              {tab}
            </button>
          ))}
          <div className="ad-sidebar-bottom">
            <div className="ad-admin-card">
              <div className="ad-admin-avatar">⚙️</div>
              <div>
                <div className="ad-admin-name">Admin</div>
                <div className="ad-admin-role">Super administrator</div>
              </div>
            </div>
            <button className="ad-logout" onClick={() => navigate("/")}>← Cerrar sesión</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="ad-main">
          <div className="ad-topbar">
            <div className="ad-tabs">
              {TABS.map(tab => (
                <button key={tab} className={"ad-tab" + (activeTab === tab ? " active" : "")} onClick={() => { setActiveTab(tab); setSearch(""); }}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="ad-topbar-right">
              <div className="ad-search-wrap">
                <span className="ad-search-icon">🔍</span>
                <input className="ad-search" type="text" placeholder={"Search " + activeTab.toLowerCase() + "…"} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {activeTab === "Restaurantes" && (
                <button className="ad-add-btn" onClick={openRestModal}>+ Agregar restaurante</button>
              )}
              {activeTab === "Usuarios" && (
                <button className="ad-add-btn" onClick={openUserModal}>+ Agregar usuario</button>
              )}
            </div>
          </div>

          <div className="ad-content">

            {/* ══ OVERVIEW ══ */}
            {activeTab === "Resumen" && (
              <>
                <div className="ad-stats">
                  {[
                    { label: "Ingresos totales",     icon: "💰", value: "$" + mockStats.totalRevenue.toLocaleString(), sub: "$" + mockStats.ingresosToday + " hoy", cls: "green"  },
                    { label: "Pedidos totales",       icon: "📦", value: mockStats.totalOrders.toLocaleString(),        sub: mockStats.ordersToday + " hoy",         cls: ""       },
                    { label: "Registered users",   icon: "👥", value: mockStats.totalUsers,                          sub: "+" + mockStats.newUsersWeek + " this week", cls: ""    },
                    { label: "Restaurantes activos", icon: "🍽️", value: mockStats.activeRestaurants + "/" + mockStats.totalRestaurants, sub: (mockStats.totalRestaurants - mockStats.activeRestaurants) + " inactivos", cls: "yellow" },
                  ].map((s, i) => (
                    <div key={s.label} className="ad-stat" style={{ animationDelay: i * 0.06 + "s" }}>
                      <div className="ad-stat-label">{s.icon} {s.label}</div>
                      <div className={"ad-stat-value " + s.cls}>{s.value}</div>
                      <div className="ad-stat-sub">{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="ad-grid">
                  <div className="ad-card" style={{ animationDelay: "0.1s" }}>
                    <div className="ad-card-header">
                      <div className="ad-card-title">📈 Platform activity — this week</div>
                    </div>
                    <div className="ad-chart-wrap">
                      <div className="ad-chart-toggles">
                        <button className={"ad-chart-toggle" + (chartMetric === "ingresos" ? " active" : "")} onClick={() => setChartMetric("ingresos")}>Revenue</button>
                        <button className={"ad-chart-toggle" + (chartMetric === "orders"  ? " active" : "")} onClick={() => setChartMetric("orders")}>Orders</button>
                      </div>
                      <div className="ad-chart">
                        {mockWeekData.map((d, i) => {
                          const val    = chartMetric === "ingresos" ? d.ingresos : d.orders;
                          const height = Math.round((val / chartMax) * 100);
                          const isToday = i === mockWeekData.length - 1;
                          return (
                            <div key={d.day} className="ad-bar-wrap">
                              <div className="ad-bar-val">{chartMetric === "ingresos" ? "$" + val : val}</div>
                              <div className={"ad-bar" + (isToday ? " hoy" : "")} style={{ height: height + "%" }} />
                              <div className={"ad-bar-day" + (isToday ? " hoy" : "")}>{d.day}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="ad-card" style={{ animationDelay: "0.15s" }}>
                    <div className="ad-card-header">
                      <div className="ad-card-title">🧾 Latest orders</div>
                      <button className="ad-card-link" onClick={() => setActiveTab("Pedidos")}>View all →</button>
                    </div>
                    {mockOrders.slice(0, 5).map(o => {
                      const st = STATUS_CONFIG[o.status];
                      return (
                        <div key={o.id} className="ad-qrow">
                          <span className="ad-qrow-id">{o.id}</span>
                          <span className="ad-qrow-customer">{o.customer}</span>
                          <span className="ad-qrow-rest">{o.restaurant}</span>
                          <span className="ad-qrow-total">${o.total.toFixed(2)}</span>
                          <span className="ad-badge" style={{ background: st.bg, color: st.color }}>{st.icon} {st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Pipeline 1: Restaurantes mejor calificados ── */}
                {/* ── Pipeline 3: Total de ventas por restaurante ── */}
                <div className="ad-pipeline-grid">
                  <div className="ad-card" style={{ animationDelay: "0.2s" }}>
                    <div className="ad-card-header">
                      <div className="ad-card-title">⭐ Top-rated restaurants</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>$limit</span>
                        <select className="ad-limit-select" value={topRatedLimit} onChange={e => setTopRatedLimit(Number(e.target.value))}>
                          {[3, 5, 10, mockTopRated.length].map(n => <option key={n} value={n}>{n === mockTopRated.length ? "All" : "Top " + n}</option>)}
                        </select>
                      </div>
                    </div>
                    {mockTopRated.slice(0, topRatedLimit).map((r, i) => (
                      <div key={r.id} className="ad-rank-row">
                        <span className={"ad-rank-num" + (i < 3 ? " top" : "")}>#{i + 1}</span>
                        <span className="ad-rank-emoji">{r.image}</span>
                        <div style={{ flex: 1 }}>
                          <div className="ad-rank-name">{r.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            <span className="ad-stars">{"★".repeat(Math.round(r.avgRating))}{"☆".repeat(5 - Math.round(r.avgRating))}</span>
                            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>{r.avgRating.toFixed(1)}</span>
                          </div>
                        </div>
                        <span className="ad-rank-meta">{r.totalReviews} reseñas</span>
                      </div>
                    ))}
                  </div>

                  <div className="ad-card" style={{ animationDelay: "0.25s" }}>
                    <div className="ad-card-header">
                      <div className="ad-card-title">💰 Revenue by restaurant</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>$limit</span>
                        <select className="ad-limit-select" value={ingresosLimit} onChange={e => setRevenueLimit(Number(e.target.value))}>
                          {[3, 5, mockRevenueByRestaurant.length].map(n => <option key={n} value={n}>{n === mockRevenueByRestaurant.length ? "All" : "Top " + n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ padding: "12px 20px" }}>
                      {mockRevenueByRestaurant.slice(0, ingresosLimit).map((r) => {
                        const maxRev = mockRevenueByRestaurant[0].totalRevenue;
                        const pct    = Math.round((r.totalRevenue / maxRev) * 100);
                        return (
                          <div key={r.id} style={{ marginBottom: 13 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                              <span style={{ fontSize: "1rem" }}>{r.image}</span>
                              <span style={{ flex: 1, fontSize: "0.83rem", fontWeight: 500, color: "#fff" }}>{r.name}</span>
                              <span className="ad-rev-amount">${r.totalRevenue.toLocaleString()}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="ad-rev-bar-track" style={{ flex: 1 }}>
                                <div className="ad-rev-bar-fill" style={{ width: pct + "%" }} />
                              </div>
                              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", minWidth: 58 }}>{r.totalOrders} orders</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </>
            )}

            {/* ══ RESTAURANTS ══ */}
            {activeTab === "Restaurantes" && (
              <>
                <div className="ad-filters">
                  {["All", "Active", "Inactive"].map(f => (
                    <button key={f} className={"ad-filter" + (restFilter === f ? " active" : "")} onClick={() => setRestFilter(f)}>{f}</button>
                  ))}
                </div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Restaurante</th><th>Categoría</th><th>Dueño</th>
                        <th>Productos</th><th>Pedidos</th><th>Calificación</th>
                        <th>Activo</th><th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRests.map(r => (
                        <tr key={r.id}>
                          <td>
                            <div className="ad-name-cell">
                              <div className="ad-rest-emoji">{r.image}</div>
                              <div>
                                <div className="ad-name-main">{r.name}</div>
                                <div className="ad-name-sub">{r.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: "0.8rem" }}>{r.category}</td>
                          <td style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>{r.owner}</td>
                          <td style={{ textAlign: "center", color: "#52c49b", fontWeight: 600 }}>{r.menuItems}</td>
                          <td style={{ fontWeight: 600, color: "#fff" }}>{r.orders}</td>
                          <td><span className="ad-rating">{r.rating > 0 ? "⭐ " + r.rating : "—"}</span></td>
                          <td>
                            <button className="ad-switch-wrap" onClick={() => toggleRestStatus(r.id)}>
                              <div className={"ad-switch " + (r.status === "activo" ? "on" : "off")}>
                                <div className="ad-switch-knob" />
                              </div>
                            </button>
                          </td>
                          <td>
                            <div className="ad-tbl-actions">
                              <button className={"ad-btn-sm " + (r.status === "activo" ? "ad-btn-toggle-on" : "ad-btn-toggle-off")} onClick={() => toggleRestStatus(r.id)}>
                                {r.status === "activo" ? "Desactivar" : "Activar"}
                              </button>
                              <button className="ad-btn-sm ad-btn-del" onClick={() => confirmDeleteRest(r.id)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ══ USERS ══ */}
            {activeTab === "Usuarios" && (
              <>
                <div className="ad-filters">
                  {["All", "Cliente", "Restaurant", "Suspenderidos"].map(f => (
                    <button key={f} className={"ad-filter" + (userFilter === f ? " active" : "")} onClick={() => setUserFilter(f)}>{f}</button>
                  ))}
                </div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr><th>Usuario</th><th>Rol</th><th>Registrado</th><th>Pedidos</th><th>Total gastado</th><th>Estado</th><th>Acción</th></tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="ad-name-cell">
                              <div className="ad-user-avatar">{u.name.charAt(0)}</div>
                              <div>
                                <div className="ad-name-main">{u.name}</div>
                                <div className="ad-name-sub">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={"ad-role-pill ad-role-" + u.role}>{u.role}</span></td>
                          <td style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>{u.joined}</td>
                          <td style={{ fontWeight: 600, color: "#fff" }}>{u.orders}</td>
                          <td style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: u.totalSpent ? "#52c49b" : "rgba(255,255,255,0.2)", fontSize: "0.88rem" }}>
                            {u.totalSpent != null ? "$" + u.totalSpent.toFixed(2) : "—"}
                          </td>
                          <td><span className={"ad-status " + u.status}>{u.status}</span></td>
                          <td>
                            <button className={"ad-btn-sm " + (u.status === "activo" ? "ad-btn-toggle-on" : "ad-btn-toggle-off")} onClick={() => toggleUserStatus(u.id)}>
                              {u.status === "activo" ? "Suspender" : "Reactivar"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ══ ORDERS ══ */}
            {activeTab === "Pedidos" && (
              <>
                <div className="ad-filters">
                  {["All", "Pending", "Preparing", "On the way", "Delivered", "Cancelled"].map(f => (
                    <button key={f} className={"ad-filter" + (orderFilter === f ? " active" : "")} onClick={() => setOrderFilter(f)}>{f}</button>
                  ))}
                </div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr><th>ID Pedido</th><th>Cliente</th><th>Restaurante</th><th>Total</th><th>Estado</th><th>Fecha</th></tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(o => {
                        const st = STATUS_CONFIG[o.status];
                        return (
                          <tr key={o.id}>
                            <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>{o.id}</td>
                            <td style={{ fontWeight: 500, color: "#fff" }}>{o.customer}</td>
                            <td>{o.restaurant}</td>
                            <td style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#52c49b" }}>${o.total.toFixed(2)}</td>
                            <td><span className="ad-badge" style={{ background: st.bg, color: st.color }}>{st.icon} {st.label}</span></td>
                            <td style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>{o.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>
        </div>

        {/* ══════════ RESTAURANT WIZARD MODAL ══════════ */}
        {restModal && (
          <div className="ad-overlay" onClick={closeRestModal}>
            <div className="ad-wizard" onClick={e => e.stopPropagation()}>
              <div className="ad-wizard-header">
                <div className="ad-wizard-title">
                  Add new restaurant
                  <button className="ad-wizard-close" onClick={closeRestModal}>✕</button>
                </div>
                {/* Step indicator */}
                <div className="ad-steps-row">
                  {WIZARD_STEPS.map((s, i) => (
                    <div key={s} className="ad-step-item" style={{ flex: i < WIZARD_STEPS.length - 1 ? 1 : "none" }}>
                      <div className={"ad-step-dot" + (i < wizardStep ? " done" : i === wizardStep ? " current" : "")}>
                        {i < wizardStep ? "✓" : i + 1}
                      </div>
                      <span className={"ad-step-label" + (i < wizardStep ? " done" : i === wizardStep ? " current" : "")}>
                        {s}
                      </span>
                      {i < WIZARD_STEPS.length - 1 && <div className={"ad-step-line" + (i < wizardStep ? " done" : "")} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="ad-wizard-body">

                {/* ── STEP 0: Restaurant info ── */}
                {wizardStep === 0 && (
                  <>
                    <div className="ad-section-label">Restaurant details</div>
                    <div className="ad-field">
                      <label>Icono</label>
                      <div className="ad-emoji-grid">
                        {EMOJI_OPTS.map(e => (
                          <button key={e} className={"ad-emoji-opt" + (restForm.image === e ? " selected" : "")} onClick={() => handleRestFormChange("image", e)}>{e}</button>
                        ))}
                      </div>
                    </div>
                    <div className="ad-field-row">
                      <div className="ad-field">
                        <label>Restaurant name</label>
                        <input type="text" placeholder="e.g. Burger Palace" className={restErrors.name ? "err" : ""} value={restForm.name} onChange={e => handleRestFormChange("name", e.target.value)} />
                        {restErrors.name && <div className="ad-field-error">{restErrors.name}</div>}
                      </div>
                      <div className="ad-field">
                        <label>Categoría</label>
                        <select value={restForm.category} onChange={e => handleRestFormChange("category", e.target.value)}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="ad-field-row">
                      <div className="ad-field">
                        <label>Correo</label>
                        <input type="email" placeholder="rest@email.com" className={restErrors.email ? "err" : ""} value={restForm.email} onChange={e => handleRestFormChange("email", e.target.value)} />
                        {restErrors.email && <div className="ad-field-error">{restErrors.email}</div>}
                      </div>
                      <div className="ad-field">
                        <label>Teléfono</label>
                        <input type="text" placeholder="555-0100" className={restErrors.phone ? "err" : ""} value={restForm.phone} onChange={e => handleRestFormChange("phone", e.target.value)} />
                        {restErrors.phone && <div className="ad-field-error">{restErrors.phone}</div>}
                      </div>
                    </div>
                  </>
                )}

                {/* ── STEP 1: Owner account ── */}
                {wizardStep === 1 && (
                  <>
                    <div className="ad-section-label">Owner credentials</div>
                    <div className="ad-field">
                      <label>Full name</label>
                      <input type="text" placeholder="John Smith" className={restErrors.ownerName ? "err" : ""} value={restForm.ownerName} onChange={e => handleRestFormChange("ownerName", e.target.value)} />
                      {restErrors.ownerName && <div className="ad-field-error">{restErrors.ownerName}</div>}
                    </div>
                    <div className="ad-field">
                      <label>Correo (login)</label>
                      <input type="email" placeholder="owner@email.com" className={restErrors.ownerEmail ? "err" : ""} value={restForm.ownerEmail} onChange={e => handleRestFormChange("ownerEmail", e.target.value)} />
                      {restErrors.ownerEmail && <div className="ad-field-error">{restErrors.ownerEmail}</div>}
                    </div>
                    <div className="ad-field">
                      <label>Password</label>
                      <input type="password" placeholder="Min 6 characters" className={restErrors.ownerPassword ? "err" : ""} value={restForm.ownerPassword} onChange={e => handleRestFormChange("ownerPassword", e.target.value)} />
                      {restErrors.ownerPassword && <div className="ad-field-error">{restErrors.ownerPassword}</div>}
                    </div>
                    <div style={{ padding: "12px 14px", background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 10, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginTop: 4 }}>
                      ℹ️ These credentials will be used by the restaurant owner to log in and manage their menu and orders.
                    </div>
                  </>
                )}

                {/* ── STEP 2: Initial menu ── */}
                {wizardStep === 2 && (
                  <>
                    <div className="ad-section-label">Add menu items — {restForm.name || "new restaurant"}</div>
                    <div className="ad-field-row">
                      <div className="ad-field">
                        <label>Item name</label>
                        <input type="text" placeholder="e.g. Classic Burger" className={restErrors.name ? "err" : ""} value={menuForm.name} onChange={e => handleMenuFormChange("name", e.target.value)} />
                        {restErrors.name && <div className="ad-field-error">{restErrors.name}</div>}
                      </div>
                      <div className="ad-field">
                        <label>Precio ($)</label>
                        <input type="number" min="0" step="0.01" placeholder="0.00" className={restErrors.price ? "err" : ""} value={menuForm.price} onChange={e => handleMenuFormChange("price", e.target.value)} />
                        {restErrors.price && <div className="ad-field-error">{restErrors.price}</div>}
                      </div>
                    </div>
                    <div className="ad-field-row">
                      <div className="ad-field">
                        <label>Categoría</label>
                        <select value={menuForm.category} onChange={e => handleMenuFormChange("category", e.target.value)}>
                          {MENU_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="ad-field">
                        <label>Icono</label>
                        <div className="ad-emoji-grid" style={{ marginTop: 2 }}>
                          {EMOJI_OPTS.slice(0, 10).map(e => (
                            <button key={e} className={"ad-emoji-opt" + (menuForm.image === e ? " selected" : "")} onClick={() => handleMenuFormChange("image", e)}>{e}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button className="ad-add-item-btn" onClick={addMenuItem}>+ Add to menu</button>

                    {menuItems.length > 0 && (
                      <div className="ad-menu-draft">
                        {menuItems.map(item => (
                          <div key={item.id} className="ad-draft-item">
                            <span className="ad-draft-emoji">{item.image}</span>
                            <span className="ad-draft-name">{item.name}</span>
                            <span className="ad-draft-cat">{item.category}</span>
                            <span className="ad-draft-price">${item.price.toFixed(2)}</span>
                            <button className="ad-draft-remove" onClick={() => removeMenuItem(item.id)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {menuItems.length === 0 && (
                      <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.2)", fontSize: "0.84rem" }}>
                        Sin productos aún. Puedes omitir este paso si lo deseas.
                      </div>
                    )}
                  </>
                )}

                {/* ── STEP 3: Review ── */}
                {wizardStep === 3 && (
                  <>
                    <div className="ad-section-label">Review before saving</div>
                    <div className="ad-review-block">
                      <div className="ad-review-block-title">Restaurant</div>
                      {[
                        ["Nombre",     restForm.image + " " + restForm.name],
                        ["Categoría", restForm.category],
                        ["Email",    restForm.email],
                        ["Phone",    restForm.phone],
                      ].map(([l, v]) => (
                        <div key={l} className="ad-review-row">
                          <span className="ad-review-label">{l}</span>
                          <span className="ad-review-value">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ad-review-block">
                      <div className="ad-review-block-title">Owner account</div>
                      {[
                        ["Nombre",  restForm.ownerName],
                        ["Email", restForm.ownerEmail],
                        ["Password", "••••••"],
                      ].map(([l, v]) => (
                        <div key={l} className="ad-review-row">
                          <span className="ad-review-label">{l}</span>
                          <span className="ad-review-value">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ad-review-block">
                      <div className="ad-review-block-title">Initial menu</div>
                      <div className="ad-review-row">
                        <span className="ad-review-label">Items added</span>
                        <span className="ad-menu-count">🍽️ {menuItems.length} item{menuItems.length !== 1 ? "s" : ""}</span>
                      </div>
                      {menuItems.slice(0, 3).map(item => (
                        <div key={item.id} className="ad-review-row">
                          <span className="ad-review-label">{item.image} {item.name}</span>
                          <span className="ad-review-value" style={{ color: "#52c49b" }}>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {menuItems.length > 3 && (
                        <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.25)", marginTop: 4 }}>+ {menuItems.length - 3} more items</div>
                      )}
                    </div>
                  </>
                )}

              </div>

              <div className="ad-wizard-footer">
                {wizardStep > 0 && (
                  <button className="ad-wizard-prev" onClick={prevStep}>← Atrás</button>
                )}
                {wizardStep < 3 ? (
                  <button className="ad-wizard-next" onClick={nextStep}>
                    {wizardStep === 2 ? "Revisar →" : "Continuar →"}
                  </button>
                ) : (
                  <button className="ad-wizard-next" onClick={saveRestaurant} disabled={saving}>
                    {saving && <span className="ad-spinner" />}
                    {saving ? "Creating…" : "Create restaurant"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ USER MODAL ══════════ */}
        {userModal && (
          <div className="ad-overlay" onClick={closeUserModal}>
            <div className="ad-modal" onClick={e => e.stopPropagation()}>
              <div className="ad-modal-header">
                <div className="ad-modal-title">Create new user</div>
                <button className="ad-modal-close" onClick={closeUserModal}>✕</button>
              </div>
              <div className="ad-modal-body">
                <div className="ad-field">
                  <label>Full name</label>
                  <input type="text" placeholder="Jane Smith" className={userErrors.name ? "err" : ""} value={userForm.name} onChange={e => { setUserForm(p => ({ ...p, name: e.target.value })); if (userErrors.name) setUserErrors(p => { const n = { ...p }; delete n.name; return n; }); }} />
                  {userErrors.name && <div className="ad-field-error">{userErrors.name}</div>}
                </div>
                <div className="ad-field">
                  <label>Correo</label>
                  <input type="email" placeholder="user@email.com" className={userErrors.email ? "err" : ""} value={userForm.email} onChange={e => { setUserForm(p => ({ ...p, email: e.target.value })); if (userErrors.email) setUserErrors(p => { const n = { ...p }; delete n.email; return n; }); }} />
                  {userErrors.email && <div className="ad-field-error">{userErrors.email}</div>}
                </div>
                <div className="ad-field">
                  <label>Password</label>
                  <input type="password" placeholder="Min 6 characters" className={userErrors.password ? "err" : ""} value={userForm.password} onChange={e => { setUserForm(p => ({ ...p, password: e.target.value })); if (userErrors.password) setUserErrors(p => { const n = { ...p }; delete n.password; return n; }); }} />
                  {userErrors.password && <div className="ad-field-error">{userErrors.password}</div>}
                </div>
                <div className="ad-field">
                  <label>Role</label>
                  <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="customer">Customer</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
              </div>
              <div className="ad-modal-footer">
                <button className="ad-modal-cancel" onClick={closeUserModal}>Cancelar</button>
                <button className="ad-modal-save" onClick={saveUser} disabled={savingUser}>
                  {savingUser && <span className="ad-spinner" />}
                  {savingUser ? "Creating…" : "Create user"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ DELETE RESTAURANT CONFIRM ══════════ */}
        {deleteRestId && (
          <div className="ad-overlay" onClick={() => setDeleteRestId(null)}>
            <div className="ad-delete-modal" onClick={e => e.stopPropagation()}>
              <div className="ad-delete-icon">🗑️</div>
              <h3>Remove restaurant?</h3>
              <p>
                This will permanently remove <strong style={{ color: "#fff" }}>
                  {restaurants.find(r => r.id === deleteRestId)?.name}
                </strong> and all associated data. This cannot be undone.
              </p>
              <div className="ad-delete-actions">
                <button className="ad-delete-cancel" onClick={() => setDeleteRestId(null)}>Cancelar</button>
                <button className="ad-delete-confirm" onClick={handleDeleteRest}>Yes, remove</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ TOAST ══════════ */}
        {toast && <div className="ad-toast">✅ {toast}</div>}

      </div>
    </>
  );
}