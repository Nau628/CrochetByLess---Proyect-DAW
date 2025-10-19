// web/src/pages/admin/CategoriaAdminForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api.js";

export default function CategoriaAdminForm({ mode = "create" }){
  const { id } = useParams();
  const nav = useNavigate();
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(()=>{
    if (mode !== "edit" || !id) return;
    let on = true;
    (async ()=>{
      try{
        setLoading(true);
        const data = await api("/api/categorias");
        if (!on) return;
        const cat = (data||[]).find(c => String(c.id_categoria) === String(id));
        if (!cat) throw new Error("No encontrada");
        setNombre(cat.nombre_categoria || "");
      }catch(e){ setErr(e?.message || "Error cargando"); }
      finally{ setLoading(false); }
    })();
    return ()=>{ on=false; }
  }, [id, mode]);

  async function onSubmit(e){
    e.preventDefault();
    setErr(""); setLoading(true);
    try{
      const body = { nombre_categoria: nombre.trim() };
      if (!body.nombre_categoria) throw new Error("Nombre es obligatorio");
      if (mode === "create") {
        await api("/api/categorias", { method:"POST", body });
      } else {
        await api(`/api/categorias/${id}`, { method:"PUT", body });
      }
      nav("/admin/categorias");
    }catch(e){
      setErr(e?.message || "No se pudo guardar");
    }finally{ setLoading(false); }
  }

  return (
    <div className="card" style={{maxWidth:560}}>
      <h2 style={{marginTop:0}}>{mode==="create" ? "Nueva categoría" : `Editar categoría #${id}`}</h2>
      {err && <p style={{color:"crimson"}}>{err}</p>}
      <form onSubmit={onSubmit} className="form-grid">
        <label>Nombre
          <input value={nombre} onChange={e=> setNombre(e.target.value)} required />
        </label>
        <div style={{display:"flex", gap:8}}>
          <button className="btn menta" disabled={loading} type="submit">{loading ? "Guardando..." : "Guardar"}</button>
          <button type="button" className="btn" onClick={()=> history.back()}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
