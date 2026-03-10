import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuItems as menuItemsApi, restaurants as restaurantsApi, analytics, helpers, files as filesApi } from "../services/api";

const CATEGORIES = ["Burgers", "Sides", "Drinks", "Desserts", "Entradas", "Platos principales", "Bebidas", "Postres", "Otros"];
const EMOJI_OPTIONS = ["🍔","🥩","🍄","🌶️","🍟","🧅","🥗","🥤","🍋","🍫","🥧","🍕","🌮","🍜","🍣","🍛","🍗","🍝","🧁","☕"];
const EMPTY_ITEM = { name: "", description: "", price: "", category: "Platos principales", image: "🍔", available: true };
const EMPTY_FORM = { name: "", description: "", price: "", category: "Platos principales", image: "🍔", available: true, popular: false, imageFileId: null, imageMode: "emoji" };
const ONBOARD_STEPS = ["Tu restaurante", "Tu menu", "Confirmar"];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes popIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes toastIn{from{opacity:0;transform:translateY(12px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}

  /* -- Onboarding -- */
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

  /* -- Dashboard -- */
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
  /* TABS */
  .rd-tabs{display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.06);padding:0 36px;background:#111820}
  .rd-tab-btn{padding:14px 20px;background:transparent;border:none;border-bottom:2px solid transparent;color:rgba(255,255,255,0.35);font-family:'DM Sans',sans-serif;font-size:0.88rem;cursor:pointer;transition:all 0.2s;margin-bottom:-1px}
  .rd-tab-btn:hover{color:rgba(255,255,255,0.7)}
  .rd-tab-btn.active{color:#52c49b;border-bottom-color:#52c49b;font-weight:600}
  /* STATS PANEL */
  .rd-stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:28px}
  .rd-stat-card{background:#111820;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px}
  .rd-stat-label{font-size:0.73rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px}
  .rd-stat-value{font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:700;color:#52c49b}
  .rd-stat-sub{font-size:0.78rem;color:rgba(255,255,255,0.25);margin-top:4px}
  .rd-stats-section-title{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:#fff;margin-bottom:14px}
  .rd-stats-items-list{display:flex;flex-direction:column;gap:10px}
  .rd-stats-item-row{display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px}
  .rd-stats-item-rank{width:24px;height:24px;border-radius:50%;background:rgba(82,196,155,0.1);color:#52c49b;font-size:0.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .rd-stats-item-name{flex:1;font-size:0.88rem;color:#fff}
  .rd-stats-item-sold{font-size:0.82rem;color:#52c49b;font-weight:600;white-space:nowrap}
  .rd-stats-bar-wrap{width:100px;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;flex-shrink:0}
  .rd-stats-bar-fill{height:100%;background:linear-gradient(90deg,#52c49b,#1a7a58);border-radius:3px}
  .rd-stats-empty{text-align:center;padding:60px 20px;color:rgba(255,255,255,0.2);font-size:0.9rem}
  @media(max-width:720px){.rd-sidebar{display:none}.rd-content{padding:20px}.rd-topbar{padding:14px 20px}.rd-tabs{padding:0 20px}}

  /* Image upload in modal */
  .rd-img-mode-toggle{display:flex;gap:0;margin-bottom:12px;border:1px solid rgba(255,255,255,0.1);border-radius:9px;overflow:hidden}
  .rd-img-mode-btn{flex:1;padding:8px;background:transparent;border:none;color:rgba(255,255,255,0.4);font-family:'DM Sans',sans-serif;font-size:0.82rem;cursor:pointer;transition:all 0.18s}
  .rd-img-mode-btn.active{background:rgba(82,196,155,0.15);color:#52c49b;font-weight:600}
  .rd-img-upload-area{border:2px dashed rgba(255,255,255,0.1);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden}
  .rd-img-upload-area:hover{border-color:rgba(82,196,155,0.4);background:rgba(82,196,155,0.04)}
  .rd-img-upload-area.has-image{padding:0;border-style:solid;border-color:rgba(82,196,155,0.3)}
  .rd-img-preview{width:100%;height:160px;object-fit:cover;border-radius:10px;display:block}
  .rd-img-upload-icon{font-size:2rem;margin-bottom:8px}
  .rd-img-upload-text{font-size:0.83rem;color:rgba(255,255,255,0.35);margin-bottom:4px}
  .rd-img-upload-hint{font-size:0.73rem;color:rgba(255,255,255,0.2)}
  .rd-img-upload-input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
  .rd-img-uploading{display:flex;align-items:center;justify-content:center;gap:8px;padding:20px;color:rgba(82,196,155,0.7);font-size:0.85rem}
  .rd-img-change-btn{position:absolute;bottom:8px;right:8px;padding:5px 12px;background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:0.75rem;cursor:pointer}
  .rd-img-err{font-size:0.76rem;color:#e05c5c;margin-top:4px}
  .rd-table-img{width:40px;height:40px;border-radius:10px;object-fit:cover;flex-shrink:0}

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
  const [uploading,   setUploading]   = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null); // base64 preview URL
  const [activeTab,   setActiveTab]   = useState("menu"); // "menu" | "stats"
  const [salesStats,  setSalesStats]  = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

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

  // -- Load --
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
          id: t.menu_item_id ?? t._id, name: t.name ?? t.item_name ?? "-",
          image: "🍽️", totalSold: t.total_sold ?? t.totalSold ?? 0,
        })));
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // -- Helpers: selection --
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
  const selectAll       = () => setSelected(new Set(filtered.map(i => i.id)));

  const selectedItems = items.filter(i => selected.has(i.id));

  // -- Bulk actions --
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

  // -- Item CRUD --
  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormErrors({}); setUploadPreview(null); setModalOpen(true); };
  const openEdit   = (item) => { setEditingItem(item); setForm({ ...item, price: String(item.price), imageMode: item.imageFileId ? 'upload' : 'emoji' }); setFormErrors({}); setUploadPreview(item.imageFileId ? null : null); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); setUploadPreview(null); };

  const validateItem = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "El nombre es obligatorio";
    if (!form.description.trim()) e.description = "La descripcion es obligatoria";
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) e.price = "Precio invalido";
    return e;
  };

  // Handles file input change: shows local preview immediately,
  // uploads to GridFS, saves the returned file_id in form state.
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const result = await filesApi.upload(file);
      handleFormChange("imageFileId", result.file_id);
      handleFormChange("imageMode", "upload");
    } catch (err) {
      setFormErrors(prev => ({ ...prev, image: "Error subiendo imagen: " + err.message }));
      setUploadPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveItem = async () => {
    const e = validateItem();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setSaving(true);
    try {
      const imageFileId = form.imageMode === "upload" && form.imageFileId ? form.imageFileId : undefined;
      if (editingItem) {
        // UpdateOne via PUT /menu-items/:id
        const updatePayload = {
          name: form.name, description: form.description,
          price: parseFloat(form.price), category: form.category,
          is_available: form.available, stock: editingItem.stock ?? 99,
        };
        if (imageFileId) updatePayload.image_file_id = imageFileId;
        await menuItemsApi.update(editingItem.id, updatePayload);
        setItems(prev => prev.map(i => i.id === editingItem.id
          ? { ...i, ...form, price: parseFloat(form.price), imageFileId: imageFileId || i.imageFileId }
          : i));
        showToast("Producto actualizado");
      } else {
        const payload = helpers.toCreateMenuItemPayload(restaurant.id, { ...form });
        if (imageFileId) payload.image_file_id = imageFileId;
        const created = await menuItemsApi.create(payload);
        setItems(prev => [...prev, helpers.toMenuItem(created)]);
        showToast("Producto agregado al menu");
      }
      closeModal();
    } catch (err) { setFormErrors({ submit: err.message }); }
    finally { setSaving(false); }
  };

  // Fetch sales stats for this restaurant when stats tab is opened
  const fetchSalesStats = async () => {
    if (!restaurant?.id) return;
    setStatsLoading(true);
    try {
      const [salesData, topItemsData] = await Promise.all([
        analytics.getSalesByRestaurant(),
        analytics.getTopSellingItems(),
      ]);
      // Filter to this restaurant only
      const myStats = (salesData ?? []).find(s => s.restaurant_id === restaurant.id);
      // Filter top items to items in this restaurant
      const myItemIds = new Set(items.map(i => i.id));
      const myTopItems = (topItemsData ?? []).filter(i => myItemIds.has(i.menu_item_id)).slice(0, 6);
      setSalesStats({ totalSales: myStats?.total_sales ?? 0, topItems: myTopItems });
    } catch (e) {
      setSalesStats({ totalSales: 0, topItems: [] });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "stats" && !salesStats) fetchSalesStats();
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

  // -- Edit restaurant --
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
      // Run all PATCH operations in parallel using dot-notation endpoints
      const ops = [
        // Full update for name/description
        restaurantsApi.update(restaurant.id, { name: restForm.name, description: restForm.description }),
        // PATCH contact (dot notation - only touches contact.phone and contact.email)
        restaurantsApi.updateContact(restaurant.id, restForm.phone, restForm.email),
      ];
      // If category changed, add new one with $addToSet
      if (restForm.newCategory?.trim()) {
        ops.push(restaurantsApi.addCategory(restaurant.id, restForm.newCategory.trim()));
      }
      // If location coords provided, PATCH location
      if (restForm.lng && restForm.lat && !isNaN(parseFloat(restForm.lng)) && !isNaN(parseFloat(restForm.lat))) {
        ops.push(restaurantsApi.updateLocation(restaurant.id, parseFloat(restForm.lng), parseFloat(restForm.lat)));
      }
      await Promise.all(ops);
      setRestaurant(prev => ({
        ...prev,
        name: restForm.name,
        description: restForm.description,
        contact: { phone: restForm.phone, email: restForm.email },
      }));
      setRestModalOpen(false);
      showToast("Informacion del restaurante actualizada");
    } catch (err) { setRestErrors({ submit: err.message }); }
    finally { setRestSaving(false); }
  };

  const handleRemoveCategory = async (cat) => {
    if (!restaurant?.id) return;
    try {
      await restaurantsApi.removeCategory(restaurant.id, cat);
      setRestaurant(prev => ({ ...prev, categories: (prev.categories ?? []).filter(c => c !== cat) }));
      showToast("Categoria eliminada");
    } catch (err) { showToast("Error: " + err.message); }
  };

  const handleRestFormChange = (field, value) => {
    setRestForm(prev => ({ ...prev, [field]: value }));
    if (restErrors[field]) setRestErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // -- Onboarding --
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

  // -- Loading / error screens --
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
  const restCategory = restaurant?.categories?.[0] ?? "-";
  // -- ONBOARDING --
  if (onboarding) return (
    <div style={{minHeight:"100vh",background:"#0f1117",fontFamily:"'DM Sans',sans-serif",color:"#e8eaf0",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0f1117}
        .ob-wrap{width:100%;max-width:560px;padding:24px}
        .ob-logo{font-family:'DM Mono',monospace;font-size:0.9rem;color:#52c49b;margin-bottom:32px}
        .ob-logo span{color:#e8eaf0}
        .ob-card{background:#131720;border:1px solid #1e2230;border-radius:8px;overflow:hidden}
        .ob-card-head{padding:20px 24px;border-bottom:1px solid #1e2230;display:flex;align-items:center;justify-content:space-between}
        .ob-title{font-size:1rem;font-weight:500}
        .ob-steps{display:flex;gap:6px}
        .ob-step{width:24px;height:4px;border-radius:2px;background:#1e2230}
        .ob-step.done{background:#52c49b}
        .ob-step.active{background:#52c49b88}
        .ob-body{padding:24px}
        .ob-sub{font-size:0.82rem;color:#4a5068;margin-bottom:20px}
        .ob-field{margin-bottom:14px}
        .ob-label{display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;color:#3d4255;margin-bottom:5px}
        .ob-input{width:100%;padding:9px 12px;background:#1a1e2e;border:1px solid #1e2230;border-radius:5px;color:#e8eaf0;font-family:'DM Sans',sans-serif;font-size:0.88rem;outline:none}
        .ob-input:focus{border-color:#52c49b}
        .ob-input.err{border-color:#e05555}
        .ob-error{font-size:0.73rem;color:#e05555;margin-top:3px}
        .ob-select{width:100%;padding:9px 12px;background:#1a1e2e;border:1px solid #1e2230;border-radius:5px;color:#e8eaf0;font-family:'DM Sans',sans-serif;font-size:0.88rem;outline:none}
        .ob-item-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #1a1e2e}
        .ob-item-name{flex:1;font-size:0.83rem;color:#c8ccd8}
        .ob-item-price{font-family:'DM Mono',monospace;font-size:0.8rem;color:#52c49b}
        .ob-item-del{background:none;border:none;color:#3d4255;cursor:pointer;font-size:1rem;padding:0 4px}
        .ob-item-del:hover{color:#e05555}
        .ob-empty-items{font-size:0.78rem;color:#3d4255;padding:8px 0}
        .ob-warning{font-size:0.75rem;color:#4a5068;margin-top:8px;padding:8px 10px;background:#1a1e2e;border-radius:4px}
        .ob-review-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a1e2e;font-size:0.83rem}
        .ob-review-label{color:#4a5068}
        .ob-review-val{color:#e8eaf0;font-weight:500}
        .ob-footer{padding:16px 24px;border-top:1px solid #1e2230;display:flex;justify-content:space-between;gap:10px}
        .ob-btn{padding:9px 20px;border-radius:5px;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:500;cursor:pointer;border:1px solid #1e2230;background:transparent;color:#4a5068}
        .ob-btn:hover{color:#e8eaf0;border-color:#2a3040}
        .ob-btn-primary{background:#52c49b;border-color:#52c49b;color:#0a0e14}
        .ob-btn-primary:hover{background:#60d4a8;border-color:#60d4a8}
        .ob-btn-primary:disabled{opacity:0.5;cursor:not-allowed}
        .ob-submit-err{font-size:0.75rem;color:#e05555;margin-top:6px}
      `}</style>
      <div className="ob-wrap">
        <div className="ob-logo">Click<span>Bite</span></div>
        <div className="ob-card">
          <div className="ob-card-head">
            <span className="ob-title">
              {obStep===0 && "Tu restaurante"}
              {obStep===1 && "Menu inicial"}
              {obStep===2 && "Confirmar"}
            </span>
            <div className="ob-steps">
              {[0,1,2].map(s => <div key={s} className={"ob-step"+(s<obStep?" done":s===obStep?" active":"")}/>)}
            </div>
          </div>
          <div className="ob-body">
            <div className="ob-sub">
              {obStep===0 && "Informacion de tu negocio"}
              {obStep===1 && "Agrega productos a tu menu"}
              {obStep===2 && "Revisa y confirma"}
            </div>

            {obStep===0 && (
              <>
                <div className="ob-field"><label className="ob-label">Nombre *</label><input className={"ob-input"+(obErrors.name?" err":"")} value={obRestForm.name} onChange={e=>obHandleRestChange("name",e.target.value)} placeholder="Nombre del restaurante"/>{obErrors.name&&<div className="ob-error">{obErrors.name}</div>}</div>
                <div className="ob-field"><label className="ob-label">Descripcion *</label><textarea className={"ob-input"+(obErrors.description?" err":"")} rows={3} value={obRestForm.description} onChange={e=>obHandleRestChange("description",e.target.value)} placeholder="Describe tu restaurante"/>{obErrors.description&&<div className="ob-error">{obErrors.description}</div>}</div>
                <div className="ob-field"><label className="ob-label">Categoria</label><select className="ob-select" value={obRestForm.category} onChange={e=>obHandleRestChange("category",e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                <div style={{display:"flex",gap:10}}>
                  <div className="ob-field" style={{flex:1}}><label className="ob-label">Telefono *</label><input className={"ob-input"+(obErrors.phone?" err":"")} value={obRestForm.phone} onChange={e=>obHandleRestChange("phone",e.target.value)} placeholder="+502 1234-5678"/>{obErrors.phone&&<div className="ob-error">{obErrors.phone}</div>}</div>
                  <div className="ob-field" style={{flex:1}}><label className="ob-label">Correo *</label><input className={"ob-input"+(obErrors.email?" err":"")} type="email" value={obRestForm.email} onChange={e=>obHandleRestChange("email",e.target.value)} placeholder="correo@restaurante.com"/>{obErrors.email&&<div className="ob-error">{obErrors.email}</div>}</div>
                </div>
              </>
            )}

            {obStep===1 && (
              <>
                <div style={{display:"flex",gap:10,marginBottom:10}}>
                  <input className="ob-input" style={{flex:2}} placeholder="Nombre del producto" value={obItemForm.name} onChange={e=>obHandleItemChange("name",e.target.value)}/>
                  <input className="ob-input" style={{flex:1}} placeholder="Precio (Q)" type="number" value={obItemForm.price} onChange={e=>obHandleItemChange("price",e.target.value)}/>
                  <button className="ob-btn ob-btn-primary" onClick={obAddItem} style={{padding:"9px 14px"}}>+</button>
                </div>
                {obErrors.item_name && <div className="ob-error">{obErrors.item_name}</div>}
                {obErrors.item_price && <div className="ob-error">{obErrors.item_price}</div>}
                {obMenuItems.length === 0
                  ? <div className="ob-empty-items">Sin productos todavia</div>
                  : obMenuItems.map(item => (
                    <div key={item._key} className="ob-item-row">
                      <span className="ob-item-name">{item.name}</span>
                      <span className="ob-item-price">Q{parseFloat(item.price).toFixed(2)}</span>
                      <button className="ob-item-del" onClick={()=>obRemoveItem(item._key)}>x</button>
                    </div>
                  ))
                }
                <div className="ob-warning">Puedes agregar mas productos desde el dashboard despues.</div>
              </>
            )}

            {obStep===2 && (
              <>
                {[
                  ["Nombre",      obRestForm.name],
                  ["Descripcion", obRestForm.description],
                  ["Categoria",   obRestForm.category],
                  ["Telefono",    obRestForm.phone],
                  ["Correo",      obRestForm.email],
                  ["Productos",   obMenuItems.length + " en el menu"],
                ].map(([k,v]) => (
                  <div key={k} className="ob-review-row">
                    <span className="ob-review-label">{k}</span>
                    <span className="ob-review-val">{v}</span>
                  </div>
                ))}
                {obErrors.submit && <div className="ob-submit-err">{obErrors.submit}</div>}
              </>
            )}
          </div>
          <div className="ob-footer">
            <button className="ob-btn" onClick={obBack} disabled={obStep===0}>{obStep===0?"":"Atras"}</button>
            {obStep < 2
              ? <button className="ob-btn ob-btn-primary" onClick={obNext}>Siguiente</button>
              : <button className="ob-btn ob-btn-primary" onClick={obSubmit} disabled={obSaving}>{obSaving?"Creando...":"Crear restaurante"}</button>
            }
          </div>
        </div>
      </div>
    </div>
  );

  // -- DASHBOARD --
  return (
    <div style={{minHeight:"100vh",background:"#0f1117",fontFamily:"'DM Sans',sans-serif",color:"#e8eaf0",display:"flex"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0f1117}

        /* SIDEBAR */
        .rd-sidebar{width:220px;flex-shrink:0;background:#0d1017;border-right:1px solid #1e2230;display:flex;flex-direction:column;padding:20px 0}
        .rd-sidebar-logo{font-family:'DM Mono',monospace;font-size:0.88rem;color:#52c49b;padding:0 20px;margin-bottom:24px}
        .rd-sidebar-logo span{color:#e8eaf0}
        .rd-rest-card{margin:0 12px 20px;padding:12px;background:#131720;border:1px solid #1e2230;border-radius:6px;cursor:pointer}
        .rd-rest-card:hover{border-color:#2a3040}
        .rd-rest-name{font-size:0.88rem;font-weight:500;color:#e8eaf0;margin-bottom:2px}
        .rd-rest-cat{font-size:0.72rem;color:#3d4255}
        .rd-nav-label{font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;color:#3d4255;padding:0 20px;margin-bottom:6px}
        .rd-nav-item{display:flex;align-items:center;gap:8px;padding:8px 20px;font-size:0.85rem;color:#4a5068;cursor:pointer;border-left:2px solid transparent}
        .rd-nav-item:hover{color:#c8ccd8;background:#131720}
        .rd-nav-item.active{color:#52c49b;border-left-color:#52c49b;background:#52c49b08}
        .rd-sidebar-spacer{flex:1}
        .rd-logout{padding:8px 20px;font-size:0.82rem;color:#3d4255;cursor:pointer}
        .rd-logout:hover{color:#e05555}

        /* MAIN */
        .rd-main{flex:1;display:flex;flex-direction:column;min-width:0}
        .rd-topbar{height:52px;display:flex;align-items:center;gap:12px;padding:0 24px;border-bottom:1px solid #1e2230;background:#0f1117;position:sticky;top:0;z-index:50}
        .rd-topbar-title{font-size:0.95rem;font-weight:500;flex:1}
        .rd-topbar-sub{font-size:0.78rem;color:#3d4255}
        .rd-search{padding:7px 12px;background:#1a1e2e;border:1px solid #1e2230;border-radius:5px;color:#e8eaf0;font-family:'DM Sans',sans-serif;font-size:0.83rem;outline:none;width:200px}
        .rd-search:focus{border-color:#52c49b}
        .rd-search::placeholder{color:#3d4255}
        .rd-add-btn{padding:7px 14px;background:#52c49b;border:none;border-radius:5px;color:#0a0e14;font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:600;cursor:pointer;white-space:nowrap}
        .rd-add-btn:hover{background:#60d4a8}

        /* TABS */
        .rd-tabs{display:flex;border-bottom:1px solid #1e2230;padding:0 24px}
        .rd-tab{padding:11px 16px;background:transparent;border:none;border-bottom:2px solid transparent;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.85rem;cursor:pointer;margin-bottom:-1px}
        .rd-tab:hover{color:#c8ccd8}
        .rd-tab.active{color:#52c49b;border-bottom-color:#52c49b}

        /* CONTENT */
        .rd-content{padding:24px;flex:1}

        /* STATS */
        .rd-stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:24px}
        .rd-stat-card{background:#131720;border:1px solid #1e2230;border-radius:6px;padding:16px}
        .rd-stat-label{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:#3d4255;margin-bottom:6px}
        .rd-stat-value{font-family:'DM Mono',monospace;font-size:1.5rem;font-weight:500;color:#52c49b}
        .rd-stat-sub{font-size:0.72rem;color:#3d4255;margin-top:3px}
        .rd-stats-section-title{font-size:0.88rem;font-weight:500;color:#e8eaf0;margin-bottom:12px}
        .rd-stats-item-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #1a1e2e}
        .rd-stats-item-row:last-child{border-bottom:none}
        .rd-stats-item-rank{width:20px;font-family:'DM Mono',monospace;font-size:0.72rem;color:#3d4255;text-align:right;flex-shrink:0}
        .rd-stats-item-name{flex:1;font-size:0.85rem;color:#c8ccd8}
        .rd-stats-bar-wrap{width:80px;height:3px;background:#1e2230;border-radius:2px;flex-shrink:0}
        .rd-stats-bar-fill{height:100%;background:#52c49b;border-radius:2px}
        .rd-stats-item-sold{font-family:'DM Mono',monospace;font-size:0.75rem;color:#3d4255;white-space:nowrap}
        .rd-stats-empty{padding:40px;text-align:center;color:#3d4255;font-size:0.85rem}

        /* BESTSELLERS */
        .rd-bs-section{margin-bottom:20px}
        .rd-bs-title{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:#3d4255;margin-bottom:10px}
        .rd-bs-list{display:flex;gap:8px;flex-wrap:wrap}
        .rd-bs-item{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#131720;border:1px solid #1e2230;border-radius:5px;font-size:0.82rem}
        .rd-bs-rank-1{border-color:#52c49b44}
        .rd-bs-emoji{font-size:1.1rem}
        .rd-bs-name{color:#c8ccd8}
        .rd-bs-sold{font-family:'DM Mono',monospace;color:#52c49b;margin-left:4px}

        /* TABLE */
        .rd-table-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
        .rd-filter-pill{padding:4px 10px;background:transparent;border:1px solid #1e2230;border-radius:4px;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.75rem;cursor:pointer}
        .rd-filter-pill:hover{border-color:#2a3040;color:#c8ccd8}
        .rd-filter-pill.active{background:#52c49b1a;border-color:#52c49b44;color:#52c49b}
        .rd-count{margin-left:auto;font-size:0.75rem;color:#3d4255}
        .rd-table-wrap{background:#131720;border:1px solid #1e2230;border-radius:6px;overflow:hidden}
        .rd-table{width:100%;border-collapse:collapse}
        .rd-table th{padding:10px 14px;text-align:left;font-size:0.68rem;font-weight:600;color:#3d4255;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #1e2230;background:#0d1017;white-space:nowrap}
        .rd-table th.th-check{width:36px;padding:10px 12px}
        .rd-table td{padding:11px 14px;font-size:0.83rem;border-bottom:1px solid #1a1e2e;vertical-align:middle}
        .rd-table td.td-check{padding:11px 12px;width:36px}
        .rd-table tr:last-child td{border-bottom:none}
        .rd-table tr:hover td{background:#0d1017}
        .rd-table tr.selected td{background:#52c49b06}
        .rd-checkbox-custom{width:15px;height:15px;border:1px solid #1e2230;border-radius:3px;background:#1a1e2e;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:#52c49b}
        .rd-checkbox-custom.checked{background:#52c49b1a;border-color:#52c49b44}
        .rd-item-cell{display:flex;align-items:center;gap:10px}
        .rd-table-emoji{width:34px;height:34px;background:#1a1e2e;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
        .rd-table-img{width:34px;height:34px;border-radius:5px;object-fit:cover;flex-shrink:0}
        .rd-item-name{font-weight:500;color:#e8eaf0;font-size:0.85rem}
        .rd-item-desc{font-size:0.72rem;color:#3d4255;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
        .rd-price{font-family:'DM Mono',monospace;font-size:0.83rem;color:#52c49b}
        .rd-badge{padding:2px 8px;border-radius:3px;font-size:0.68rem;font-weight:500;letter-spacing:0.04em}
        .rd-badge-avail{background:#52c49b1a;color:#52c49b}
        .rd-badge-na{background:#1e2230;color:#3d4255}
        .rd-badge-pop{background:#f59e0b1a;color:#f59e0b}
        .rd-actions{display:flex;gap:6px}
        .rd-btn-edit{padding:4px 10px;background:transparent;border:1px solid #1e2230;border-radius:4px;color:#4a5068;font-size:0.75rem;cursor:pointer}
        .rd-btn-edit:hover{border-color:#52c49b44;color:#52c49b}
        .rd-btn-del{padding:4px 10px;background:transparent;border:1px solid #1e2230;border-radius:4px;color:#4a5068;font-size:0.75rem;cursor:pointer}
        .rd-btn-del:hover{border-color:#e0555544;color:#e05555}
        .rd-empty{padding:60px 20px;text-align:center;color:#3d4255;font-size:0.85rem}

        /* BULK BAR */
        .rd-bulk-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#131720;border:1px solid #52c49b22;border-radius:5px;margin-bottom:10px;flex-wrap:wrap}
        .rd-bulk-count{font-size:0.78rem;color:#52c49b;font-family:'DM Mono',monospace;white-space:nowrap}
        .rd-bulk-sep{width:1px;height:16px;background:#1e2230;flex-shrink:0}
        .rd-bulk-actions{display:flex;gap:6px;flex-wrap:wrap;flex:1}
        .rd-bulk-btn{padding:4px 10px;border-radius:4px;border:1px solid #1e2230;background:transparent;font-family:'DM Sans',sans-serif;font-size:0.75rem;cursor:pointer;color:#4a5068}
        .rd-bulk-btn:hover{color:#e8eaf0;border-color:#2a3040}
        .rd-bulk-btn-green:hover{border-color:#52c49b44;color:#52c49b}
        .rd-bulk-btn-red:hover{border-color:#e0555544;color:#e05555}
        .rd-bulk-cat-select{padding:4px 8px;background:#1a1e2e;border:1px solid #1e2230;border-radius:4px;color:#c8ccd8;font-family:'DM Sans',sans-serif;font-size:0.75rem;outline:none}
        .rd-bulk-clear{padding:4px 10px;border-radius:4px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:0.75rem;cursor:pointer;color:#3d4255}
        .rd-bulk-clear:hover{color:#e8eaf0}

        /* MODAL */
        .rd-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px}
        .rd-modal{background:#131720;border:1px solid #1e2230;border-radius:8px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto}
        .rd-modal-header{padding:16px 20px;border-bottom:1px solid #1e2230;display:flex;align-items:center;justify-content:space-between}
        .rd-modal-title{font-size:0.95rem;font-weight:500}
        .rd-modal-close{background:transparent;border:1px solid #1e2230;border-radius:4px;color:#4a5068;width:26px;height:26px;cursor:pointer;font-size:0.9rem}
        .rd-modal-close:hover{color:#e8eaf0}
        .rd-modal-body{padding:20px}
        .rd-field{margin-bottom:14px}
        .rd-field label{display:block;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#3d4255;margin-bottom:5px}
        .rd-field input,.rd-field textarea,.rd-field select{width:100%;padding:9px 12px;background:#1a1e2e;border:1px solid #1e2230;border-radius:5px;color:#e8eaf0;font-family:'DM Sans',sans-serif;font-size:0.88rem;outline:none}
        .rd-field input:focus,.rd-field textarea:focus,.rd-field select:focus{border-color:#52c49b}
        .rd-field input.err,.rd-field textarea.err{border-color:#e05555}
        .rd-field-error{font-size:0.72rem;color:#e05555;margin-top:3px;display:block}
        .rd-field-row{display:flex;gap:10px}
        .rd-field-row .rd-field{flex:1}
        .rd-field-submit-error{font-size:0.75rem;color:#e05555;margin-top:8px}
        .rd-modal-footer{padding:14px 20px;border-top:1px solid #1e2230;display:flex;justify-content:flex-end;gap:8px}
        .rd-modal-cancel{padding:8px 16px;background:transparent;border:1px solid #1e2230;border-radius:5px;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.85rem;cursor:pointer}
        .rd-modal-cancel:hover{color:#e8eaf0;border-color:#2a3040}
        .rd-modal-save{padding:8px 18px;background:#52c49b;border:none;border-radius:5px;color:#0a0e14;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px}
        .rd-modal-save:hover{background:#60d4a8}
        .rd-modal-save:disabled{opacity:0.5;cursor:not-allowed}
        .rd-spinner{width:12px;height:12px;border:2px solid rgba(10,14,20,0.3);border-top-color:#0a0e14;border-radius:50%;animation:spin 0.6s linear infinite;display:inline-block}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* CHECKBOXES */
        .rd-checkboxes{display:flex;gap:16px;flex-wrap:wrap}
        .rd-checkbox{display:flex;align-items:center;gap:7px;cursor:pointer;font-size:0.83rem;color:#4a5068}
        .rd-checkbox.checked{color:#e8eaf0}
        .rd-checkbox-box{width:16px;height:16px;border:1px solid #1e2230;border-radius:3px;background:#1a1e2e;display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#52c49b;flex-shrink:0}
        .rd-checkbox.checked .rd-checkbox-box{background:#52c49b1a;border-color:#52c49b44}

        /* IMAGE UPLOAD */
        .rd-img-mode-toggle{display:flex;background:#1a1e2e;border:1px solid #1e2230;border-radius:5px;padding:3px;margin-bottom:10px}
        .rd-img-mode-btn{flex:1;padding:6px;border:none;border-radius:3px;background:transparent;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.78rem;cursor:pointer}
        .rd-img-mode-btn.active{background:#52c49b1a;color:#52c49b}
        .rd-img-upload-area{border:1px dashed #1e2230;border-radius:5px;padding:20px;text-align:center;cursor:pointer;position:relative;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#3d4255;font-size:0.8rem}
        .rd-img-upload-area:hover{border-color:#2a3040}
        .rd-img-upload-area.has-image{padding:8px}
        .rd-img-preview{width:100%;max-height:120px;object-fit:cover;border-radius:4px}
        .rd-img-change-btn{font-size:0.72rem;color:#52c49b;cursor:pointer;margin-top:4px}
        .rd-img-upload-input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
        .rd-img-uploading{display:flex;align-items:center;gap:8px;color:#3d4255;font-size:0.8rem}
        .rd-img-err{font-size:0.72rem;color:#e05555;margin-top:3px}
        .rd-emoji-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;max-height:120px;overflow-y:auto}
        .rd-emoji-opt{padding:6px;background:transparent;border:1px solid transparent;border-radius:4px;cursor:pointer;font-size:1.2rem;text-align:center}
        .rd-emoji-opt:hover{background:#1a1e2e}
        .rd-emoji-opt.selected{background:#52c49b1a;border-color:#52c49b44}

        /* DELETE MODAL */
        .rd-delete-modal{background:#131720;border:1px solid #1e2230;border-radius:8px;padding:24px;width:100%;max-width:380px}
        .rd-delete-title{font-size:0.95rem;font-weight:500;color:#e8eaf0;margin-bottom:6px}
        .rd-delete-sub{font-size:0.82rem;color:#4a5068;margin-bottom:16px;line-height:1.4}
        .rd-delete-chip-list{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
        .rd-delete-chip{padding:3px 10px;background:#1a1e2e;border:1px solid #1e2230;border-radius:3px;font-size:0.78rem;color:#c8ccd8}
        .rd-delete-actions{display:flex;justify-content:flex-end;gap:8px}
        .rd-delete-cancel{padding:7px 16px;background:transparent;border:1px solid #1e2230;border-radius:4px;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.82rem;cursor:pointer}
        .rd-delete-cancel:hover{color:#e8eaf0}
        .rd-delete-confirm{padding:7px 16px;background:#e05555;border:none;border-radius:4px;color:#fff;font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:600;cursor:pointer}
        .rd-delete-confirm:hover{background:#e86666}

        /* TOAST */
        .rd-toast{position:fixed;bottom:20px;right:20px;padding:10px 16px;background:#131720;border:1px solid #52c49b44;border-radius:5px;font-size:0.82rem;color:#52c49b;z-index:999}

        @media(max-width:720px){.rd-sidebar{display:none}.rd-content{padding:16px}.rd-topbar{padding:0 16px}}
      `}</style>

      {/* SIDEBAR */}
      <aside className="rd-sidebar">
        <div className="rd-sidebar-logo">Click<span>Bite</span></div>
        <div className="rd-rest-card" onClick={openRestModal}>
          <div className="rd-rest-name">{restName}</div>
          <div className="rd-rest-cat">{restCategory} - Editar</div>
        </div>
        <div className="rd-nav-label">Menu</div>
        <div className="rd-nav-item active">Productos</div>
        <div className="rd-sidebar-spacer"/>
        <div className="rd-logout" onClick={()=>{helpers.clearSession();navigate("/")}}>Cerrar sesion</div>
      </aside>

      {/* MAIN */}
      <div className="rd-main">
        {/* TOPBAR */}
        <div className="rd-topbar">
          <span className="rd-topbar-title">
            {activeTab==="menu" ? "Gestion del menu" : "Estadisticas"}
          </span>
          <span className="rd-topbar-sub">
            {activeTab==="menu" ? items.length+" productos" : restaurant?.name}
          </span>
          {activeTab==="menu" && (
            <>
              <input className="rd-search" type="text" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
              <button className="rd-add-btn" onClick={openCreate}>+ Agregar</button>
            </>
          )}
        </div>

        {/* TABS */}
        <div className="rd-tabs">
          <button className={"rd-tab"+(activeTab==="menu"?" active":"")} onClick={()=>handleTabChange("menu")}>Menu</button>
          <button className={"rd-tab"+(activeTab==="stats"?" active":"")} onClick={()=>handleTabChange("stats")}>Estadisticas</button>
        </div>

        {/* STATS TAB */}
        {activeTab==="stats" && (
          <div className="rd-content">
            {statsLoading ? (
              <div className="rd-stats-empty">Cargando...</div>
            ) : salesStats ? (
              <>
                <div className="rd-stats-grid">
                  <div className="rd-stat-card">
                    <div className="rd-stat-label">Ventas totales</div>
                    <div className="rd-stat-value">Q{salesStats.totalSales.toLocaleString()}</div>
                    <div className="rd-stat-sub">Ordenes entregadas</div>
                  </div>
                  <div className="rd-stat-card">
                    <div className="rd-stat-label">Productos</div>
                    <div className="rd-stat-value">{items.length}</div>
                    <div className="rd-stat-sub">{items.filter(i=>i.available).length} disponibles</div>
                  </div>
                  <div className="rd-stat-card">
                    <div className="rd-stat-label">Calificacion</div>
                    <div className="rd-stat-value">{restaurant?.avg_rating ? Number(restaurant.avg_rating).toFixed(1) : "-"}</div>
                    <div className="rd-stat-sub">{restaurant?.total_reviews ?? 0} resenas</div>
                  </div>
                </div>
                {salesStats.topItems.length > 0 && (
                  <>
                    <div className="rd-stats-section-title">Productos mas vendidos</div>
                    {salesStats.topItems.map((item, i) => {
                      const maxSold = salesStats.topItems[0]?.total_sold || 1;
                      const pct = Math.round((item.total_sold / maxSold) * 100);
                      return (
                        <div key={item.menu_item_id} className="rd-stats-item-row">
                          <span className="rd-stats-item-rank">#{i+1}</span>
                          <span className="rd-stats-item-name">{item.name}</span>
                          <div className="rd-stats-bar-wrap"><div className="rd-stats-bar-fill" style={{width:pct+"%"}}/></div>
                          <span className="rd-stats-item-sold">{item.total_sold.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            ) : (
              <div className="rd-stats-empty">No se pudieron cargar las estadisticas.</div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab==="menu" && (
          <div className="rd-content">
            {bestsellers.length > 0 && (
              <div className="rd-bs-section">
                <div className="rd-bs-title">Mas vendidos</div>
                <div className="rd-bs-list">
                  {bestsellers.map((b,i) => (
                    <div key={b.id} className={"rd-bs-item"+(i===0?" rd-bs-rank-1":"")}>
                      <span className="rd-bs-emoji">{b.image}</span>
                      <span className="rd-bs-name">{b.name}</span>
                      <span className="rd-bs-sold">{b.totalSold}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.size > 0 && (
              <div className="rd-bulk-bar">
                <span className="rd-bulk-count">{selected.size} sel.</span>
                <div className="rd-bulk-sep"/>
                <div className="rd-bulk-actions">
                  <button className="rd-bulk-btn rd-bulk-btn-green" onClick={()=>bulkSetAvailable(true)}>Disponible</button>
                  <button className="rd-bulk-btn" onClick={()=>bulkSetAvailable(false)}>No disponible</button>
                  <select className="rd-bulk-cat-select" value={bulkCatValue} onChange={e=>setBulkCatValue(e.target.value)}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <button className="rd-bulk-btn" onClick={()=>bulkSetCategory(bulkCatValue)}>Cat.</button>
                  <button className="rd-bulk-btn rd-bulk-btn-red" onClick={confirmBulkDelete}>Eliminar</button>
                </div>
                <button className="rd-bulk-clear" onClick={clearSelection}>x</button>
              </div>
            )}

            <div className="rd-table-filters">
              {["Todos",...CATEGORIES].map(c => (
                <button key={c} className={"rd-filter-pill"+(filterCat===c?" active":"")} onClick={()=>setFilterCat(c)}>{c}</button>
              ))}
              <span className="rd-count">{filtered.length} producto{filtered.length!==1?"s":""}</span>
            </div>

            <div className="rd-table-wrap">
              {filtered.length===0 ? (
                <div className="rd-empty">No hay productos{filterCat!=="Todos" ? " en "+filterCat : ""}.</div>
              ) : (
                <table className="rd-table">
                  <thead>
                    <tr>
                      <th className="th-check">
                        <div className={"rd-checkbox-custom"+(selected.size===filtered.length&&filtered.length>0?" checked":"")} onClick={()=>selected.size===filtered.length?clearSelection():selectAll()}>
                          {selected.size===filtered.length&&filtered.length>0?"v":""}
                        </div>
                      </th>
                      <th>Producto</th><th>Categoria</th><th>Precio</th><th>Estado</th><th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr key={item.id} className={selected.has(item.id)?"selected":""}>
                        <td className="td-check">
                          <div className={"rd-checkbox-custom"+(selected.has(item.id)?" checked":"")} onClick={()=>toggleSelect(item.id)}>
                            {selected.has(item.id)?"v":""}
                          </div>
                        </td>
                        <td>
                          <div className="rd-item-cell">
                            {item.imageFileId
                              ? <img className="rd-table-img" src={filesApi.getUrl(item.imageFileId)} alt={item.name}/>
                              : <div className="rd-table-emoji">{item.image}</div>
                            }
                            <div>
                              <div className="rd-item-name">{item.name}</div>
                              <div className="rd-item-desc">{item.description}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{color:"#4a5068",fontSize:"0.8rem"}}>{item.category}</td>
                        <td><span className="rd-price">Q{item.price.toFixed(2)}</span></td>
                        <td>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                            <span className={"rd-badge "+(item.available?"rd-badge-avail":"rd-badge-na")}>{item.available?"Disponible":"No disponible"}</span>
                            {item.popular && <span className="rd-badge rd-badge-pop">Popular</span>}
                          </div>
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
        )}

        {/* EDIT ITEM MODAL */}
        {modalOpen && (
          <div className="rd-overlay" onClick={closeModal}>
            <div className="rd-modal" onClick={e=>e.stopPropagation()}>
              <div className="rd-modal-header">
                <span className="rd-modal-title">{editingItem?"Editar producto":"Nuevo producto"}</span>
                <button className="rd-modal-close" onClick={closeModal}>x</button>
              </div>
              <div className="rd-modal-body">
                <div className="rd-field">
                  <label>Imagen</label>
                  <div className="rd-img-mode-toggle">
                    <button className={"rd-img-mode-btn"+(form.imageMode==="upload"?" active":"")} onClick={()=>handleFormChange("imageMode","upload")}>Subir imagen</button>
                    <button className={"rd-img-mode-btn"+(form.imageMode==="emoji"?" active":"")} onClick={()=>handleFormChange("imageMode","emoji")}>Emoji</button>
                  </div>
                  {form.imageMode==="upload" && (
                    <div className={"rd-img-upload-area"+(uploadPreview||form.imageFileId?" has-image":"")}>
                      {uploading ? (
                        <div className="rd-img-uploading"><div className="rd-spinner"/>Subiendo...</div>
                      ) : uploadPreview ? (
                        <><img className="rd-img-preview" src={uploadPreview} alt="preview"/><div className="rd-img-change-btn">Cambiar</div><input type="file" accept="image/*" className="rd-img-upload-input" onChange={handleImageUpload}/></>
                      ) : form.imageFileId ? (
                        <><img className="rd-img-preview" src={filesApi.getUrl(form.imageFileId)} alt="preview"/><div className="rd-img-change-btn">Cambiar</div><input type="file" accept="image/*" className="rd-img-upload-input" onChange={handleImageUpload}/></>
                      ) : (
                        <><div>Arrastra o haz click</div><input type="file" accept="image/*" className="rd-img-upload-input" onChange={handleImageUpload}/></>
                      )}
                      {formErrors.image && <div className="rd-img-err">{formErrors.image}</div>}
                    </div>
                  )}
                  {form.imageMode==="emoji" && (
                    <div className="rd-emoji-grid">
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} className={"rd-emoji-opt"+(form.image===e?" selected":"")} onClick={()=>handleFormChange("image",e)}>{e}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rd-field"><label>Nombre *</label><input className={formErrors.name?"err":""} value={form.name} onChange={e=>handleFormChange("name",e.target.value)}/>{formErrors.name&&<span className="rd-field-error">{formErrors.name}</span>}</div>
                <div className="rd-field"><label>Descripcion</label><textarea rows={2} value={form.description} onChange={e=>handleFormChange("description",e.target.value)}/></div>
                <div className="rd-field-row">
                  <div className="rd-field"><label>Precio (Q) *</label><input type="number" className={formErrors.price?"err":""} value={form.price} onChange={e=>handleFormChange("price",e.target.value)}/>{formErrors.price&&<span className="rd-field-error">{formErrors.price}</span>}</div>
                  <div className="rd-field"><label>Categoria</label><select value={form.category} onChange={e=>handleFormChange("category",e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                </div>
                <div className="rd-field">
                  <label>Opciones</label>
                  <div className="rd-checkboxes">
                    <label className={"rd-checkbox"+(form.available?" checked":"")}><input type="checkbox" style={{display:"none"}} checked={form.available} onChange={e=>handleFormChange("available",e.target.checked)}/><div className="rd-checkbox-box">{form.available&&"v"}</div>Disponible</label>
                    <label className={"rd-checkbox"+(form.popular?" checked":"")}><input type="checkbox" style={{display:"none"}} checked={form.popular} onChange={e=>handleFormChange("popular",e.target.checked)}/><div className="rd-checkbox-box">{form.popular&&"v"}</div>Popular</label>
                  </div>
                </div>
                {formErrors.submit && <div className="rd-field-submit-error">{formErrors.submit}</div>}
              </div>
              <div className="rd-modal-footer">
                <button className="rd-modal-cancel" onClick={closeModal}>Cancelar</button>
                <button className="rd-modal-save" onClick={handleSaveItem} disabled={saving}>{saving&&<span className="rd-spinner"/>}{saving?"Guardando...":editingItem?"Guardar":"Agregar"}</button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT RESTAURANT MODAL */}
        {restModalOpen && (
          <div className="rd-overlay" onClick={()=>setRestModalOpen(false)}>
            <div className="rd-modal" onClick={e=>e.stopPropagation()}>
              <div className="rd-modal-header">
                <span className="rd-modal-title">Editar restaurante</span>
                <button className="rd-modal-close" onClick={()=>setRestModalOpen(false)}>x</button>
              </div>
              <div className="rd-modal-body">
                <div className="rd-field"><label>Nombre *</label><input className={restErrors.name?"err":""} value={restForm.name||""} onChange={e=>handleRestFormChange("name",e.target.value)}/>{restErrors.name&&<span className="rd-field-error">{restErrors.name}</span>}</div>
                <div className="rd-field"><label>Descripcion *</label><textarea rows={2} className={restErrors.description?"err":""} value={restForm.description||""} onChange={e=>handleRestFormChange("description",e.target.value)}/>{restErrors.description&&<span className="rd-field-error">{restErrors.description}</span>}</div>
                <div className="rd-field">
                  <label>Categorias</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                    {(restaurant?.categories??[]).map(cat=>(
                      <div key={cat} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",background:"#1a1e2e",border:"1px solid #1e2230",borderRadius:4}}>
                        <span style={{fontSize:"0.78rem",color:"#c8ccd8"}}>{cat}</span>
                        <button onClick={()=>handleRemoveCategory(cat)} style={{background:"none",border:"none",color:"#3d4255",cursor:"pointer",fontSize:"0.8rem",padding:"0 2px",lineHeight:1}}>x</button>
                      </div>
                    ))}
                  </div>
                  <input value={restForm.newCategory||""} onChange={e=>handleRestFormChange("newCategory",e.target.value)} placeholder="Nueva categoria (se agrega al guardar)"/>
                </div>
                <div className="rd-field-row">
                  <div className="rd-field"><label>Telefono *</label><input className={restErrors.phone?"err":""} value={restForm.phone||""} onChange={e=>handleRestFormChange("phone",e.target.value)}/>{restErrors.phone&&<span className="rd-field-error">{restErrors.phone}</span>}</div>
                  <div className="rd-field"><label>Correo *</label><input type="email" className={restErrors.email?"err":""} value={restForm.email||""} onChange={e=>handleRestFormChange("email",e.target.value)}/>{restErrors.email&&<span className="rd-field-error">{restErrors.email}</span>}</div>
                </div>
                <div className="rd-field">
                  <label>Ubicacion (opcional)</label>
                  <div className="rd-field-row" style={{marginBottom:0}}>
                    <div className="rd-field" style={{marginBottom:0}}><input type="number" step="any" placeholder="Longitud" value={restForm.lng||""} onChange={e=>handleRestFormChange("lng",e.target.value)}/></div>
                    <div className="rd-field" style={{marginBottom:0}}><input type="number" step="any" placeholder="Latitud" value={restForm.lat||""} onChange={e=>handleRestFormChange("lat",e.target.value)}/></div>
                  </div>
                </div>
                {restErrors.submit && <div className="rd-field-submit-error">{restErrors.submit}</div>}
              </div>
              <div className="rd-modal-footer">
                <button className="rd-modal-cancel" onClick={()=>setRestModalOpen(false)}>Cancelar</button>
                <button className="rd-modal-save" onClick={handleSaveRest} disabled={restSaving}>{restSaving&&<span className="rd-spinner"/>}{restSaving?"Guardando...":"Guardar"}</button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {deleteTarget && (
          <div className="rd-overlay" onClick={()=>setDeleteTarget(null)}>
            <div className="rd-delete-modal" onClick={e=>e.stopPropagation()}>
              <div className="rd-delete-title">{deleteTarget.ids.length===1?"Eliminar producto":"Eliminar "+deleteTarget.ids.length+" productos"}</div>
              <div className="rd-delete-sub">Esta accion no se puede deshacer.</div>
              {deleteTarget.labels.length > 1 && (
                <div className="rd-delete-chip-list">
                  {deleteTarget.labels.map((label,i) => <div key={i} className="rd-delete-chip">{label}</div>)}
                </div>
              )}
              {deleteTarget.labels.length===1 && <div className="rd-delete-chip-list"><div className="rd-delete-chip">{deleteTarget.labels[0]}</div></div>}
              <div className="rd-delete-actions">
                <button className="rd-delete-cancel" onClick={()=>setDeleteTarget(null)}>Cancelar</button>
                <button className="rd-delete-confirm" onClick={handleDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="rd-toast">{toast}</div>}
      </div>
    </div>
  );
}
