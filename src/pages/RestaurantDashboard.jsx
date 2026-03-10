import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// MOCK DATA — reemplazar con:
// GET    /api/restaurant/menu-items
// POST   /api/restaurant/menu-items
// PUT    /api/restaurant/menu-items/:id
// DELETE /api/restaurant/menu-items/:id
// ─────────────────────────────────────────────
const CATEGORIES = ["Burgers", "Sides", "Drinks", "Desserts"];

const initialItems = [
  { id: 1, category: "Burgers",  name: "Classic Smash",    description: "Double smash patty, cheddar, pickles, house sauce",     price: 10.99, available: true,  popular: true,  image: "🍔" },
  { id: 2, category: "Burgers",  name: "BBQ Bacon Stack",  description: "Triple patty, crispy bacon, BBQ sauce, onion rings",    price: 14.99, available: true,  popular: true,  image: "🥩" },
  { id: 3, category: "Burgers",  name: "Mushroom Swiss",   description: "Sautéed mushrooms, Swiss cheese, garlic aioli",         price: 12.49, available: true,  popular: false, image: "🍄" },
  { id: 4, category: "Burgers",  name: "Spicy Jalapeño",   description: "Fresh jalapeños, pepper jack, chipotle mayo",           price: 11.99, available: false, popular: false, image: "🌶️" },
  { id: 5, category: "Sides",    name: "Crispy Fries",     description: "Golden seasoned fries with dipping sauce",              price: 3.99,  available: true,  popular: true,  image: "🍟" },
  { id: 6, category: "Sides",    name: "Onion Rings",      description: "Beer-battered rings, served with ranch",               price: 4.49,  available: true,  popular: false, image: "🧅" },
  { id: 7, category: "Drinks",   name: "Chocolate Shake",  description: "Thick milkshake with real cocoa and whipped cream",    price: 5.99,  available: true,  popular: true,  image: "🥤" },
  { id: 8, category: "Drinks",   name: "Craft Lemonade",   description: "Fresh-squeezed lemonade, mint & ice",                  price: 3.49,  available: true,  popular: false, image: "🍋" },
  { id: 9, category: "Desserts", name: "Brownie Sundae",   description: "Warm fudge brownie, vanilla ice cream, caramel drizzle", price: 6.49, available: true,  popular: true,  image: "🍫" },
];
// ─────────────────────────────────────────────

const EMPTY_FORM = { name: "", description: "", price: "", category: "Burgers", image: "🍔", available: true, popular: false };

const EMOJI_OPTIONS = ["🍔", "🥩", "🍄", "🌶️", "🍟", "🧅", "🥗", "🥤", "🍋", "💧", "🍫", "🥧", "🍕", "🌮", "🍜", "🍣", "🍛", "🍗", "🍝"];

