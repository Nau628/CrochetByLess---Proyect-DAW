// web/src/pages/admin/ProductoAdminForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api.js";
import { useCategories } from "../../hooks/useCategories.js";

export default function ProductoAdminForm({ mode = "create" }){
  const { id } = useParams();
  const nav = useNavigate();
  const { cats } = useCategories();

  const [f, setF] = useState({
    id_categoria: "",
    nombre_producto: "",
    descripcion: "",
    precio: "",
    stock: "",
    color: "",
    imagen_url: ""
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(()=>{
    if (mode !== "edit" || !id) return;
    let on = true;
    (async ()=>{
      try{
        setLoading(true);
        const p = await api(`/api/productos/${id}`);
        if (!on) return;
        setF({
          id_categoria: p.id_categoria || "",
          nombre_producto: p.nombre_producto || "",
          descripcion: p.descripcion || "",
          precio: p.precio || "",
          stock: p.stock || "",
          color: p.color || "",
          imagen_url: p.imagen_url || ""
        });
      }catch(e){ setErr(e?.message || "Error cargando"); }
      finally{ setLoading(false); }
    })();
    return ()=>{ on=false; }
  }, [id, mode]);

  function onChange(e){
    const { name, value } = e.target;
    setF(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e){
    e.preventDefault();
    setErr(""); setLoading(true);
    try{
      const body = {
        id_categoria: f.id_categoria ? Number(f.id_categoria) : null,
        nombre_producto: f.nombre_producto.trim(),
        descripcion: f.descripcion.trim(),
        precio: Number(f.precio) || 0,
        stock: Number(f.stock) || 0,
        color: f.color.trim() || null,
        imagen_url: f.imagen_url.trim() || null
      };
      if (!body.nombre_producto) throw new Error("Nombre es obligatorio");

      if (mode === "create") {
        await api("/api/productos", { method:"POST", body });
      } else {
        await api(`/api/productos/${id}`, { method:"PUT", body });
      }
      nav("/admin/productos");
    }catch(e){
      setErr(e?.message || "No se pudo guardar");
    }finally{ setLoading(false); }
  }

  return (
    <div className="card" style={{maxWidth:720}}>
      <h2 style={{marginTop:0}}>{mode==="create" ? "Nuevo producto" : `Editar producto #${id}`}</h2>
      {err && <p style={{color:"crimson"}}>{err}</p>}
      <form onSubmit={onSubmit} className="form-grid">
        <label>Categoría
          <select name="id_categoria" value={String(f.id_categoria||"")} onChange={onChange}>
            <option value="">-- Seleccionar --</option>
            {cats.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
          </select>
        </label>
        <label>Nombre
          <input name="nombre_producto" value={f.nombre_producto} onChange={onChange} required />
        </label>
        <label>Descripción
          <textarea name="descripcion" value={f.descripcion} onChange={onChange} rows={3} />
        </label>

        <div className="form-row-2">
          <label>Precio
            <input name="precio" type="number" step="0.01" value={f.precio} onChange={onChange} />
          </label>
          <label>Stock
            <input name="stock" type="number" value={f.stock} onChange={onChange} />
          </label>
        </div>

        <label>Color
          <input name="color" value={f.color} onChange={onChange} />
        </label>

        <label>Imagen (URL)
          <input name="imagen_url" value={f.imagen_url} onChange={onChange} placeholder="/img/amigurumis/amigurumi1.jpg" />
          {f.imagen_url && (
            <div style={{marginTop:8}}>
              <img src={f.imagen_url} alt="preview" style={{maxWidth:200, border:"1px solid var(--border)", borderRadius:8}} onError={(e)=>{ e.currentTarget.style.opacity=.4; }} />
            </div>
          )}
        </label>

        <div style={{display:"flex", gap:8}}>
          <button className="btn menta" disabled={loading} type="submit">{loading ? "Guardando..." : "Guardar"}</button>
          <button type="button" className="btn" onClick={()=> history.back()}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
