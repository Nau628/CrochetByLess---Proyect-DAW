// web/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@crochet.test"); // de prueba
  const [password, setPassword] = useState("123456");       // de prueba
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error al iniciar sesión");
      login(data.token, data.user);
      // vuelve a la página previa o a /
      const to = loc.state?.from || "/";
      nav(to, { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 460 }}>
      <h2>Iniciar sesión</h2>
      <p style={{ opacity: .8, marginTop: -6 }}>Usa tu correo y contraseña</p>
      <form onSubmit={onSubmit} className="card" style={{ display:"grid", gap:12 }}>
        {err && <div className="toast err">{err}</div>}
        <label className="field">
          <span>Correo</span>
          <input type="email" value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="tucorreo@dominio.com" required />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input type="password" value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="••••••" required />
        </label>
        <button className="btn" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="hint" style={{ marginTop:8 }}>
        También puedes probar con <b>cliente@crochet.test / 123456</b> (rol cliente).
      </div>
    </div>
  );
}