export default function RestaurantDashboard() {
  const navigate = useNavigate();

  const [items,       setItems]       = useState(initialItems);
  const [filterCat,   setFilterCat]   = useState("All");
  const [search,      setSearch]      = useState("");
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = new item
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [deleteId,    setDeleteId]    = useState(null);
  const [formErrors,  setFormErrors]  = useState({});
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState("");   // success message

  // ── Filtered items ──
  const filtered = items.filter(i => {
    const matchCat    = filterCat === "All" || i.category === filterCat;
    const matchSearch = search === "" || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Open modal ──
  const openCreate = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ ...item, price: String(item.price) });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingItem(null); };

  // ── Form validation ──
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
      e.price = "Enter a valid price";
    return e;
  };

  // ── Save (create or update) ──
  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setSaving(true);

    setTimeout(() => {
      if (editingItem) {
        // PUT /api/restaurant/menu-items/:id
        setItems(prev => prev.map(i =>
          i.id === editingItem.id ? { ...i, ...form, price: parseFloat(form.price) } : i
        ));
        showToast("Item updated successfully");
      } else {
        // POST /api/restaurant/menu-items
        const newItem = { ...form, id: Date.now(), price: parseFloat(form.price) };
        setItems(prev => [...prev, newItem]);
        showToast("Item added to menu");
      }
      setSaving(false);
      closeModal();
    }, 800);
  };

  // ── Delete ──
  const confirmDelete = (id) => setDeleteId(id);

  const handleDelete = () => {
    // DELETE /api/restaurant/menu-items/:deleteId
    setItems(prev => prev.filter(i => i.id !== deleteId));
    setDeleteId(null);
    showToast("Item removed from menu");
  };

  // ── Toggle availability ──
  const toggleAvailable = (id) => {
    // PATCH /api/restaurant/menu-items/:id  { available }
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  };

  // ── Toast ──
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const pendingCount = 3; // mock — vendría de órdenes activas

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rd-page {
          min-height: 100vh; background: #0d1117;
          font-family: 'DM Sans', sans-serif; color: #fff;
          display: flex;
        }

        /* ── SIDEBAR ── */
        .rd-sidebar {
          width: 220px; min-width: 220px; background: #111820;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          padding: 28px 0; position: sticky; top: 0; height: 100vh;
        }

        .rd-sidebar-logo {
          font-family: 'Syne', sans-serif; font-size: 1.3rem;
          font-weight: 800; color: #52c49b; letter-spacing: -0.5px;
          padding: 0 24px; margin-bottom: 32px;
        }

        .rd-sidebar-logo span { color: #fff; }

        .rd-restaurant-info { padding: 0 16px; margin-bottom: 28px; }

        .rd-restaurant-card {
          display: flex; align-items: center; gap: 10px; padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;
        }

        .rd-restaurant-emoji {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; flex-shrink: 0;
          background: linear-gradient(135deg, #f9731633, #f9731655);
        }

        .rd-restaurant-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #fff; }
        .rd-restaurant-cat  { font-size: 0.72rem; color: rgba(255,255,255,0.3); margin-top: 2px; }

        .rd-nav-section {
          font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.2);
          text-transform: uppercase; letter-spacing: 0.1em;
          padding: 0 24px; margin-bottom: 6px;
        }

        .rd-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 24px; cursor: pointer; transition: all 0.18s;
          color: rgba(255,255,255,0.45); font-size: 0.88rem;
          border: none; background: transparent; width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif; border-left: 3px solid transparent;
        }

        .rd-nav-item:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.03); }

        .rd-nav-item.active {
          color: #52c49b; background: rgba(82,196,155,0.08);
          border-left-color: #52c49b; font-weight: 500;
        }

        .rd-nav-badge {
          margin-left: auto; background: #e05c5c; color: #fff;
          font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 999px;
        }

        .rd-sidebar-bottom {
          margin-top: auto; padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .rd-logout {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 10px 14px; background: transparent; border: none;
          color: rgba(255,255,255,0.3); font-family: 'DM Sans', sans-serif;
          font-size: 0.83rem; cursor: pointer; transition: color 0.2s;
          border-radius: 8px; text-align: left;
        }

        .rd-logout:hover { color: #e05c5c; background: rgba(224,92,92,0.06); }

        /* ── MAIN ── */
        .rd-main { flex: 1; overflow-y: auto; }

        .rd-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 36px; border-bottom: 1px solid rgba(255,255,255,0.06);
          background: #111820; position: sticky; top: 0; z-index: 50;
          gap: 16px; flex-wrap: wrap;
        }

        .rd-topbar-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; color: #fff; }
        .rd-topbar-sub   { font-size: 0.8rem; color: rgba(255,255,255,0.3); margin-top: 2px; }

        .rd-topbar-right { display: flex; align-items: center; gap: 10px; }

        .rd-search-wrap { position: relative; }

        .rd-search {
          padding: 9px 16px 9px 36px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 9px;
          color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          outline: none; width: 200px; transition: all 0.2s;
        }

        .rd-search::placeholder { color: rgba(255,255,255,0.25); }
        .rd-search:focus { border-color: #52c49b; background: rgba(82,196,155,0.05); width: 240px; }

        .rd-search-icon {
          position: absolute; left: 11px; top: 50%;
          transform: translateY(-50%); font-size: 0.85rem;
          color: rgba(255,255,255,0.25); pointer-events: none;
        }

        .rd-add-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; background: #52c49b; border: none;
          border-radius: 9px; color: #0d1f1c;
          font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }

        .rd-add-btn:hover { background: #63d4ab; transform: translateY(-1px); }

        /* ── CONTENT ── */
        .rd-content { padding: 28px 36px; }

        /* ── CATEGORY FILTERS ── */
        .rd-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }

        .rd-filter {
          padding: 7px 16px; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px; background: transparent;
          color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; cursor: pointer; transition: all 0.18s;
        }

        .rd-filter:hover { border-color: rgba(82,196,155,0.3); color: rgba(255,255,255,0.7); }
        .rd-filter.active { background: #52c49b; border-color: #52c49b; color: #0d1f1c; font-weight: 600; }

        /* count */
        .rd-count { font-size: 0.8rem; color: rgba(255,255,255,0.25); margin-bottom: 16px; }
        .rd-count strong { color: #52c49b; }

        /* ── TABLE ── */
        .rd-table-wrap {
          background: #111820; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
          animation: fadeUp 0.3s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rd-table { width: 100%; border-collapse: collapse; }

        .rd-table th {
          padding: 13px 18px; text-align: left;
          font-size: 0.7rem; font-weight: 600; color: rgba(255,255,255,0.25);
          text-transform: uppercase; letter-spacing: 0.08em;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02); white-space: nowrap;
        }

        .rd-table td {
          padding: 14px 18px; font-size: 0.86rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }

        .rd-table tr:last-child td { border-bottom: none; }

        .rd-table tr:hover td { background: rgba(255,255,255,0.02); }

        /* item info cell */
        .rd-item-info { display: flex; align-items: center; gap: 12px; }

        .rd-item-emoji {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; flex-shrink: 0;
          background: rgba(255,255,255,0.04);
        }

        .rd-item-name { font-weight: 500; color: #fff; margin-bottom: 3px; }

        .rd-item-desc {
          font-size: 0.76rem; color: rgba(255,255,255,0.3); font-weight: 300;
          max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* category pill */
        .rd-cat-pill {
          padding: 3px 10px; border-radius: 999px;
          font-size: 0.72rem; font-weight: 500;
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5);
          white-space: nowrap;
        }

        /* price */
        .rd-price {
          font-family: 'Syne', sans-serif; font-size: 0.95rem;
          font-weight: 700; color: #52c49b;
        }

        /* popular badge */
        .rd-popular {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 999px;
          background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2);
          color: #fbbf24; font-size: 0.7rem; font-weight: 600;
        }

        /* availability toggle */
        .rd-avail-toggle {
          display: inline-flex; align-items: center; gap: 8px;
          cursor: pointer; background: transparent; border: none; padding: 0;
          font-family: 'DM Sans', sans-serif;
        }

        .rd-switch {
          width: 34px; height: 18px; border-radius: 999px;
          position: relative; transition: background 0.2s; flex-shrink: 0;
        }

        .rd-switch.on  { background: #52c49b; }
        .rd-switch.off { background: rgba(255,255,255,0.12); }

        .rd-switch-knob {
          position: absolute; top: 2px; width: 14px; height: 14px;
          border-radius: 50%; background: #fff; transition: left 0.2s;
        }

        .rd-switch.on  .rd-switch-knob { left: 18px; }
        .rd-switch.off .rd-switch-knob { left: 2px; }

        .rd-avail-label { font-size: 0.78rem; }
        .rd-avail-label.on  { color: #52c49b; }
        .rd-avail-label.off { color: rgba(255,255,255,0.3); }

        /* action buttons */
        .rd-actions { display: flex; gap: 6px; }

        .rd-btn-edit {
          padding: 6px 14px; border-radius: 7px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6); font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; cursor: pointer; transition: all 0.18s;
        }

        .rd-btn-edit:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2); }

        .rd-btn-del {
          padding: 6px 14px; border-radius: 7px;
          background: transparent; border: 1px solid rgba(224,92,92,0.25);
          color: rgba(224,92,92,0.7); font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; cursor: pointer; transition: all 0.18s;
        }

        .rd-btn-del:hover { background: rgba(224,92,92,0.08); border-color: #e05c5c; color: #e05c5c; }

        /* ── EMPTY ── */
        .rd-empty {
          text-align: center; padding: 64px 20px; color: rgba(255,255,255,0.2);
        }

        .rd-empty-icon { font-size: 2.5rem; margin-bottom: 12px; }

        /* ── MODAL OVERLAY ── */
        .rd-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          z-index: 300; display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* ── MODAL ── */
        .rd-modal {
          background: #111820; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
          animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }

        .rd-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 24px; border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .rd-modal-title {
          font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: #fff;
        }

        .rd-modal-close {
          width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: rgba(255,255,255,0.4); font-size: 0.9rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }

        .rd-modal-close:hover { background: rgba(255,255,255,0.06); color: #fff; }

        .rd-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

        /* ── EMOJI PICKER ── */
        .rd-emoji-grid {
          display: flex; flex-wrap: wrap; gap: 6px;
        }

        .rd-emoji-opt {
          width: 38px; height: 38px; border-radius: 9px; font-size: 1.2rem;
          border: 1.5px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }

        .rd-emoji-opt:hover { border-color: rgba(82,196,155,0.4); background: rgba(82,196,155,0.08); }
        .rd-emoji-opt.selected { border-color: #52c49b; background: rgba(82,196,155,0.12); }

        /* ── FORM FIELDS ── */
        .rd-field { display: flex; flex-direction: column; gap: 6px; }

        .rd-field label {
          font-size: 0.78rem; font-weight: 500; color: rgba(255,255,255,0.45);
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        .rd-field input, .rd-field textarea, .rd-field select {
          padding: 11px 13px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 9px;
          color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.92rem;
          outline: none; transition: all 0.2s;
        }

        .rd-field input::placeholder, .rd-field textarea::placeholder { color: rgba(255,255,255,0.2); }

        .rd-field input:focus, .rd-field textarea:focus, .rd-field select:focus {
          border-color: #52c49b; background: rgba(82,196,155,0.05);
          box-shadow: 0 0 0 3px rgba(82,196,155,0.1);
        }

        .rd-field input.err, .rd-field textarea.err { border-color: #e05c5c; }

        .rd-field select option { background: #1a2535; }

        .rd-field textarea { resize: none; }

        .rd-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .rd-field-error { font-size: 0.76rem; color: #e05c5c; }

        /* checkboxes */
        .rd-checkboxes { display: flex; gap: 16px; }

        .rd-checkbox {
          display: flex; align-items: center; gap: 8px; cursor: pointer;
          font-size: 0.86rem; color: rgba(255,255,255,0.5); user-select: none;
        }

        .rd-checkbox input { display: none; }

        .rd-checkbox-box {
          width: 18px; height: 18px; border-radius: 5px;
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; font-size: 0.7rem; flex-shrink: 0;
        }

        .rd-checkbox.checked .rd-checkbox-box { background: #52c49b; border-color: #52c49b; color: #0d1f1c; }

        /* modal footer */
        .rd-modal-footer {
          display: flex; gap: 10px; padding: 18px 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .rd-modal-save {
          flex: 1; padding: 12px; background: #52c49b; border: none; border-radius: 9px;
          color: #0d1f1c; font-family: 'Syne', sans-serif; font-size: 0.92rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }

        .rd-modal-save:hover:not(:disabled) { background: #63d4ab; }
        .rd-modal-save:disabled { opacity: 0.6; cursor: not-allowed; }

        .rd-modal-cancel {
          padding: 12px 20px; background: transparent;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 9px;
          color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        }

        .rd-modal-cancel:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        .rd-spinner {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(13,31,28,0.3); border-top-color: #0d1f1c;
          border-radius: 50%; animation: spin 0.6s linear infinite;
          vertical-align: middle; margin-right: 6px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── DELETE CONFIRM ── */
        .rd-delete-modal {
          background: #111820; border: 1px solid rgba(224,92,92,0.25);
          border-radius: 18px; width: 100%; max-width: 380px;
          padding: 32px; text-align: center;
          animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }

        .rd-delete-icon { font-size: 2rem; margin-bottom: 14px; }

        .rd-delete-modal h3 {
          font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700;
          color: #fff; margin-bottom: 8px;
        }

        .rd-delete-modal p { font-size: 0.86rem; color: rgba(255,255,255,0.35); margin-bottom: 24px; line-height: 1.5; }

        .rd-delete-actions { display: flex; gap: 10px; }

        .rd-delete-confirm {
          flex: 1; padding: 11px; background: #e05c5c; border: none; border-radius: 9px;
          color: #fff; font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }

        .rd-delete-confirm:hover { background: #ef7070; }

        .rd-delete-cancel {
          flex: 1; padding: 11px; background: transparent;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 9px;
          color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        }

        .rd-delete-cancel:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        /* ── TOAST ── */
        .rd-toast {
          position: fixed; bottom: 24px; right: 24px;
          display: flex; align-items: center; gap: 10px;
          padding: 14px 18px;
          background: #1a2535; border: 1px solid rgba(82,196,155,0.3);
          border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          z-index: 500; animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
          font-size: 0.88rem; color: #fff;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .rd-toast-icon { font-size: 1rem; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .rd-item-desc { display: none; }
        }

        @media (max-width: 720px) {
          .rd-sidebar { display: none; }
          .rd-content { padding: 20px; }
          .rd-topbar { padding: 14px 20px; }
          .rd-table th:nth-child(3),
          .rd-table td:nth-child(3) { display: none; }
        }
      `}</style>

      <div className="rd-page">

        {/* ── SIDEBAR ── */}
        <aside className="rd-sidebar">
          <div className="rd-sidebar-logo">Click<span>Bite</span></div>

          <div className="rd-restaurant-info">
            <div className="rd-restaurant-card">
              <div className="rd-restaurant-emoji">🍔</div>
              <div>
                <div className="rd-restaurant-name">Burger Palace</div>
                <div className="rd-restaurant-cat">Burgers</div>
              </div>
            </div>
          </div>

          <div className="rd-nav-section">Menu</div>

          <button className="rd-nav-item active">
            <span>🍽️</span> My Menu
          </button>
          <button className="rd-nav-item" onClick={() => navigate("/restaurant-orders")}>
            <span>📋</span> Orders
            {pendingCount > 0 && <span className="rd-nav-badge">{pendingCount}</span>}
          </button>

          <div className="rd-sidebar-bottom">
            <button className="rd-logout" onClick={() => navigate("/")}>← Log out</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="rd-main">

          {/* TOPBAR */}
          <div className="rd-topbar">
            <div>
              <div className="rd-topbar-title">Menu management</div>
              <div className="rd-topbar-sub">{items.length} items · {items.filter(i => !i.available).length} unavailable</div>
            </div>
            <div className="rd-topbar-right">
              <div className="rd-search-wrap">
                <span className="rd-search-icon">🔍</span>
                <input
                  className="rd-search"
                  type="text"
                  placeholder="Search items…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="rd-add-btn" onClick={openCreate}>
                + Add item
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="rd-content">

            {/* CATEGORY FILTERS */}
            <div className="rd-filters">
              {["All", ...CATEGORIES].map(c => (
                <button
                  key={c}
                  className={"rd-filter" + (filterCat === c ? " active" : "")}
                  onClick={() => setFilterCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="rd-count">
              <strong>{filtered.length}</strong> item{filtered.length !== 1 ? "s" : ""}
              {filterCat !== "All" && <> in <strong>{filterCat}</strong></>}
            </div>

            {/* TABLE */}
            <div className="rd-table-wrap">
              {filtered.length === 0 ? (
                <div className="rd-empty">
                  <div className="rd-empty-icon">🍽️</div>
                  <p>No items found.</p>
                </div>
              ) : (
                <table className="rd-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Popular</th>
                      <th>Available</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="rd-item-info">
                            <div className="rd-item-emoji">{item.image}</div>
                            <div>
                              <div className="rd-item-name">{item.name}</div>
                              <div className="rd-item-desc">{item.description}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="rd-cat-pill">{item.category}</span></td>
                        <td><span className="rd-price">${item.price.toFixed(2)}</span></td>
                        <td>
                          {item.popular
                            ? <span className="rd-popular">⭐ Popular</span>
                            : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>—</span>
                          }
                        </td>
                        <td>
                          <button className="rd-avail-toggle" onClick={() => toggleAvailable(item.id)}>
                            <div className={"rd-switch " + (item.available ? "on" : "off")}>
                              <div className="rd-switch-knob" />
                            </div>
                            <span className={"rd-avail-label " + (item.available ? "on" : "off")}>
                              {item.available ? "Available" : "Unavailable"}
                            </span>
                          </button>
                        </td>
                        <td>
                          <div className="rd-actions">
                            <button className="rd-btn-edit" onClick={() => openEdit(item)}>✏️ Edit</button>
                            <button className="rd-btn-del"  onClick={() => confirmDelete(item.id)}>🗑 Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── CREATE / EDIT MODAL ── */}
        {modalOpen && (
          <div className="rd-overlay" onClick={closeModal}>
            <div className="rd-modal" onClick={e => e.stopPropagation()}>
              <div className="rd-modal-header">
                <div className="rd-modal-title">
                  {editingItem ? "Edit item" : "Add new item"}
                </div>
                <button className="rd-modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="rd-modal-body">

                {/* EMOJI */}
                <div className="rd-field">
                  <label>Icon</label>
                  <div className="rd-emoji-grid">
                    {EMOJI_OPTIONS.map(e => (
                      <button
                        key={e}
                        className={"rd-emoji-opt" + (form.image === e ? " selected" : "")}
                        onClick={() => handleFormChange("image", e)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NAME */}
                <div className="rd-field">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Classic Smash Burger"
                    className={formErrors.name ? "err" : ""}
                    value={form.name}
                    onChange={e => handleFormChange("name", e.target.value)}
                  />
                  {formErrors.name && <span className="rd-field-error">{formErrors.name}</span>}
                </div>

                {/* DESCRIPTION */}
                <div className="rd-field">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Ingredients, preparation style…"
                    className={formErrors.description ? "err" : ""}
                    value={form.description}
                    onChange={e => handleFormChange("description", e.target.value)}
                  />
                  {formErrors.description && <span className="rd-field-error">{formErrors.description}</span>}
                </div>

                {/* PRICE + CATEGORY */}
                <div className="rd-field-row">
                  <div className="rd-field">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={formErrors.price ? "err" : ""}
                      value={form.price}
                      onChange={e => handleFormChange("price", e.target.value)}
                    />
                    {formErrors.price && <span className="rd-field-error">{formErrors.price}</span>}
                  </div>
                  <div className="rd-field">
                    <label>Category</label>
                    <select value={form.category} onChange={e => handleFormChange("category", e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* CHECKBOXES */}
                <div className="rd-field">
                  <label>Options</label>
                  <div className="rd-checkboxes">
                    <label className={"rd-checkbox" + (form.available ? " checked" : "")}>
                      <input type="checkbox" checked={form.available} onChange={e => handleFormChange("available", e.target.checked)} />
                      <div className="rd-checkbox-box">{form.available && "✓"}</div>
                      Available
                    </label>
                    <label className={"rd-checkbox" + (form.popular ? " checked" : "")}>
                      <input type="checkbox" checked={form.popular} onChange={e => handleFormChange("popular", e.target.checked)} />
                      <div className="rd-checkbox-box">{form.popular && "✓"}</div>
                      Mark as popular
                    </label>
                  </div>
                </div>

              </div>

              <div className="rd-modal-footer">
                <button className="rd-modal-cancel" onClick={closeModal}>Cancel</button>
                <button className="rd-modal-save" onClick={handleSave} disabled={saving}>
                  {saving && <span className="rd-spinner" />}
                  {saving ? "Saving…" : editingItem ? "Save changes" : "Add to menu"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM MODAL ── */}
        {deleteId && (
          <div className="rd-overlay" onClick={() => setDeleteId(null)}>
            <div className="rd-delete-modal" onClick={e => e.stopPropagation()}>
              <div className="rd-delete-icon">🗑️</div>
              <h3>Remove this item?</h3>
              <p>
                This will remove <strong style={{ color: "#fff" }}>
                  {items.find(i => i.id === deleteId)?.name}
                </strong> from your menu. This action cannot be undone.
              </p>
              <div className="rd-delete-actions">
                <button className="rd-delete-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="rd-delete-confirm" onClick={handleDelete}>Yes, remove</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TOAST ── */}
        {toast && (
          <div className="rd-toast">
            <span className="rd-toast-icon">✅</span>
            {toast}
          </div>
        )}

      </div>
    </>
  );
}