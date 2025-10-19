// web/src/pages/admin/ProductosAdminList.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api.js";
import { imgSrc } from "../../utils/img.js";

export default function ProductosAdminList(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 16);
  const [meta, setMeta] = useState({ total:0, totalPages:1 });

  const nav = useNavigate();

  function setParam(key, value){
    const next = new URLSearchParams(sp);
    next.set(key, String(value));
    if (key !== "page") next.set("page","1");
    setSp(next);
  }

  async function load(){
    setLoading(true); setErr("");
    try{
      const params = new URLSearchParams({ page:String(page), limit:String(limit), sort:"newest" });
      const data = await api(`/api/productos?${params.toString()}`);
      const arr = Array.isArray(data) ? data : (data.items || []);
      const total = Array.isArray(data) ? arr.length : (data.total ?? arr.length);
      const totalPages = Array.isArray(data) ? Math.max(Math.ceil(total/limit),1) : (data.totalPages || 1);
      setItems(arr);
      setMeta({ total, totalPages });
    }catch(e){
      setErr(e?.message || "Error cargando productos");
      setItems([]); setMeta({ total:0, totalPages:1 });
    }finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); }, [page, limit]);

  async function onDelete(id){
    if (!confirm("¿Eliminar producto?")) return;
    try{
      await api(`/api/productos/${id}`, { method:"DELETE" });
      await load();
    }catch(e){
      alert(e?.message || "No se pudo eliminar");
    }
  }

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <h2 style={{margin:0}}>Productos</h2>
        <div style={{display:"flex", gap:8}}>
          <select value={String(limit)} onChange={e=>setParam("limit", Number(e.target.value))}>
            <option value="12">12</option>
            <option value="16">16</option>
            <option value="24">24</option>
          </select>
          <Link to="/admin/productos/nuevo" className="btn menta">Nuevo</Link>
        </div>
      </div>

      {err && <p style={{color:"crimson"}}>{err}</p>}

      <div className="grid">
        {loading ? (
          Array.from({length: limit}).map((_,i)=>(
            <div key={i} className="card"><div className="skel skel-img"></div><div className="skel skel-line"></div></div>
          ))
        ) : items.map(p=>(
          <div key={p.id_producto} className="card">
            <img src={imgSrc(p.imagen_url)} alt={p.nombre_producto} />
            <h3>{p.nombre_producto}</h3>
            <div className="price">${Number(p.precio||0).toFixed(2)}</div>
            <div style={{display:"flex", gap:8, marginTop:8}}>
              <Link className="btn" to={`/admin/productos/${p.id_producto}/editar`}>Editar</Link>
              <Link className="btn" to={`/admin/productos/${p.id_producto}/imagenes`}>Galería</Link>
              <button className="btn" onClick={()=> onDelete(p.id_producto)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:"flex", gap:6, marginTop:12}}>
        <button className="btn" disabled={page<=1 || loading} onClick={()=> setParam("page", page-1)}>←</button>
        <span className="pill">Página {page} de {meta.totalPages}</span>
        <button className="btn" disabled={page>=meta.totalPages || loading} onClick={()=> setParam("page", page+1)}>→</button>
      </div>
    </div>
  );
}
