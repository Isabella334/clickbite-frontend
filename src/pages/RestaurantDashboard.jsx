// ─────────────────────────────────────────────
// STATIC CONFIG
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuItems as menuItemsApi, restaurants as restaurantsApi, analytics, helpers } from "../services/api";

// ─────────────────────────────────────────────

const CATEGORIES = ["Burgers", "Sides", "Drinks", "Desserts", "Entradas", "Platos principales", "Bebidas", "Postres", "Otros"];
const EMOJI_OPTIONS = ["🍔","🥩","🍄","🌶️","🍟","🧅","🥗","🥤","🍋","🍫","🥧","🍕","🌮","🍜","🍣","🍛","🍗","🍝","🧁","☕"];
const EMPTY_ITEM = { name: "", description: "", price: "", category: "Platos principales", image: "🍔", available: true };
const EMPTY_FORM = { name: "", description: "", price: "", category: "Platos principales", image: "🍔", available: true, popular: false };
const ONBOARD_STEPS = ["Tu restaurante", "Tu menu", "Confirmar"];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes popIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes toastIn{from{opacity:0;transform:translateY(12px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}

  /* ── Onboarding ── */
  .ob-page{min-height:100vh;background:#0d1117;font-family:'DM Sans',sans-serif;color:#fff;display:flex;flex-direction:column;align-items:center;padding:48px 20px}
  .ob-logo{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:#52c49b;margin-bottom:40px;letter-spacing:-0.5px}
  .ob-logo span{color:#fff}
  .ob-card{background:#111820;border:1px solid rgba(255,255,255,0.08);border-radius:24px;width:100%;max-width:600px;animation:fadeUp 0.4s ease}
  .ob-card-header{padding:32px 36px 0}
  .ob-steps{display:flex;margin-bottom:32px}
  .ob-step{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative}
  .ob-step:not(:last-child)::after{content:'';position:absolute;top:14px;left:50%;width:100%;height:2px;background:rgba(255,255,255,0.08)}
  .ob-step-dot{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);background:#0d1117;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;color:rgba(255,255,255,0.3);position:relative;z-index:1;transition:all 0.2s}
  .ob-step-dot.done{background:#52c49b;border-color:#52c49b;color:#0d1f1c}
  .ob-step-dot.active{background:#1a2f26;border-color:#52c49b;color:#52c49b}
  .ob-step-label{font-size:0.72rem;color:rgba(255,255,255,0.3);text-align:center}
  .ob-step-label.active{color:#52c49b}
  .ob-heading{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:#fff;margin-bottom:6px}
  .ob-sub{font-size:0.88rem;color:rgba(255,255,255,0.35);margin-bottom:28px}
  .ob-body{padding:0 36px 28px;display:flex;flex-direction:column;gap:16px}
  .ob-footer{display:flex;gap:10px;padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06)}
  .ob-btn-primary{flex:1;padding:13px;background:#52c49b;border:none;border-radius:10px;color:#0d1f1c;font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;cursor:pointer;transition:all 0.2s}
  .ob-btn-primary:hover:not(:disabled){background:#63d4ab;transform:translateY(-1px)}
  .ob-btn-primary:disabled{opacity:0.6;cursor:not-allowed}
  .ob-btn-ghost{padding:13px 20px;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(255,255,255,0.4);font-family:'DM Sans',sans-serif;font-size:0.92rem;cursor:pointer;transition:all 0.2s}
  .ob-btn-ghost:hover{border-color:rgba(255,255,255,0.25);color:#fff}
  .ob-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(13,31,28,0.3);border-top-color:#0d1f1c;border-radius:50%;animation:spin 0.6s linear infinite;vertical-align:middle;margin-right:6px}
  .ob-menu-builder{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px}
  .ob-menu-builder-title{font-family:'Syne',sans-serif;font-size:0.88rem;font-weight:700;color:#fff;margin-bottom:16px}
  .ob-emoji-row{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px}
  .ob-emoji-opt{width:34px;height:34px;border-radius:8px;font-size:1.1rem;border:1.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s}
  .ob-emoji-opt:hover{border-color:rgba(82,196,155,0.4)}
  .ob-emoji-opt.sel{border-color:#52c49b;background:rgba(82,196,155,0.12)}
  .ob-add-item-btn{width:100%;padding:10px;background:rgba(82,196,155,0.1);border:1px dashed rgba(82,196,155,0.3);border-radius:9px;color:#52c49b;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:500;cursor:pointer;transition:all 0.2s;margin-top:8px}
  .ob-add-item-btn:hover{background:rgba(82,196,155,0.18);border-color:#52c49b}
  .ob-item-list{display:flex;flex-direction:column;gap:8px;margin-top:14px}
  .ob-item-chip{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px}
  .ob-item-chip-emoji{font-size:1.3rem;flex-shrink:0}
  .ob-item-chip-info{flex:1;min-width:0}
  .ob-item-chip-name{font-weight:500;font-size:0.88rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ob-item-chip-meta{font-size:0.75rem;color:rgba(255,255,255,0.3);margin-top:1px}
  .ob-item-chip-price{font-family:'Syne',sans-serif;font-weight:700;font-size:0.9rem;color:#52c49b;flex-shrink:0}
  .ob-item-chip-del{background:transparent;border:1px solid rgba(224,92,92,0.25);color:rgba(224,92,92,0.6);cursor:pointer;font-size:0.75rem;padding:3px 8px;border-radius:6px;transition:all 0.15s;flex-shrink:0}
  .ob-item-chip-del:hover{color:#e05c5c;background:rgba(224,92,92,0.08);border-color:#e05c5c}
  .ob-review-section{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:10px}
  .ob-review-row{display:flex;justify-content:space-between;align-items:flex-start;font-size:0.88rem;gap:12px}
  .ob-review-label{color:rgba(255,255,255,0.35);flex-shrink:0}
  .ob-review-val{color:#fff;font-weight:500;text-align:right}
  .ob-review-title{font-family:'Syne',sans-serif;font-size:0.82rem;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px}
  .ob-items-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(82,196,155,0.1);border:1px solid rgba(82,196,155,0.2);border-radius:999px;color:#52c49b;font-size:0.8rem;font-weight:600;margin-bottom:8px}
  .ob-warning{padding:12px 14px;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:10px;font-size:0.82rem;color:#fbbf24}

  /* ── Dashboard ── */
  .rd-page{min-height:100vh;background:#0d1117;font-family:'DM Sans',sans-serif;color:#fff;display:flex}
  .rd-sidebar{width:220px;min-width:220px;background:#111820;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;padding:28px 0;position:sticky;top:0;height:100vh}
  .rd-sidebar-logo{font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:#52c49b;letter-spacing:-0.5px;padding:0 24px;margin-bottom:32px}
  .rd-sidebar-logo span{color:#fff}
  .rd-restaurant-info{padding:0 16px;margin-bottom:28px}
  .rd-restaurant-card{display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:12px;cursor:pointer;transition:border-color 0.2s}
  .rd-restaurant-card:hover{border-color:rgba(82,196,155,0.3)}
  .rd-restaurant-emoji{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;background:linear-gradient(135deg,#f9731633,#f9731655)}
  .rd-restaurant-name{font-family:'Syne',sans-serif;font-size:0.88rem;font-weight:700;color:#fff}
  .rd-restaurant-cat{font-size:0.72rem;color:rgba(255,255,255,0.3);margin-top:2px}
  .rd-restaurant-edit-hint{font-size:0.67rem;color:rgba(82,196,155,0.5);margin-top:3px}
  .rd-nav-section{font-size:0.68rem;font-weight:600;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:0.1em;padding:0 24px;margin-bottom:6px}
  .rd-nav-item{display:flex;align-items:center;gap:10px;padding:10px 24px;cursor:pointer;transition:all 0.18s;color:rgba(255,255,255,0.45);font-size:0.88rem;border:none;background:transparent;width:100%;text-align:left;font-family:'DM Sans',sans-serif;border-left:3px solid transparent}
  .rd-nav-item:hover{color:rgba(255,255,255,0.8);background:rgba(255,255,255,0.03)}
  .rd-nav-item.active{color:#52c49b;background:rgba(82,196,155,0.08);border-left-color:#52c49b;font-weight:500}
  .rd-sidebar-bottom{margin-top:auto;padding:16px;border-top:1px solid rgba(255,255,255,0.06)}
  .rd-logout{display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;background:transparent;border:none;color:rgba(255,255,255,0.3);font-family:'DM Sans',sans-serif;font-size:0.83rem;cursor:pointer;transition:color 0.2s;border-radius:8px;text-align:left}
  .rd-logout:hover{color:#e05c5c;background:rgba(224,92,92,0.06)}
  .rd-main{flex:1;overflow-y:auto}
  .rd-topbar{display:flex;align-items:center;justify-content:space-between;padding:20px 36px;border-bottom:1px solid rgba(255,255,255,0.06);background:#111820;position:sticky;top:0;z-index:50;gap:16px;flex-wrap:wrap}
  .rd-topbar-title{font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:700;color:#fff}
  .rd-topbar-sub{font-size:0.8rem;color:rgba(255,255,255,0.3);margin-top:2px}
  .rd-topbar-right{display:flex;align-items:center;gap:10px}
  .rd-search-wrap{position:relative}
  .rd-search{padding:9px 16px 9px 36px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#fff;font-family:'DM Sans',sans-serif;font-size:0.88rem;outline:none;width:200px;transition:all 0.2s}
  .rd-search::placeholder{color:rgba(255,255,255,0.25)}
  .rd-search:focus{border-color:#52c49b;background:rgba(82,196,155,0.05);width:240px}
  .rd-search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:0.85rem;color:rgba(255,255,255,0.25);pointer-events:none}
  .rd-add-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;background:#52c49b;border:none;border-radius:9px;color:#0d1f1c;font-family:'Syne',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap}
  .rd-add-btn:hover{background:#63d4ab;transform:translateY(-1px)}
  .rd-content{padding:28px 36px}
  .rd-filters{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
  .rd-filter{padding:7px 16px;border:1px solid rgba(255,255,255,0.1);border-radius:999px;background:transparent;color:rgba(255,255,255,0.4);font-family:'DM Sans',sans-serif;font-size:0.82rem;cursor:pointer;transition:all 0.18s}
  .rd-filter:hover{border-color:rgba(82,196,155,0.3);color:rgba(255,255,255,0.7)}
  .rd-filter.active{background:#52c49b;border-color:#52c49b;color:#0d1f1c;font-weight:600}
  .rd-count{font-size:0.8rem;color:rgba(255,255,255,0.25);margin-bottom:16px}
  .rd-count strong{color:#52c49b}

  /* Bulk action bar */
  .rd-bulk-bar{display:flex;align-items:center;gap:10px;padding:12px 18px;background:#1a2535;border:1px solid rgba(82,196,155,0.2);border-radius:12px;margin-bottom:14px;animation:fadeUp 0.2s ease;flex-wrap:wrap}
  .rd-bulk-count{font-size:0.85rem;color:#52c49b;font-weight:600;flex-shrink:0}
  .rd-bulk-sep{width:1px;height:20px;background:rgba(255,255,255,0.1);flex-shrink:0}
  .rd-bulk-actions{display:flex;gap:8px;flex-wrap:wrap;flex:1}
  .rd-bulk-btn{padding:7px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:500;cursor:pointer;transition:all 0.18s;white-space:nowrap}
  .rd-bulk-btn-green{background:rgba(82,196,155,0.12);border:1px solid rgba(82,196,155,0.3);color:#52c49b}
  .rd-bulk-btn-green:hover{background:rgba(82,196,155,0.22);border-color:#52c49b}
  .rd-bulk-btn-yellow{background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.25);color:#fbbf24}
  .rd-bulk-btn-yellow:hover{background:rgba(251,191,36,0.2)}
  .rd-bulk-btn-cat{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.6)}
  .rd-bulk-btn-cat:hover{background:rgba(255,255,255,0.1);color:#fff}
  .rd-bulk-btn-red{background:rgba(224,92,92,0.1);border:1px solid rgba(224,92,92,0.25);color:#e05c5c}
  .rd-bulk-btn-red:hover{background:rgba(224,92,92,0.2);border-color:#e05c5c}
  .rd-bulk-clear{margin-left:auto;background:transparent;border:none;color:rgba(255,255,255,0.3);font-size:0.8rem;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all 0.15s;flex-shrink:0}
  .rd-bulk-clear:hover{color:#fff;background:rgba(255,255,255,0.06)}
  .rd-bulk-cat-select{padding:7px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-family:'DM Sans',sans-serif;font-size:0.82rem;outline:none;cursor:pointer}
  .rd-bulk-cat-select option{background:#1a2535}

  .rd-table-wrap{background:#111820;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;animation:fadeUp 0.3s ease}
  .rd-table{width:100%;border-collapse:collapse}
  .rd-table th{padding:13px 18px;text-align:left;font-size:0.7rem;font-weight:600;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);white-space:nowrap}
  .rd-table th.th-check{width:44px;padding:13px 14px}
  .rd-table td{padding:14px 18px;font-size:0.86rem;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:middle}
  .rd-table td.td-check{padding:14px 14px;width:44px}
  .rd-table tr:last-child td{border-bottom:none}
  .rd-table tr:hover td{background:rgba(255,255,255,0.02)}
  .rd-table tr.selected td{background:rgba(82,196,155,0.04)}
  .rd-cb{width:17px;height:17px;border-radius:5px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0}
  .rd-cb.checked{background:#52c49b;border-color:#52c49b}
  .rd-cb-mark{font-size:0.65rem;color:#0d1f1c;font-weight:800;line-height:1}
  .rd-item-info{display:flex;align-items:center;gap:12px}
  .rd-item-emoji{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;background:rgba(255,255,255,0.04)}
  .rd-item-name{font-weight:500;color:#fff;margin-bottom:3px}
  .rd-item-desc{font-size:0.76rem;color:rgba(255,255,255,0.3);font-weight:300;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .rd-cat-pill{padding:3px 10px;border-radius:999px;font-size:0.72rem;font-weight:500;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);white-space:nowrap}
  .rd-price{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;color:#52c49b}
  .rd-avail-toggle{display:inline-flex;align-items:center;gap:8px;cursor:pointer;background:transparent;border:none;padding:0;font-family:'DM Sans',sans-serif}
  .rd-switch{width:34px;height:18px;border-radius:999px;position:relative;transition:background 0.2s;flex-shrink:0}
  .rd-switch.on{background:#52c49b}
  .rd-switch.off{background:rgba(255,255,255,0.12)}
  .rd-switch-knob{position:absolute;top:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:left 0.2s}
  .rd-switch.on .rd-switch-knob{left:18px}
  .rd-switch.off .rd-switch-knob{left:2px}
  .rd-avail-label{font-size:0.78rem}
  .rd-avail-label.on{color:#52c49b}
  .rd-avail-label.off{color:rgba(255,255,255,0.3)}
  .rd-actions{display:flex;gap:6px}
  .rd-btn-edit{padding:6px 14px;border-radius:7px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-family:'DM Sans',sans-serif;font-size:0.8rem;cursor:pointer;transition:all 0.18s}
  .rd-btn-edit:hover{background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.2)}
  .rd-btn-del{padding:6px 14px;border-radius:7px;background:transparent;border:1px solid rgba(224,92,92,0.25);color:rgba(224,92,92,0.7);font-family:'DM Sans',sans-serif;font-size:0.8rem;cursor:pointer;transition:all 0.18s}
  .rd-btn-del:hover{background:rgba(224,92,92,0.08);border-color:#e05c5c;color:#e05c5c}
  .rd-empty{text-align:center;padding:64px 20px;color:rgba(255,255,255,0.2)}
  .rd-empty-icon{font-size:2.5rem;margin-bottom:12px}

  /* Modals */
  .rd-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s ease}
  .rd-modal{background:#111820;border:1px solid rgba(255,255,255,0.1);border-radius:20px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)}
  .rd-modal-header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;border-bottom:1px solid rgba(255,255,255,0.06)}
  .rd-modal-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:#fff}
  .rd-modal-close{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:0.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s}
  .rd-modal-close:hover{background:rgba(255,255,255,0.06);color:#fff}
  .rd-modal-body{padding:24px;display:flex;flex-direction:column;gap:16px}
  .rd-emoji-grid{display:flex;flex-wrap:wrap;gap:6px}
  .rd-emoji-opt{width:38px;height:38px;border-radius:9px;font-size:1.2rem;border:1.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s}
  .rd-emoji-opt:hover{border-color:rgba(82,196,155,0.4);background:rgba(82,196,155,0.08)}
  .rd-emoji-opt.selected{border-color:#52c49b;background:rgba(82,196,155,0.12)}
  .rd-field{display:flex;flex-direction:column;gap:6px}
  .rd-field label{font-size:0.78rem;font-weight:500;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.06em}
  .rd-field input,.rd-field textarea,.rd-field select{padding:11px 13px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:9px;color:#fff;font-family:'DM Sans',sans-serif;font-size:0.92rem;outline:none;transition:all 0.2s}
  .rd-field input::placeholder,.rd-field textarea::placeholder{color:rgba(255,255,255,0.2)}
  .rd-field input:focus,.rd-field textarea:focus,.rd-field select:focus{border-color:#52c49b;background:rgba(82,196,155,0.05);box-shadow:0 0 0 3px rgba(82,196,155,0.1)}
  .rd-field input.err,.rd-field textarea.err{border-color:#e05c5c}
  .rd-field select option{background:#1a2535}
  .rd-field textarea{resize:none}
  .rd-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .rd-field-error{font-size:0.76rem;color:#e05c5c}
  .rd-field-submit-error{font-size:0.82rem;color:#e05c5c;text-align:center;padding:8px;background:rgba(224,92,92,0.08);border-radius:8px}
  .rd-checkboxes{display:flex;gap:16px}
  .rd-checkbox{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.86rem;color:rgba(255,255,255,0.5);user-select:none}
  .rd-checkbox input{display:none}
  .rd-checkbox-box{width:18px;height:18px;border-radius:5px;border:1.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;transition:all 0.15s;font-size:0.7rem;flex-shrink:0}
  .rd-checkbox.checked .rd-checkbox-box{background:#52c49b;border-color:#52c49b;color:#0d1f1c}
  .rd-modal-footer{display:flex;gap:10px;padding:18px 24px;border-top:1px solid rgba(255,255,255,0.06)}
  .rd-modal-save{flex:1;padding:12px;background:#52c49b;border:none;border-radius:9px;color:#0d1f1c;font-family:'Syne',sans-serif;font-size:0.92rem;font-weight:700;cursor:pointer;transition:all 0.2s}
  .rd-modal-save:hover:not(:disabled){background:#63d4ab}
  .rd-modal-save:disabled{opacity:0.6;cursor:not-allowed}
  .rd-modal-cancel{padding:12px 20px;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:9px;color:rgba(255,255,255,0.4);font-family:'DM Sans',sans-serif;font-size:0.9rem;cursor:pointer;transition:all 0.2s}
  .rd-modal-cancel:hover{border-color:rgba(255,255,255,0.25);color:#fff}
  .rd-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(13,31,28,0.3);border-top-color:#0d1f1c;border-radius:50%;animation:spin 0.6s linear infinite;vertical-align:middle;margin-right:6px}
  .rd-delete-modal{background:#111820;border:1px solid rgba(224,92,92,0.25);border-radius:18px;width:100%;max-width:420px;padding:32px;text-align:center;animation:popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)}
  .rd-delete-icon{font-size:2rem;margin-bottom:14px}
  .rd-delete-modal h3{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:8px}
  .rd-delete-modal p{font-size:0.86rem;color:rgba(255,255,255,0.35);margin-bottom:24px;line-height:1.5}
  .rd-delete-chip-list{display:flex;flex-direction:column;gap:6px;margin-bottom:18px;text-align:left;max-height:180px;overflow-y:auto}
  .rd-delete-chip{display:flex;align-items:center;gap:8px;padding:7px 12px;background:rgba(224,92,92,0.06);border:1px solid rgba(224,92,92,0.15);border-radius:8px;font-size:0.82rem;color:rgba(255,255,255,0.6)}
  .rd-delete-actions{display:flex;gap:10px}
  .rd-delete-confirm{flex:1;padding:11px;background:#e05c5c;border:none;border-radius:9px;color:#fff;font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer;transition:all 0.2s}
  .rd-delete-confirm:hover{background:#ef7070}
  .rd-delete-cancel{flex:1;padding:11px;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:9px;color:rgba(255,255,255,0.4);font-family:'DM Sans',sans-serif;font-size:0.9rem;cursor:pointer;transition:all 0.2s}
  .rd-delete-cancel:hover{border-color:rgba(255,255,255,0.25);color:#fff}
  .rd-toast{position:fixed;bottom:24px;right:24px;display:flex;align-items:center;gap:10px;padding:14px 18px;background:#1a2535;border:1px solid rgba(82,196,155,0.3);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);z-index:500;animation:toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);font-size:0.88rem;color:#fff}
  .rd-bs-section{background:#111820;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px 20px;margin-bottom:20px;animation:fadeUp 0.3s ease}
  .rd-bs-header{display:flex;align-items:center;margin-bottom:14px}
  .rd-bs-title{font-family:'Syne',sans-serif;font-size:0.92rem;font-weight:700;color:#fff}
  .rd-bs-list{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px}
  .rd-bs-item{flex-shrink:0;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px 16px;min-width:130px;text-align:center}
  .rd-bs-emoji{font-size:1.5rem;margin-bottom:8px}
  .rd-bs-name{font-size:0.8rem;font-weight:500;color:#fff;margin-bottom:4px}
  .rd-bs-sold{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:#52c49b}
  .rd-bs-sold-label{font-size:0.68rem;color:rgba(255,255,255,0.2);margin-top:1px}
  .rd-bs-rank-1{border-color:rgba(251,191,36,0.3);background:rgba(251,191,36,0.05)}
  .rd-bs-rank-2{border-color:rgba(148,163,184,0.25)}
  .rd-bs-rank-3{border-color:rgba(205,127,50,0.2)}
  @media(max-width:720px){.rd-sidebar{display:none}.rd-content{padding:20px}.rd-topbar{padding:14px 20px}}

  /* Shared field styles for onboarding */
  .ob-field{display:flex;flex-direction:column;gap:6px}
  .ob-field label{font-size:0.75rem;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.07em}
  .ob-field input,.ob-field textarea,.ob-field select{padding:11px 13px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-family:'DM Sans',sans-serif;font-size:0.92rem;outline:none;transition:all 0.2s;width:100%}
  .ob-field input::placeholder,.ob-field textarea::placeholder{color:rgba(255,255,255,0.2)}
  .ob-field input:focus,.ob-field textarea:focus,.ob-field select:focus{border-color:#52c49b;background:rgba(82,196,155,0.05);box-shadow:0 0 0 3px rgba(82,196,155,0.1)}
  .ob-field input.err,.ob-field textarea.err{border-color:#e05c5c}
  .ob-field select option{background:#1a2535}
  .ob-field textarea{resize:none}
  .ob-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .ob-err{font-size:0.76rem;color:#e05c5c}
  .ob-submit-err{font-size:0.82rem;color:#e05c5c;padding:10px 14px;background:rgba(224,92,92,0.08);border-radius:8px;border:1px solid rgba(224,92,92,0.2)}
`;

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const session  = helpers.getSession();

  // Data
  const [restaurant,  setRestaurant]  = useState(null);
  const [items,       setItems]       = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  // Filters / search
  const [filterCat,   setFilterCat]   = useState("Todos");
  const [search,      setSearch]      = useState("");

  // Selection (checkboxes)
  const [selected,    setSelected]    = useState(new Set());

  // Item modal
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [formErrors,  setFormErrors]  = useState({});
  const [saving,      setSaving]      = useState(false);

  // Delete confirm (single or bulk)
  const [deleteTarget, setDeleteTarget] = useState(null); // { ids: string[], labels: string[] }

  // Edit restaurant modal
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [restForm,      setRestForm]      = useState({});
  const [restErrors,    setRestErrors]    = useState({});
  const [restSaving,    setRestSaving]    = useState(false);

  // Bulk category picker
  const [bulkCatValue, setBulkCatValue] = useState("Platos principales");

  const [toast, setToast] = useState("");

  // Onboarding
  const [onboarding,  setOnboarding]  = useState(false);
  const [obStep,      setObStep]      = useState(0);
  const [obRestForm,  setObRestForm]  = useState({ name:"", description:"", category:"Otros", phone:"", email: session?.email ?? "" });
  const [obMenuItems, setObMenuItems] = useState([]);
  const [obItemForm,  setObItemForm]  = useState(EMPTY_ITEM);
  const [obErrors,    setObErrors]    = useState({});
  const [obSaving,    setObSaving]    = useState(false);

  // ── Load ──
  useEffect(() => {
    if (!session) { navigate("/"); return; }
    const load = async () => {
      setLoading(true); setError("");
      try {
        let myRests = null;
        try {
          myRests = await restaurantsApi.getByOwner(session.id);
        } catch (e) {
          if (e.status === 404 || (e.message && e.message.toLowerCase().includes("no se encontraron"))) {
            setOnboarding(true); setLoading(false); return;
          }
          throw e;
        }
        if (!myRests || myRests.length === 0) { setOnboarding(true); setLoading(false); return; }
        const myRest = myRests[0];
        setRestaurant(myRest);
        setRestForm({
          name:        myRest.name || "",
          description: myRest.description || "",
          category:    myRest.categories?.[0] || "Otros",
          phone:       myRest.contact?.phone || "",
          email:       myRest.contact?.email || "",
        });
        const [rawItems, topItems] = await Promise.all([
          menuItemsApi.getByRestaurant(myRest.id),
          analytics.getTopSellingItems(),
        ]);
        setItems((rawItems ?? []).map(helpers.toMenuItem));
        setBestsellers((topItems ?? []).slice(0, 5).map(t => ({
          id: t.menu_item_id ?? t._id, name: t.name ?? t.item_name ?? "—",
          image: "🍽️", totalSold: t.total_sold ?? t.totalSold ?? 0,
        })));
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Helpers: selection ──
  const availableCategories = [...new Set(items.map(i => i.category).filter(Boolean))];

  const filtered = items.filter(i => {
    const matchCat = filterCat === "Todos" ? true : filterCat === "Popular" ? i.popular : i.category === filterCat;
    return matchCat && (search === "" || i.name.toLowerCase().includes(search.toLowerCase()));
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every(i => selected.has(i.id));

  const toggleSelect = (id) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(i => s.delete(i.id)); return s; });
    } else {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(i => s.add(i.id)); return s; });
    }
  };

  const clearSelection = () => setSelected(new Set());

  const selectedItems = items.filter(i => selected.has(i.id));

  // ── Bulk actions ──
  const bulkSetAvailable = async (value) => {
    const ids = [...selected];
    try {
      await menuItemsApi.bulkUpdate(ids, { is_available: value });
      setItems(prev => prev.map(i => selected.has(i.id) ? { ...i, available: value } : i));
      showToast(ids.length + " producto(s) " + (value ? "disponibles" : "no disponibles"));
      clearSelection();
    } catch (err) { showToast("Error: " + err.message); }
  };

  const bulkSetCategory = async (cat) => {
    const ids = [...selected];
    try {
      await menuItemsApi.bulkUpdate(ids, { category: cat });
      setItems(prev => prev.map(i => selected.has(i.id) ? { ...i, category: cat } : i));
      showToast(ids.length + " producto(s) movidos a " + cat);
      clearSelection();
    } catch (err) { showToast("Error: " + err.message); }
  };

  const confirmBulkDelete = () => {
    setDeleteTarget({
      ids:    [...selected],
      labels: selectedItems.map(i => i.image + " " + i.name),
    });
  };

  const confirmSingleDelete = (item) => {
    setDeleteTarget({ ids: [item.id], labels: [item.image + " " + item.name] });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await menuItemsApi.bulkDelete(deleteTarget.ids);
      const deletedSet = new Set(deleteTarget.ids);
      setItems(prev => prev.filter(i => !deletedSet.has(i.id)));
      setSelected(prev => { const s = new Set(prev); deleteTarget.ids.forEach(id => s.delete(id)); return s; });
      showToast(deleteTarget.ids.length + " producto(s) eliminado(s)");
    } catch (err) { showToast("Error: " + err.message); }
    finally { setDeleteTarget(null); }
  };

  // ── Item CRUD ──
  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormErrors({}); setModalOpen(true); };
  const openEdit   = (item) => { setEditingItem(item); setForm({ ...item, price: String(item.price) }); setFormErrors({}); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); };

  const validateItem = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "El nombre es obligatorio";
    if (!form.description.trim()) e.description = "La descripcion es obligatoria";
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) e.price = "Precio invalido";
    return e;
  };

  const handleSaveItem = async () => {
    const e = validateItem();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setSaving(true);
    try {
      if (editingItem) {
        // UpdateOne via PUT /menu-items/:id
        await menuItemsApi.update(editingItem.id, {
          name: form.name, description: form.description,
          price: parseFloat(form.price), category: form.category,
          is_available: form.available, stock: editingItem.stock ?? 99,
        });
        setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...form, price: parseFloat(form.price) } : i));
        showToast("Producto actualizado");
      } else {
        const payload = helpers.toCreateMenuItemPayload(restaurant.id, { ...form });
        const created = await menuItemsApi.create(payload);
        setItems(prev => [...prev, helpers.toMenuItem(created)]);
        showToast("Producto agregado al menu");
      }
      closeModal();
    } catch (err) { setFormErrors({ submit: err.message }); }
    finally { setSaving(false); }
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleAvailableSingle = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const next = !item.available;
    try {
      // UpdateOne via bulkUpdate con 1 ID
      await menuItemsApi.bulkUpdate([id], { is_available: next });
      setItems(prev => prev.map(i => i.id === id ? { ...i, available: next } : i));
    } catch (err) { showToast("Error: " + err.message); }
  };

  // ── Edit restaurant ──
  const openRestModal = () => { setRestErrors({}); setRestModalOpen(true); };

  const validateRest = () => {
    const e = {};
    if (!restForm.name?.trim())        e.name        = "Obligatorio";
    if (!restForm.description?.trim()) e.description = "Obligatorio";
    if (!restForm.phone?.trim())       e.phone       = "Obligatorio";
    if (!restForm.email?.includes("@")) e.email      = "Correo invalido";
    return e;
  };

  const handleSaveRest = async () => {
    const e = validateRest();
    if (Object.keys(e).length) { setRestErrors(e); return; }
    setRestSaving(true);
    try {
      // UpdateOne via PUT /restaurants/:id
      const payload = {
        name:        restForm.name,
        description: restForm.description,
        categories:  [restForm.category],
        contact: { phone: restForm.phone, email: restForm.email },
      };
      await restaurantsApi.update(restaurant.id, payload);
      setRestaurant(prev => ({ ...prev, ...payload, categories: [restForm.category] }));
      setRestModalOpen(false);
      showToast("Informacion del restaurante actualizada");
    } catch (err) { setRestErrors({ submit: err.message }); }
    finally { setRestSaving(false); }
  };

  const handleRestFormChange = (field, value) => {
    setRestForm(prev => ({ ...prev, [field]: value }));
    if (restErrors[field]) setRestErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // ── Onboarding ──
  const validateObStep = () => {
    const e = {};
    if (obStep === 0) {
      if (!obRestForm.name.trim())         e.name        = "Obligatorio";
      if (!obRestForm.description.trim())  e.description = "Obligatorio";
      if (!obRestForm.phone.trim())        e.phone       = "Obligatorio";
      if (!obRestForm.email.includes("@")) e.email       = "Correo invalido";
    }
    return e;
  };
  const obNext = () => { const e = validateObStep(); if (Object.keys(e).length) { setObErrors(e); return; } setObErrors({}); setObStep(s => s+1); };
  const obBack = () => { setObErrors({}); setObStep(s => s-1); };
  const obHandleRestChange = (f, v) => { setObRestForm(p => ({...p, [f]:v})); if (obErrors[f]) setObErrors(p => { const n={...p}; delete n[f]; return n; }); };
  const obHandleItemChange = (f, v) => { setObItemForm(p => ({...p, [f]:v})); const k="item_"+f; if (obErrors[k]) setObErrors(p => { const n={...p}; delete n[k]; return n; }); };
  const obAddItem = () => {
    const e = {};
    if (!obItemForm.name.trim()) e.item_name = "Obligatorio";
    if (!obItemForm.price || isNaN(parseFloat(obItemForm.price)) || parseFloat(obItemForm.price) <= 0) e.item_price = "Precio invalido";
    if (Object.keys(e).length) { setObErrors(e); return; }
    setObMenuItems(p => [...p, { ...obItemForm, price: parseFloat(obItemForm.price), _key: Date.now() }]);
    setObItemForm(EMPTY_ITEM); setObErrors({});
  };
  const obRemoveItem = (key) => setObMenuItems(p => p.filter(i => i._key !== key));
  const obSubmit = async () => {
    setObSaving(true);
    try {
      const restPayload = helpers.toCreateRestaurantPayload({ ...obRestForm, ownerId: session.id });
      const created = await restaurantsApi.create(restPayload);
      if (obMenuItems.length > 0) {
        const batch = obMenuItems.map(item => ({ name: item.name, description: item.description || "", price: item.price, category: item.category, is_available: true, stock: 99 }));
        const createdItems = await menuItemsApi.createBatch(created.id, batch);
        setItems((createdItems ?? []).map(helpers.toMenuItem));
      }
      setRestaurant(created);
      setRestForm({ name: created.name, description: created.description, category: created.categories?.[0] || "Otros", phone: created.contact?.phone || "", email: created.contact?.email || "" });
      setOnboarding(false);
      showToast("Restaurante creado. Bienvenido a ClickBite!");
    } catch (err) { setObErrors({ submit: err.message }); }
    finally { setObSaving(false); }
  };

  // ── Loading / error screens ──
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0d1117", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.4)", fontFamily:"DM Sans,sans-serif", gap:12 }}>
      <div style={{ width:20, height:20, border:"2px solid rgba(82,196,155,0.3)", borderTopColor:"#52c49b", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
      Cargando...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (error) return (
    <div style={{ minHeight:"100vh", background:"#0d1117", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, color:"#e05c5c", fontFamily:"DM Sans,sans-serif" }}>
      <div>{error}</div>
      <button onClick={() => window.location.reload()} style={{ padding:"10px 20px", background:"#52c49b", border:"none", borderRadius:8, color:"#0d1f1c", fontWeight:700, cursor:"pointer" }}>Reintentar</button>
    </div>
  );

  const restName     = restaurant?.name ?? session?.name ?? "Mi Restaurante";
  const restCategory = restaurant?.categories?.[0] ?? "—";

  // ── ONBOARDING ──
  if (onboarding) return (
    <>
      <style>{CSS}</style>
      <div className="ob-page">
        <div className="ob-logo">Click<span>Bite</span></div>
        <div className="ob-card">
          <div className="ob-card-header">
            <div className="ob-steps">
              {ONBOARD_STEPS.map((s, i) => (
                <div key={s} className="ob-step">
                  <div className={"ob-step-dot" + (i < obStep ? " done" : i === obStep ? " active" : "")}>{i < obStep ? "v" : i+1}</div>
                  <div className={"ob-step-label" + (i === obStep ? " active" : "")}>{s}</div>
                </div>
              ))}
            </div>
            {obStep === 0 && <><div className="ob-heading">Crea tu restaurante</div><div className="ob-sub">Cuentanos sobre tu negocio para comenzar.</div></>}
            {obStep === 1 && <><div className="ob-heading">Agrega tu menu</div><div className="ob-sub">Agrega productos uno por uno. Puedes anadir mas despues.</div></>}
            {obStep === 2 && <><div className="ob-heading">Revisa y confirma</div><div className="ob-sub">Verifica que todo este correcto antes de crear tu restaurante.</div></>}
          </div>
          <div className="ob-body">
            {obStep === 0 && <>
              <div className="ob-field"><label>Nombre *</label><input type="text" placeholder="Ej. La Trattoria" className={obErrors.name?"err":""} value={obRestForm.name} onChange={e=>obHandleRestChange("name",e.target.value)}/>{obErrors.name&&<span className="ob-err">{obErrors.name}</span>}</div>
              <div className="ob-field"><label>Descripcion *</label><textarea rows={3} placeholder="Que tipo de comida ofreces?" className={obErrors.description?"err":""} value={obRestForm.description} onChange={e=>obHandleRestChange("description",e.target.value)}/>{obErrors.description&&<span className="ob-err">{obErrors.description}</span>}</div>
              <div className="ob-field"><label>Categoria</label><select value={obRestForm.category} onChange={e=>obHandleRestChange("category",e.target.value)}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div className="ob-field-row">
                <div className="ob-field"><label>Telefono *</label><input type="text" placeholder="+502 5555-0000" className={obErrors.phone?"err":""} value={obRestForm.phone} onChange={e=>obHandleRestChange("phone",e.target.value)}/>{obErrors.phone&&<span className="ob-err">{obErrors.phone}</span>}</div>
                <div className="ob-field"><label>Correo *</label><input type="email" placeholder="contacto@rest.com" className={obErrors.email?"err":""} value={obRestForm.email} onChange={e=>obHandleRestChange("email",e.target.value)}/>{obErrors.email&&<span className="ob-err">{obErrors.email}</span>}</div>
              </div>
            </>}
            {obStep === 1 && <>
              <div className="ob-menu-builder">
                <div className="ob-menu-builder-title">+ Nuevo producto</div>
                <div className="ob-field"><label>Icono</label>
                  <div className="ob-emoji-row">{EMOJI_OPTIONS.map(e=><button key={e} className={"ob-emoji-opt"+(obItemForm.image===e?" sel":"")} onClick={()=>obHandleItemChange("image",e)}>{e}</button>)}</div>
                </div>
                <div className="ob-field"><label>Nombre *</label><input type="text" placeholder="Ej. Hamburguesa Clasica" className={obErrors.item_name?"err":""} value={obItemForm.name} onChange={e=>obHandleItemChange("name",e.target.value)}/>{obErrors.item_name&&<span className="ob-err">{obErrors.item_name}</span>}</div>
                <div className="ob-field" style={{marginTop:10}}><label>Descripcion</label><input type="text" placeholder="Ingredientes..." value={obItemForm.description} onChange={e=>obHandleItemChange("description",e.target.value)}/></div>
                <div className="ob-field-row" style={{marginTop:10}}>
                  <div className="ob-field"><label>Precio (Q) *</label><input type="number" min="0" step="0.01" placeholder="0.00" className={obErrors.item_price?"err":""} value={obItemForm.price} onChange={e=>obHandleItemChange("price",e.target.value)}/>{obErrors.item_price&&<span className="ob-err">{obErrors.item_price}</span>}</div>
                  <div className="ob-field"><label>Categoria</label><select value={obItemForm.category} onChange={e=>obHandleItemChange("category",e.target.value)}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                <button className="ob-add-item-btn" onClick={obAddItem}>+ Agregar al menu</button>
              </div>
              {obMenuItems.length > 0 && <div className="ob-item-list">{obMenuItems.map(item=>(
                <div key={item._key} className="ob-item-chip">
                  <div className="ob-item-chip-emoji">{item.image}</div>
                  <div className="ob-item-chip-info"><div className="ob-item-chip-name">{item.name}</div><div className="ob-item-chip-meta">{item.category}{item.description?" · "+item.description:""}</div></div>
                  <div className="ob-item-chip-price">Q{item.price.toFixed(2)}</div>
                  <button className="ob-item-chip-del" onClick={()=>obRemoveItem(item._key)}>quitar</button>
                </div>
              ))}</div>}
              {obMenuItems.length === 0 && <div className="ob-warning">Puedes continuar sin productos y agregarlos despues desde el dashboard.</div>}
            </>}
            {obStep === 2 && <>
              <div className="ob-review-section">
                <div className="ob-review-title">Restaurante</div>
                <div className="ob-review-row"><span className="ob-review-label">Nombre</span><span className="ob-review-val">{obRestForm.name}</span></div>
                <div className="ob-review-row"><span className="ob-review-label">Categoria</span><span className="ob-review-val">{obRestForm.category}</span></div>
                <div className="ob-review-row"><span className="ob-review-label">Telefono</span><span className="ob-review-val">{obRestForm.phone}</span></div>
                <div className="ob-review-row"><span className="ob-review-label">Correo</span><span className="ob-review-val">{obRestForm.email}</span></div>
              </div>
              <div className="ob-review-section">
                <div className="ob-review-title">Menu inicial</div>
                {obMenuItems.length === 0
                  ? <div style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.25)"}}>Sin productos — puedes agregarlos despues.</div>
                  : <>{obMenuItems.map(item=>(
                      <div key={item._key} style={{display:"flex",alignItems:"center",gap:8,fontSize:"0.84rem",color:"rgba(255,255,255,0.55)",marginTop:6}}>
                        <span>{item.image}</span><span style={{flex:1}}>{item.name}</span>
                        <span style={{color:"#52c49b",fontFamily:"Syne,sans-serif",fontWeight:700}}>Q{item.price.toFixed(2)}</span>
                      </div>
                    ))}</>
                }
              </div>
              {obErrors.submit && <div className="ob-submit-err">{obErrors.submit}</div>}
            </>}
          </div>
          <div className="ob-footer">
            {obStep > 0 && <button className="ob-btn-ghost" onClick={obBack}>Atras</button>}
            {obStep < 2
              ? <button className="ob-btn-primary" onClick={obNext}>Siguiente</button>
              : <button className="ob-btn-primary" onClick={obSubmit} disabled={obSaving}>{obSaving&&<span className="ob-spinner"/>}{obSaving?"Creando...":"Crear mi restaurante"}</button>
            }
          </div>
        </div>
      </div>
    </>
  );

  // ── DASHBOARD ──
  return (
    <>
      <style>{CSS}</style>
      <div className="rd-page">
        <aside className="rd-sidebar">
          <div className="rd-sidebar-logo">Click<span>Bite</span></div>
          <div className="rd-restaurant-info">
            <div className="rd-restaurant-card" onClick={openRestModal} title="Editar informacion del restaurante">
              <div className="rd-restaurant-emoji">🍽️</div>
              <div>
                <div className="rd-restaurant-name">{restName}</div>
                <div className="rd-restaurant-cat">{restCategory}</div>
                <div className="rd-restaurant-edit-hint">Editar info</div>
              </div>
            </div>
          </div>
          <div className="rd-nav-section">Menu</div>
          <button className="rd-nav-item active">🍽️ Mi Menu</button>
          <button className="rd-nav-item" onClick={() => navigate("/restaurant-orders")}>📋 Pedidos</button>
          <div className="rd-sidebar-bottom">
            <button className="rd-logout" onClick={() => { helpers.clearSession(); navigate("/"); }}>Cerrar sesion</button>
          </div>
        </aside>

        <div className="rd-main">
          <div className="rd-topbar">
            <div>
              <div className="rd-topbar-title">Gestion del menu</div>
              <div className="rd-topbar-sub">{items.length} productos · {items.filter(i=>!i.available).length} no disponibles</div>
            </div>
            <div className="rd-topbar-right">
              <div className="rd-search-wrap">
                <span className="rd-search-icon">🔍</span>
                <input className="rd-search" type="text" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <button className="rd-add-btn" onClick={openCreate}>+ Agregar producto</button>
            </div>
          </div>

          <div className="rd-content">
            {bestsellers.length > 0 && (
              <div className="rd-bs-section">
                <div className="rd-bs-header"><div className="rd-bs-title">Mas vendidos</div></div>
                <div className="rd-bs-list">
                  {bestsellers.map((b,i) => (
                    <div key={b.id} className={"rd-bs-item"+(i===0?" rd-bs-rank-1":i===1?" rd-bs-rank-2":i===2?" rd-bs-rank-3":"")}>
                      <div className="rd-bs-emoji">{b.image}</div>
                      <div className="rd-bs-name">{b.name}</div>
                      <div className="rd-bs-sold">{b.totalSold}</div>
                      <div className="rd-bs-sold-label">vendidos</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rd-filters">
              {["Todos","Popular",...availableCategories].map(c => (
                <button key={c} className={"rd-filter"+(filterCat===c?" active":"")} onClick={()=>{setFilterCat(c);clearSelection();}}>{c}</button>
              ))}
            </div>

            {/* Bulk action bar — visible only when items are selected */}
            {selected.size > 0 && (
              <div className="rd-bulk-bar">
                <span className="rd-bulk-count">{selected.size} seleccionado{selected.size !== 1 ? "s" : ""}</span>
                <div className="rd-bulk-sep"/>
                <div className="rd-bulk-actions">
                  {/* UpdateMany: marcar disponible */}
                  <button className="rd-bulk-btn rd-bulk-btn-green" onClick={() => bulkSetAvailable(true)}>Marcar disponibles</button>
                  {/* UpdateMany: marcar no disponible */}
                  <button className="rd-bulk-btn rd-bulk-btn-yellow" onClick={() => bulkSetAvailable(false)}>Marcar no disponibles</button>
                  {/* UpdateMany: cambiar categoria */}
                  <select className="rd-bulk-cat-select" value={bulkCatValue} onChange={e => setBulkCatValue(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button className="rd-bulk-btn rd-bulk-btn-cat" onClick={() => bulkSetCategory(bulkCatValue)}>Cambiar categoria</button>
                  {/* DeleteMany */}
                  <button className="rd-bulk-btn rd-bulk-btn-red" onClick={confirmBulkDelete}>Eliminar seleccionados</button>
                </div>
                <button className="rd-bulk-clear" onClick={clearSelection}>Limpiar</button>
              </div>
            )}

            <div className="rd-count">
              <strong>{filtered.length}</strong> producto{filtered.length !== 1?"s":""}
              {filterCat !== "Todos" && <> en <strong>{filterCat}</strong></>}
            </div>

            <div className="rd-table-wrap">
              {filtered.length === 0 ? (
                <div className="rd-empty">
                  <div className="rd-empty-icon">🍽️</div>
                  <p>No se encontraron productos.{items.length === 0 && " Agrega tu primer producto!"}</p>
                </div>
              ) : (
                <table className="rd-table">
                  <thead>
                    <tr>
                      <th className="th-check">
                        <div className={"rd-cb"+(allFilteredSelected?" checked":"")} onClick={toggleSelectAll}>
                          {allFilteredSelected && <span className="rd-cb-mark">v</span>}
                        </div>
                      </th>
                      <th>Producto</th><th>Categoria</th><th>Precio</th><th>Disponible</th><th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr key={item.id} className={selected.has(item.id)?"selected":""}>
                        <td className="td-check">
                          <div className={"rd-cb"+(selected.has(item.id)?" checked":"")} onClick={()=>toggleSelect(item.id)}>
                            {selected.has(item.id) && <span className="rd-cb-mark">v</span>}
                          </div>
                        </td>
                        <td>
                          <div className="rd-item-info">
                            <div className="rd-item-emoji">{item.image}</div>
                            <div><div className="rd-item-name">{item.name}</div><div className="rd-item-desc">{item.description}</div></div>
                          </div>
                        </td>
                        <td><span className="rd-cat-pill">{item.category}</span></td>
                        <td><span className="rd-price">Q{item.price.toFixed(2)}</span></td>
                        <td>
                          <button className="rd-avail-toggle" onClick={()=>toggleAvailableSingle(item.id)}>
                            <div className={"rd-switch "+(item.available?"on":"off")}><div className="rd-switch-knob"/></div>
                            <span className={"rd-avail-label "+(item.available?"on":"off")}>{item.available?"Disponible":"No disponible"}</span>
                          </button>
                        </td>
                        <td>
                          <div className="rd-actions">
                            <button className="rd-btn-edit" onClick={()=>openEdit(item)}>Editar</button>
                            <button className="rd-btn-del" onClick={()=>confirmSingleDelete(item)}>Eliminar</button>
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

        {/* Edit item modal */}
        {modalOpen && (
          <div className="rd-overlay" onClick={closeModal}>
            <div className="rd-modal" onClick={e=>e.stopPropagation()}>
              <div className="rd-modal-header">
                <div className="rd-modal-title">{editingItem?"Editar producto":"Agregar producto"}</div>
                <button className="rd-modal-close" onClick={closeModal}>x</button>
              </div>
              <div className="rd-modal-body">
                <div className="rd-field"><label>Icono</label>
                  <div className="rd-emoji-grid">{EMOJI_OPTIONS.map(e=><button key={e} className={"rd-emoji-opt"+(form.image===e?" selected":"")} onClick={()=>handleFormChange("image",e)}>{e}</button>)}</div>
                </div>
                <div className="rd-field"><label>Nombre</label><input type="text" placeholder="Ej. Hamburguesa Clasica" className={formErrors.name?"err":""} value={form.name} onChange={e=>handleFormChange("name",e.target.value)}/>{formErrors.name&&<span className="rd-field-error">{formErrors.name}</span>}</div>
                <div className="rd-field"><label>Descripcion</label><textarea rows={2} placeholder="Ingredientes..." className={formErrors.description?"err":""} value={form.description} onChange={e=>handleFormChange("description",e.target.value)}/>{formErrors.description&&<span className="rd-field-error">{formErrors.description}</span>}</div>
                <div className="rd-field-row">
                  <div className="rd-field"><label>Precio (Q)</label><input type="number" min="0" step="0.01" placeholder="0.00" className={formErrors.price?"err":""} value={form.price} onChange={e=>handleFormChange("price",e.target.value)}/>{formErrors.price&&<span className="rd-field-error">{formErrors.price}</span>}</div>
                  <div className="rd-field"><label>Categoria</label><select value={form.category} onChange={e=>handleFormChange("category",e.target.value)}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                <div className="rd-field"><label>Opciones</label>
                  <div className="rd-checkboxes">
                    <label className={"rd-checkbox"+(form.available?" checked":"")}><input type="checkbox" checked={form.available} onChange={e=>handleFormChange("available",e.target.checked)}/><div className="rd-checkbox-box">{form.available&&"v"}</div>Disponible</label>
                    <label className={"rd-checkbox"+(form.popular?" checked":"")}><input type="checkbox" checked={form.popular} onChange={e=>handleFormChange("popular",e.target.checked)}/><div className="rd-checkbox-box">{form.popular&&"v"}</div>Popular</label>
                  </div>
                </div>
                {formErrors.submit && <div className="rd-field-submit-error">{formErrors.submit}</div>}
              </div>
              <div className="rd-modal-footer">
                <button className="rd-modal-cancel" onClick={closeModal}>Cancelar</button>
                <button className="rd-modal-save" onClick={handleSaveItem} disabled={saving}>{saving&&<span className="rd-spinner"/>}{saving?"Guardando...":editingItem?"Guardar cambios":"Agregar al menu"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit restaurant modal */}
        {restModalOpen && (
          <div className="rd-overlay" onClick={()=>setRestModalOpen(false)}>
            <div className="rd-modal" onClick={e=>e.stopPropagation()}>
              <div className="rd-modal-header">
                <div className="rd-modal-title">Editar restaurante</div>
                <button className="rd-modal-close" onClick={()=>setRestModalOpen(false)}>x</button>
              </div>
              <div className="rd-modal-body">
                <div className="rd-field"><label>Nombre *</label><input type="text" className={restErrors.name?"err":""} value={restForm.name||""} onChange={e=>handleRestFormChange("name",e.target.value)}/>{restErrors.name&&<span className="rd-field-error">{restErrors.name}</span>}</div>
                <div className="rd-field"><label>Descripcion *</label><textarea rows={3} className={restErrors.description?"err":""} value={restForm.description||""} onChange={e=>handleRestFormChange("description",e.target.value)}/>{restErrors.description&&<span className="rd-field-error">{restErrors.description}</span>}</div>
                <div className="rd-field"><label>Categoria principal</label><select value={restForm.category||"Otros"} onChange={e=>handleRestFormChange("category",e.target.value)}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div className="rd-field-row">
                  <div className="rd-field"><label>Telefono *</label><input type="text" className={restErrors.phone?"err":""} value={restForm.phone||""} onChange={e=>handleRestFormChange("phone",e.target.value)}/>{restErrors.phone&&<span className="rd-field-error">{restErrors.phone}</span>}</div>
                  <div className="rd-field"><label>Correo *</label><input type="email" className={restErrors.email?"err":""} value={restForm.email||""} onChange={e=>handleRestFormChange("email",e.target.value)}/>{restErrors.email&&<span className="rd-field-error">{restErrors.email}</span>}</div>
                </div>
                {restErrors.submit && <div className="rd-field-submit-error">{restErrors.submit}</div>}
              </div>
              <div className="rd-modal-footer">
                <button className="rd-modal-cancel" onClick={()=>setRestModalOpen(false)}>Cancelar</button>
                <button className="rd-modal-save" onClick={handleSaveRest} disabled={restSaving}>{restSaving&&<span className="rd-spinner"/>}{restSaving?"Guardando...":"Guardar cambios"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm (single or bulk) */}
        {deleteTarget && (
          <div className="rd-overlay" onClick={()=>setDeleteTarget(null)}>
            <div className="rd-delete-modal" onClick={e=>e.stopPropagation()}>
              <div className="rd-delete-icon">🗑️</div>
              <h3>{deleteTarget.ids.length === 1 ? "Eliminar este producto?" : "Eliminar " + deleteTarget.ids.length + " productos?"}</h3>
              <p>Esta accion no se puede deshacer.</p>
              {deleteTarget.labels.length > 1 && (
                <div className="rd-delete-chip-list">
                  {deleteTarget.labels.map((label, i) => (
                    <div key={i} className="rd-delete-chip">{label}</div>
                  ))}
                </div>
              )}
              {deleteTarget.labels.length === 1 && (
                <p style={{color:"#fff",fontWeight:600,marginBottom:20}}>{deleteTarget.labels[0]}</p>
              )}
              <div className="rd-delete-actions">
                <button className="rd-delete-cancel" onClick={()=>setDeleteTarget(null)}>Cancelar</button>
                <button className="rd-delete-confirm" onClick={handleDelete}>Si, eliminar</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="rd-toast">{toast}</div>}
      </div>
    </>
  );
}
