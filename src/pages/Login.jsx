import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { helpers, stats as statsApi, users } from "../services/api";

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
      .catch(() => {});
  }, []);

  const roleRoutes = {
    customer: "/restaurants",
    restaurant: "/restaurant-dashboard",
    admin: "/admin-dashboard",
  };

  const validate = () => {
    const e = {};
    if (mode === "register" && !form.name.trim()) e.name = "El nombre es obligatorio";
    if (!form.email.includes("@")) e.email = "Ingresa un correo válido";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (mode === "register" && form.password !== form.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden";
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

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"'DM Sans',sans-serif",background:"#0f1117",color:"#e8eaf0"}}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        *{box-sizing:border-box;margin:0;padding:0}

        .container{
          display:flex;
          width:100%;
          min-height:100vh;
        }

        .left{
          flex:1;
          display:flex;
          align-items:center;
          justify-content:center;
          border-right:1px solid #1e2230;
        }

        .logo{
          font-size:3rem;
          font-weight:600;
          letter-spacing:2px;
          color:#52c49b;
        }

        .logo span{
          color:#ffffff;
        }

        .right{
          width:420px;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:40px;
        }

        .form-box{
          width:100%;
        }

        .tabs{
          display:flex;
          background:#1a1e2e;
          border:1px solid #1e2230;
          border-radius:6px;
          margin-bottom:24px;
        }

        .tab{
          flex:1;
          padding:10px;
          background:transparent;
          border:none;
          color:#4a5068;
          cursor:pointer;
        }

        .tab.active{
          background:#52c49b;
          color:#0a0e14;
          font-weight:600;
        }

        .label{
          display:block;
          font-size:0.75rem;
          color:#3d4255;
          margin-bottom:6px;
          margin-top:14px;
        }

        .input{
          width:100%;
          padding:11px;
          background:#1a1e2e;
          border:1px solid #1e2230;
          border-radius:6px;
          color:#e8eaf0;
        }

        .input:focus{
          outline:none;
          border-color:#52c49b;
        }

        .input.err{
          border-color:#e05555;
        }

        .error{
          font-size:0.75rem;
          color:#e05555;
          margin-top:4px;
        }

        .submit{
          width:100%;
          margin-top:24px;
          padding:12px;
          background:#52c49b;
          border:none;
          border-radius:6px;
          color:#0a0e14;
          font-weight:600;
          cursor:pointer;
        }

        .submit:disabled{
          opacity:0.5;
          cursor:not-allowed;
        }

        @media(max-width:760px){
          .left{display:none}
          .right{width:100%}
        }

      `}</style>

      <div className="container">

        {/* LEFT */}
        <div className="left">
          <div className="logo">
            CLICK<span>BITE</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="form-box">

            <div className="tabs">
              <button
                className={"tab"+(mode==="login"?" active":"")}
                onClick={()=>{setMode("login");setErrors({})}}
              >
                Iniciar sesión
              </button>

              <button
                className={"tab"+(mode==="register"?" active":"")}
                onClick={()=>{setMode("register");setErrors({})}}
              >
                Crear cuenta
              </button>
            </div>

            {mode==="register" && (
              <>
                <label className="label">Nombre completo</label>
                <input
                  className={"input"+(errors.name?" err":"")}
                  type="text"
                  value={form.name}
                  onChange={e=>handleChange("name",e.target.value)}
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </>
            )}

            <label className="label">Correo electrónico</label>
            <input
              className={"input"+(errors.email?" err":"")}
              type="email"
              value={form.email}
              onChange={e=>handleChange("email",e.target.value)}
            />
            {errors.email && <div className="error">{errors.email}</div>}

            <label className="label">Contraseña</label>
            <input
              className={"input"+(errors.password?" err":"")}
              type="password"
              value={form.password}
              onChange={e=>handleChange("password",e.target.value)}
            />
            {errors.password && <div className="error">{errors.password}</div>}

            {mode==="register" && (
              <>
                <label className="label">Confirmar contraseña</label>
                <input
                  className={"input"+(errors.confirmPassword?" err":"")}
                  type="password"
                  value={form.confirmPassword}
                  onChange={e=>handleChange("confirmPassword",e.target.value)}
                />
                {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
              </>
            )}

            <button className="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Cargando..." : mode==="login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>

            {errors.submit && (
              <div className="error" style={{marginTop:10,textAlign:"center"}}>
                {errors.submit}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
