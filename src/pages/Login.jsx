import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { helpers, users, stats as statsApi } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [siteStats, setSiteStats] = useState({ active_restaurants: "...", orders_by_status: {}, unique_restaurant_categories: [] });

  useEffect(() => {
    statsApi.getGlobal()
      .then(data => setSiteStats(data))
      .catch(() => {}); // fail silently
  }, []);

  const roleRoutes = {
    customer:   "/restaurants",
    restaurant: "/restaurant-dashboard",
    admin:      "/admin-dashboard",
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

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      if (mode === "login") {
        const user = await users.login(form.email, form.password);
        helpers.saveSession(user);
        navigate(roleRoutes[user.role] ?? "/restaurants");
      } else {
        const payload = helpers.toRegisterPayload(form);
        const created = await users.create(payload);
        helpers.saveSession(created);
        navigate("/restaurants");
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // Restaurants are created by admin - only customers can self-register

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"'DM Sans',sans-serif",background:"#0f1117",color:"#e8eaf0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0f1117}
        .lg-wrap{display:flex;min-height:100vh;width:100%}
        .lg-left{flex:1;padding:64px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid #1e2230}
        .lg-right{width:420px;padding:64px 48px;display:flex;flex-direction:column;justify-content:center}
        .lg-logo{font-family:'DM Mono',monospace;font-size:1.1rem;font-weight:500;color:#52c49b;letter-spacing:0.05em}
        .lg-logo span{color:#e8eaf0}
        .lg-tagline{font-size:0.72rem;color:#3d4255;text-transform:uppercase;letter-spacing:0.12em;margin-top:4px}
        .lg-hero h1{font-size:clamp(2.2rem,4vw,3.2rem);font-weight:300;color:#e8eaf0;line-height:1.2;margin-bottom:16px}
        .lg-hero h1 em{font-style:normal;color:#52c49b}
        .lg-hero p{font-size:0.9rem;color:#4a5068;line-height:1.7;max-width:340px}
        .lg-stats{display:flex;gap:40px;padding-top:40px;border-top:1px solid #1e2230;margin-top:auto}
        .lg-stat strong{display:block;font-family:'DM Mono',monospace;font-size:1.5rem;font-weight:500;color:#52c49b}
        .lg-stat span{font-size:0.7rem;color:#3d4255;text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;display:block}
        .lg-toggle{display:flex;background:#1a1e2e;border:1px solid #1e2230;border-radius:6px;padding:3px;margin-bottom:32px}
        .lg-tab{flex:1;padding:9px;border:none;border-radius:4px;background:transparent;color:#4a5068;font-family:'DM Sans',sans-serif;font-size:0.85rem;cursor:pointer}
        .lg-tab.active{background:#52c49b;color:#0a0e14;font-weight:600}
        .lg-label{display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;color:#3d4255;margin-bottom:6px;margin-top:16px}
        .lg-input{width:100%;padding:11px 14px;background:#1a1e2e;border:1px solid #1e2230;border-radius:6px;color:#e8eaf0;font-family:'DM Sans',sans-serif;font-size:0.9rem;outline:none}
        .lg-input:focus{border-color:#52c49b}
        .lg-input.err{border-color:#e05555}
        .lg-error{font-size:0.75rem;color:#e05555;margin-top:4px}
        .lg-submit{width:100%;margin-top:24px;padding:12px;background:#52c49b;border:none;border-radius:6px;color:#0a0e14;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;letter-spacing:0.02em}
        .lg-submit:hover{background:#60d4a8}
        .lg-submit:disabled{opacity:0.5;cursor:not-allowed}
        .lg-hint{margin-top:16px;padding:10px 12px;background:#1a1e2e;border-left:2px solid #52c49b33;font-size:0.75rem;color:#3d4255;line-height:1.5}
        .lg-hint strong{color:#52c49b88}
        @media(max-width:760px){.lg-left{display:none}.lg-right{width:100%;padding:40px 24px}}
      `}</style>

      <div className="lg-wrap">
        {/* LEFT */}
        <div className="lg-left">
          <div>
            <div className="lg-logo">Click<span>Bite</span></div>
            <div className="lg-tagline">Food delivery platform</div>
          </div>
          <div className="lg-hero">
            <h1>Your favorite<br/>food, <em>delivered</em><br/>instantly.</h1>
            <p>Discover restaurants near you and get fresh meals delivered right to your door.</p>
          </div>
          <div className="lg-stats">
            <div className="lg-stat">
              <strong>{siteStats.active_restaurants ?? "-"}</strong>
              <span>Active restaurants</span>
            </div>
            <div className="lg-stat">
              <strong>{siteStats.orders_by_status?.delivered ?? "-"}</strong>
              <span>Delivered orders</span>
            </div>
            <div className="lg-stat">
              <strong>{(siteStats.unique_restaurant_categories ?? []).length || "-"}</strong>
              <span>Cuisines</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg-right">
          <div className="lg-toggle">
            <button className={"lg-tab"+(mode==="login"?" active":"")} onClick={()=>{setMode("login");setErrors({})}}>Sign in</button>
            <button className={"lg-tab"+(mode==="register"?" active":"")} onClick={()=>{setMode("register");setErrors({})}}>Create account</button>
          </div>

          {mode==="register" && (
            <>
              <label className="lg-label">Full name</label>
              <input className={"lg-input"+(errors.name?" err":"")} type="text" placeholder="Jane Smith" value={form.name} onChange={e=>handleChange("name",e.target.value)}/>
              {errors.name && <div className="lg-error">{errors.name}</div>}
            </>
          )}

          <label className="lg-label">Email</label>
          <input className={"lg-input"+(errors.email?" err":"")} type="email" placeholder="you@example.com" value={form.email} onChange={e=>handleChange("email",e.target.value)}/>
          {errors.email && <div className="lg-error">{errors.email}</div>}

          <label className="lg-label">Password</label>
          <input className={"lg-input"+(errors.password?" err":"")} type="password" placeholder="min. 6 characters" value={form.password} onChange={e=>handleChange("password",e.target.value)}/>
          {errors.password && <div className="lg-error">{errors.password}</div>}

          {mode==="register" && (
            <>
              <label className="lg-label">Confirm password</label>
              <input className={"lg-input"+(errors.confirmPassword?" err":"")} type="password" placeholder="repeat password" value={form.confirmPassword} onChange={e=>handleChange("confirmPassword",e.target.value)}/>
              {errors.confirmPassword && <div className="lg-error">{errors.confirmPassword}</div>}
            </>
          )}

          <button className="lg-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "Loading..." : mode==="login" ? "Sign in" : "Create account"}
          </button>

          {errors.submit && <div className="lg-error" style={{marginTop:10,textAlign:"center"}}>{errors.submit}</div>}

          <div className="lg-hint">
            <strong>Demo:</strong> admin@clickbite.com / admin123 &nbsp;|&nbsp; user1@example.com / pass123
          </div>
        </div>
      </div>
    </div>
  );
}
