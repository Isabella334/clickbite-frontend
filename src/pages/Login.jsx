import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Simula la consulta a la BD según el email
  const getMockRoleFromEmail = (email) => {
    if (email.includes("admin")) return "admin";
    if (email.includes("restaurant")) return "restaurant";
    return "customer";
  };

  const roleRoutes = {
    customer: "/restaurants",
    restaurant: "/restaurant-dashboard",
    admin: "/admin-dashboard",
  };

  const validate = () => {
    const e = {};
    if (mode === "register" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "At least 6 characters";
    if (mode === "register" && form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "login") {
        // Simula consulta a BD — el rol viene del servidor
        const detectedRole = getMockRoleFromEmail(form.email);
        navigate(roleRoutes[detectedRole]);
      } else {
        // En registro, el rol elegido se guardaría en la BD
        navigate(roleRoutes[role]);
      }
    }, 1200);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const registerRoles = [
    { key: "customer", label: "Customer", icon: "🛍️", desc: "Order food from restaurants" },
    { key: "restaurant", label: "Restaurant", icon: "🍽️", desc: "Manage your restaurant" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cb-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #0d1117;
          overflow: hidden;
        }

        /* LEFT PANEL */
        .cb-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          position: relative;
          background: linear-gradient(145deg, #1a2e2a 0%, #0d1f1c 60%, #071412 100%);
          overflow: hidden;
        }

        .cb-left::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(82,196,155,0.18) 0%, transparent 70%);
          top: -100px; left: -100px;
          pointer-events: none;
        }

        .cb-left::after {
          content: '';
          position: absolute;
          width: 350px; height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(82,196,155,0.1) 0%, transparent 70%);
          bottom: -50px; right: 40px;
          pointer-events: none;
        }

        .cb-brand { margin-bottom: 56px; position: relative; z-index: 1; }

        .cb-brand-logo {
          font-family: 'Syne', sans-serif;
          font-size: 2.4rem;
          font-weight: 800;
          color: #52c49b;
          letter-spacing: -1px;
          line-height: 1;
        }

        .cb-brand-logo span { color: #fff; }

        .cb-brand-tagline {
          margin-top: 8px;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 300;
        }

        .cb-hero-text { position: relative; z-index: 1; }

        .cb-hero-text h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 20px;
        }

        .cb-hero-text h2 em { font-style: normal; color: #52c49b; }

        .cb-hero-text p {
          font-size: 1rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          max-width: 340px;
          font-weight: 300;
        }

        .cb-stats { display: flex; gap: 40px; margin-top: 56px; position: relative; z-index: 1; }

        .cb-stat-item strong {
          display: block;
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #52c49b;
        }

        .cb-stat-item span {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 300;
        }

        .cb-food-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 48px;
          position: relative;
          z-index: 1;
          opacity: 0.6;
        }

        .cb-food-emoji {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 14px;
          text-align: center;
          font-size: 1.5rem;
          transition: all 0.2s;
        }

        .cb-food-emoji:hover {
          background: rgba(82,196,155,0.1);
          border-color: rgba(82,196,155,0.3);
          transform: scale(1.05);
        }

        /* RIGHT PANEL */
        .cb-right {
          width: 480px;
          min-width: 480px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 48px;
          background: #111820;
          position: relative;
          overflow-y: auto;
        }

        .cb-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 1px; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(82,196,155,0.3) 30%, rgba(82,196,155,0.3) 70%, transparent);
        }

        /* MODE TOGGLE */
        .cb-mode-toggle {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 36px;
        }

        .cb-mode-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: rgba(255,255,255,0.4);
        }

        .cb-mode-btn.active {
          background: #52c49b;
          color: #0d1f1c;
          font-weight: 600;
        }

        /* HEADING */
        .cb-form-heading { margin-bottom: 28px; }

        .cb-form-heading h1 {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }

        .cb-form-heading p {
          margin-top: 6px;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.4);
          font-weight: 300;
        }

        /* ROLE CARDS — solo registro */
        .cb-role-label {
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .cb-role-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 24px;
        }

        .cb-role-card {
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .cb-role-card:hover {
          border-color: rgba(82,196,155,0.4);
        }

        .cb-role-card.active {
          border-color: #52c49b;
          background: rgba(82,196,155,0.08);
        }

        .cb-role-card-icon { font-size: 1.4rem; margin-bottom: 6px; display: block; }

        .cb-role-card-title {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
        }

        .cb-role-card.active .cb-role-card-title { color: #52c49b; }

        .cb-role-card-desc {
          display: block;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          line-height: 1.3;
          font-weight: 300;
        }

        /* FIELDS */
        .cb-field { margin-bottom: 16px; }

        .cb-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 7px;
        }

        .cb-field input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }

        .cb-field input::placeholder { color: rgba(255,255,255,0.2); }

        .cb-field input:focus {
          border-color: #52c49b;
          background: rgba(82,196,155,0.05);
          box-shadow: 0 0 0 3px rgba(82,196,155,0.1);
        }

        .cb-field input.error { border-color: #e05c5c; background: rgba(224,92,92,0.05); }

        .cb-error-msg { margin-top: 5px; font-size: 0.78rem; color: #e05c5c; }

        /* SUBMIT */
        .cb-submit {
          width: 100%;
          padding: 15px;
          background: #52c49b;
          border: none;
          border-radius: 10px;
          color: #0d1f1c;
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }

        .cb-submit:hover:not(:disabled) {
          background: #63d4ab;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(82,196,155,0.3);
        }

        .cb-submit:active:not(:disabled) { transform: translateY(0); }
        .cb-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .cb-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(13,31,28,0.3);
          border-top-color: #0d1f1c;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .cb-demo-hint {
          margin-top: 20px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          font-size: 0.76rem;
          color: rgba(255,255,255,0.25);
          line-height: 1.5;
        }

        .cb-demo-hint strong { color: rgba(82,196,155,0.6); }

        .cb-form-area { animation: slideUp 0.35s ease; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 820px) {
          .cb-root { flex-direction: column; }
          .cb-left { padding: 40px 32px 32px; }
          .cb-left .cb-stats, .cb-left .cb-food-grid { display: none; }
          .cb-right { width: 100%; min-width: unset; padding: 32px 24px 48px; }
          .cb-right::before { display: none; }
        }
      `}</style>

      <div className="cb-root">
        {/* LEFT PANEL */}
        <div className="cb-left">
          <div className="cb-brand">
            <div className="cb-brand-logo">Click<span>Bite</span></div>
            <div className="cb-brand-tagline">Food delivery, reimagined</div>
          </div>

          <div className="cb-hero-text">
            <h2>
              Your favorite<br />
              food, <em>delivered</em><br />
              instantly.
            </h2>
            <p>
              Discover hundreds of restaurants near you and get fresh meals delivered right to your door.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="cb-right">
          <div className="cb-mode-toggle">
            <button
              className={"cb-mode-btn" + (mode === "login" ? " active" : "")}
              onClick={() => { setMode("login"); setErrors({}); }}
            >
              Sign In
            </button>
            <button
              className={"cb-mode-btn" + (mode === "register" ? " active" : "")}
              onClick={() => { setMode("register"); setErrors({}); }}
            >
              Create Account
            </button>
          </div>

          <div className="cb-form-area" key={mode}>
            <div className="cb-form-heading">
              <h1>{mode === "login" ? "Welcome back" : "Join ClickBite"}</h1>
              <p>
                {mode === "login"
                  ? "Enter your credentials to continue"
                  : "Create your account to get started"}
              </p>
            </div>

            {/* ROLE CARDS — solo en registro, sin Admin */}
            {mode === "register" && (
              <>
                <div className="cb-role-label">I want to</div>
                <div className="cb-role-cards">
                  {registerRoles.map(r => (
                    <button
                      key={r.key}
                      className={"cb-role-card" + (role === r.key ? " active" : "")}
                      onClick={() => setRole(r.key)}
                    >
                      <span className="cb-role-card-icon">{r.icon}</span>
                      <span className="cb-role-card-title">{r.label}</span>
                      <span className="cb-role-card-desc">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {mode === "register" && (
              <div className="cb-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  className={errors.name ? "error" : ""}
                  value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                />
                {errors.name && <div className="cb-error-msg">{errors.name}</div>}
              </div>
            )}

            <div className="cb-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={errors.email ? "error" : ""}
                value={form.email}
                onChange={e => handleChange("email", e.target.value)}
              />
              {errors.email && <div className="cb-error-msg">{errors.email}</div>}
            </div>

            <div className="cb-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={errors.password ? "error" : ""}
                value={form.password}
                onChange={e => handleChange("password", e.target.value)}
              />
              {errors.password && <div className="cb-error-msg">{errors.password}</div>}
            </div>

            {mode === "register" && (
              <div className="cb-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={errors.confirmPassword ? "error" : ""}
                  value={form.confirmPassword}
                  onChange={e => handleChange("confirmPassword", e.target.value)}
                />
                {errors.confirmPassword && (
                  <div className="cb-error-msg">{errors.confirmPassword}</div>
                )}
              </div>
            )}

            <button className="cb-submit" onClick={handleSubmit} disabled={loading}>
              {loading && <span className="cb-spinner" />}
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>

            <div className="cb-demo-hint">
              {mode === "login" ? (
                <>
                  <strong>Demo:</strong> email con "admin" → Admin, "restaurant" → Restaurant, cualquier otro → Cliente.
                </>
              ) : (
                <>
                  <strong>Demo:</strong> el rol seleccionado se enviaría a la BD al registrarse.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}