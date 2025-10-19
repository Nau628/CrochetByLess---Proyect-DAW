import { useState } from "react";
import { api } from "../api";
import s from "./Contacto.module.css";

const PHONE = import.meta.env.VITE_PHONE_SHOP || "50361739697";

// helper: mensaje para WhatsApp
function buildWaText({ nombre, email, asunto, mensaje }){
  const lines = [
    "Hola! Me gustaría contactar con Crochet By Less:",
    `• Nombre: ${nombre}`,
    email ? `• Email: ${email}` : null,
    asunto ? `• Asunto: ${asunto}` : null,
    "",
    mensaje || "<tu mensaje aquí>"
  ].filter(Boolean);
  return encodeURIComponent(lines.join("\n"));
}

export default function Contacto(){
  const [form, setForm] = useState({
    nombre: "", email: "", asunto: "", mensaje: ""
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  function setField(k,v){ setForm(prev => ({ ...prev, [k]: v })); }

  function validate(f){
    const e = {};
    if(!f.nombre.trim()) e.nombre = "Requerido";
    if(!f.mensaje.trim()) e.mensaje = "Cuéntanos en qué podemos ayudarte";
    if(f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Email inválido";
    return e;
  }

  async function onSubmit(e){
    e.preventDefault();
    setOkMsg("");
    const es = validate(form);
    setErrors(es);
    if(Object.keys(es).length) return;

    setSending(true);
    try{
      // POST a tu API (si tienes /api/contacto). Si no existe, comenta esta línea y usa solo WhatsApp.
      await api("/api/contacto", {
        method: "POST",
        body: {
          nombre: form.nombre.trim(),
          email: form.email || null,
          asunto: form.asunto || null,
          mensaje: form.mensaje.trim()
        }
      });
      setOkMsg("¡Gracias! Te responderemos pronto por WhatsApp o email.");
    }catch(err){
      setErrors({ submit: err?.message || "No se pudo enviar el contacto" });
      return;
    }finally{
      setSending(false);
    }
  }

  const waLink = `https://wa.me/${PHONE}?text=${buildWaText(form)}`;

  return (
    <div className={`container ${s.root}`}>
      <div className="section">
        <h2>Contacto</h2>
        <p>Estamos en <b>San Miguel, El Salvador</b>. Escríbenos por el formulario, o si prefieres ¡directo a WhatsApp!</p>
      </div>

      <div className={`section ${s.grid}`}>
        {/* Formulario */}
        <form className="card" onSubmit={onSubmit} noValidate>
          <h3 style={{marginTop:0}}>Envíanos un mensaje</h3>

          <div className={s.field}>
            <label>Nombre *</label>
            <input className={s.input} value={form.nombre} onChange={e=>setField("nombre", e.target.value)} />
            {errors.nombre && <span className={s.error}>{errors.nombre}</span>}
          </div>

          <div className={s.field}>
            <label>Email (opcional)</label>
            <input className={s.input} value={form.email} onChange={e=>setField("email", e.target.value)} />
            {errors.email && <span className={s.error}>{errors.email}</span>}
          </div>

          <div className={s.field}>
            <label>Asunto (opcional)</label>
            <input className={s.input} value={form.asunto} onChange={e=>setField("asunto", e.target.value)} />
          </div>

          <div className={s.field}>
            <label>Mensaje *</label>
            <textarea className={s.textarea} rows={6} value={form.mensaje} onChange={e=>setField("mensaje", e.target.value)} />
            {errors.mensaje && <span className={s.error}>{errors.mensaje}</span>}
          </div>

          {errors.submit && <p className={s.error}>{errors.submit}</p>}
          {okMsg && <p className={s.success}>{okMsg}</p>}

          <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
            <button className="btn menta" disabled={sending}>{sending ? "Enviando..." : "Enviar"}</button>
            <a className="btn" href={waLink} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
          </div>
        </form>

        {/* Info / WhatsApp / Redes / Mapa */}
        <aside className="card">
          <h3 style={{marginTop:0}}>WhatsApp y redes</h3>
          <div className={s.meta}>
            <div><b>WhatsApp:</b> <a href={waLink} target="_blank" rel="noreferrer">+{PHONE}</a></div>
            <div className={s.socials}>
              <a className="pill" href="https://instagram.com/crochet_byless" target="_blank" rel="noreferrer">Instagram</a>
              <a className="pill" href="https://facebook.com/Crochet.byless" target="_blank" rel="noreferrer">Facebook</a>
              <a className="pill" href="https://www.tiktok.com/@crochet.byless" target="_blank" rel="noreferrer">TikTok</a>
            </div>
          </div>

          <h4>Ubicación</h4>
          {/* Mapa embebido al centro de San Miguel, SV (placeholder) */}
          <iframe
            className={s.map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=San%20Miguel%2C%20El%20Salvador&output=embed"
            title="Mapa San Miguel, El Salvador"
          />
        </aside>
      </div>

      <footer className="section" style={{opacity:.8, fontSize:13}}>
        © {new Date().getFullYear()} Crochet By Less — Gracias por apoyar el trabajo hecho a mano.
      </footer>
    </div>
  );
}
