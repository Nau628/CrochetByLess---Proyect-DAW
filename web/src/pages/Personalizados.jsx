import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import s from "./Personalizados.module.css";

const PHONE = import.meta.env.VITE_PHONE_SHOP || "50361739697";

// Helper: mensaje de WhatsApp (SIN talla)
function buildWaText(p){
  const lines = [
    "Hola! Quiero un pedido personalizado:",
    p.id_producto ? `- Producto base ID: ${p.id_producto}` : null,
    `- Cliente: ${p.nombre_cliente}`,
    p.tipo ? `- Tipo: ${p.tipo}` : null,
    p.color_preferido ? `- Color: ${p.color_preferido}` : null,
    p.descripcion_detalle ? `- Detalles: ${p.descripcion_detalle}` : null,
    p.imagen_referencia ? `- Imagen ref: ${p.imagen_referencia}` : null,
    `- Tel: ${p.telefono_cliente}`
  ].filter(Boolean);
  return encodeURIComponent(lines.join("\n"));
}

// debounce simple
function useDebounce(fn, delay=300){
  const t = useRef();
  return useMemo(()=> (...args)=>{
    clearTimeout(t.current);
    t.current = setTimeout(()=>fn(...args), delay);
  }, [fn, delay]);
}

export default function Personalizados(){
  const [form, setForm] = useState({
    nombre_cliente: "",
    telefono_cliente: "",
    tipo: "",
    id_producto: null,
    color_preferido: "",
    descripcion_detalle: "",
    imagen_referencia: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resultWa, setResultWa] = useState("");

  // autocomplete
  const [acOpen, setAcOpen] = useState(false);
  const [acQuery, setAcQuery] = useState("");
  const [acItems, setAcItems] = useState([]);
  const acBox = useRef(null);

  function validate(f){
    const e = {};
    if (!f.nombre_cliente.trim()) e.nombre_cliente = "Requerido";
    const rxPhone = /^[0-9]{8,15}$/;
    if (!rxPhone.test(String(f.telefono_cliente || ""))) e.telefono_cliente = "8–15 dígitos (solo números)";
    return e;
  }
  function setField(k, v){ setForm(prev => ({ ...prev, [k]: v })); }

  const searchProducts = useDebounce(async (q)=>{
    if (!q || q.length < 2) { setAcItems([]); return; }
    try{
      const data = await api(`/api/productos?q=${encodeURIComponent(q)}&sort=name_asc`);
      const arr = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
      setAcItems(arr.slice(0,5));
    }catch{ setAcItems([]); }
  }, 300);
  useEffect(()=>{ searchProducts(acQuery); }, [acQuery]);

  useEffect(()=>{
    function onClick(e){
      if (acBox.current && !acBox.current.contains(e.target)) setAcOpen(false);
    }
    document.addEventListener("click", onClick);
    return ()=> document.removeEventListener("click", onClick);
  }, []);

  async function onSubmit(e){
    e.preventDefault();
    const e1 = validate(form);
    setErrors(e1);
    if (Object.keys(e1).length) return;

    setLoading(true); setResultWa("");
    try{
      const payload = {
        id_producto: form.id_producto || null,
        nombre_cliente: form.nombre_cliente.trim(),
        telefono_cliente: String(form.telefono_cliente).trim(),
        color_preferido: form.color_preferido || null,
        descripcion_detalle: form.descripcion_detalle || null,
        imagen_referencia: form.imagen_referencia || null
      };
      const created = await api("/api/pedidos-personalizados", { method:"POST", body: payload });
      const link = created?.whatsapp || `https://wa.me/${PHONE}?text=${buildWaText({ ...payload, tipo: form.tipo })}`;
      setResultWa(link);
      window.open(link, "_blank");
    }catch(err){
      setErrors({ submit: err?.message || "Error al enviar" });
    }finally{
      setLoading(false);
    }
  }

  const previewText = decodeURIComponent(buildWaText({
    id_producto: form.id_producto,
    nombre_cliente: form.nombre_cliente || "<tu nombre>",
    telefono_cliente: form.telefono_cliente || "<tu teléfono>",
    tipo: form.tipo || "<tipo>",
    color_preferido: form.color_preferido,
    descripcion_detalle: form.descripcion_detalle,
    imagen_referencia: form.imagen_referencia
  }));

  return (
    <div className={`container ${s.root}`}>
      {/* HERO */}
      <div className={`section ${s.hero}`}>
        <article className="card">
          <div className={s.heroCard}>
            <img src="/img/logo.png" alt="Crochet By Less" className={s.logo} />
            <div>
              <h2>Personaliza tu pieza única</h2>
              <p style={{margin:0}}>Cuéntanos tu idea y la creamos a tu medida. Respuesta por WhatsApp.</p>
              <div className="hint" style={{marginTop:6}}>
                San Miguel, El Salvador · IG @crochet_byless · FB Crochet.byless · TikTok @crochet.byless
              </div>
            </div>
          </div>
        </article>

        <aside className="card">
          <h3 style={{marginTop:0}}>¿Cómo funciona?</h3>
          <ol style={{marginTop:6, paddingLeft:16, lineHeight:1.6}}>
            <li>Describe tu idea o elige un producto base.</li>
            <li>Indica colores y detalles.</li>
            <li>Te confirmamos por WhatsApp al <b>{PHONE}</b>.</li>
          </ol>
          <Link to="/catalogo" className="btn" style={{marginTop:8}}>Ver catálogo</Link>
        </aside>
      </div>

      {/* FORM + PREVIEW */}
      <form className={`section ${s.formGrid}`} onSubmit={onSubmit} noValidate>
        {/* Columna izquierda */}
        <div className="card">
          <h3 style={{marginTop:0}}>Tu pedido</h3>

          <div className={s.field}>
            <label>Nombre completo *</label>
            <input
              className={s.input}
              value={form.nombre_cliente}
              onChange={e=>setField("nombre_cliente", e.target.value)}
              aria-invalid={!!errors.nombre_cliente}
              placeholder="Ej: Ana Pérez"
            />
            {errors.nombre_cliente && <span className={s.error}>{errors.nombre_cliente}</span>}
          </div>

          <div className={s.field}>
            <label>Teléfono (WhatsApp) *</label>
            <input
              className={s.input}
              value={form.telefono_cliente}
              onChange={e=>setField("telefono_cliente", e.target.value.replace(/\D/g,""))}
              aria-invalid={!!errors.telefono_cliente}
              placeholder="Ej: 50361739697"
            />
            {errors.telefono_cliente && <span className={s.error}>{errors.telefono_cliente}</span>}
          </div>

          <div className={s.field}>
            <label>Tipo</label>
            <select className={s.select} value={form.tipo} onChange={e=>setField("tipo", e.target.value)}>
              <option value="">Selecciona…</option>
              <option value="Ramos de flores">Ramos de flores</option>
              <option value="Amigurumis">Amigurumis</option>
              <option value="Personalizados">Personalizados</option>
            </select>
          </div>

          {/* Autocomplete producto base */}
          <div className={`${s.field} ${s.acBox}`} ref={acBox}>
            <label>Producto base (opcional)</label>
            <input
              className={s.input}
              value={acQuery}
              onChange={e=>{ setAcQuery(e.target.value); setAcOpen(true); }}
              onFocus={()=> setAcOpen(true)}
              placeholder="Escribe para buscar: gorro, bufanda..."
            />
            {acOpen && acItems.length > 0 && (
              <div className={s.acList}>
                {acItems.map(it=>(
                  <div
                    key={it.id_producto}
                    className={s.acItem}
                    onClick={()=>{
                      setField("id_producto", it.id_producto);
                      setAcQuery(`${it.nombre_producto} (#${it.id_producto})`);
                      setAcOpen(false);
                    }}
                  >
                    {it.nombre_producto} — ${Number(it.precio).toFixed(2)}
                  </div>
                ))}
              </div>
            )}
            {form.id_producto && (
              <div className="hint">Seleccionado: ID {form.id_producto} — <button type="button" onClick={()=>{ setField("id_producto", null); setAcQuery(""); }}>quitar</button></div>
            )}
          </div>

          <div className={s.field}>
            <label>Color preferido</label>
            <input className={s.input} value={form.color_preferido} onChange={e=>setField("color_preferido", e.target.value)} placeholder="Ej: Lila / Rosa"/>
          </div>

          <div className={s.field}>
            <label>Descripción / Detalles</label>
            <textarea className={s.textarea} rows={5} value={form.descripcion_detalle} onChange={e=>setField("descripcion_detalle", e.target.value)} placeholder="Materiales, tamaño, fecha deseada, acabados..."/>
          </div>

          <div className={s.field}>
            <label>Imagen de referencia (URL)</label>
            <input className={s.input} value={form.imagen_referencia} onChange={e=>setField("imagen_referencia", e.target.value)} placeholder="https://..."/>
          </div>

          {errors.submit && <p className={s.error}>{errors.submit}</p>}
          <button className="btn menta" disabled={loading}>{loading ? "Enviando..." : "Enviar solicitud"}</button>
        </div>

        {/* Columna derecha */}
        <div className={`card ${s.preview}`}>
          <h3 style={{marginTop:0}}>Vista previa</h3>
          <div className="pill">Se enviará a WhatsApp: <b>{PHONE}</b></div>
          <div className={s.field}>
            <label>Mensaje:</label>
            <textarea className={s.textarea} value={previewText} readOnly rows={10} />
            <span className="hint">Este es el texto que verás en WhatsApp.</span>
          </div>

          <div className={s.ctaRow}>
            <a
              className="btn"
              href={`https://wa.me/${PHONE}?text=${buildWaText({
                id_producto: form.id_producto,
                nombre_cliente: form.nombre_cliente || "<tu nombre>",
                telefono_cliente: form.telefono_cliente || "<tu teléfono>",
                tipo: form.tipo,
                color_preferido: form.color_preferido,
                descripcion_detalle: form.descripcion_detalle,
                imagen_referencia: form.imagen_referencia
              })}`}
              target="_blank" rel="noreferrer"
            >
              Abrir WhatsApp ahora
            </a>
            {resultWa && <a className="btn alt" href={resultWa} target="_blank" rel="noreferrer">Ver link del backend</a>}
          </div>

          <div className="banner" style={{marginTop:10}}>
            Tiempo estimado y ajustes se coordinan por WhatsApp. ¡Gracias por apoyar el trabajo hecho a mano!
          </div>
        </div>
      </form>
    </div>
  );
}
