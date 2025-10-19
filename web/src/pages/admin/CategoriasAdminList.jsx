// web/src/pages/admin/CategoriasAdminList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";

export default function CategoriasAdminList(){
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load(){
    setLoading(true); setErr("");
    try{
      const data = await api("/api/categorias");
      setCats(Array.isArray(data) ? data : []);
    }catch(e){
      setErr(e?.message || "Error cargando categorías");
      setCats([]);
    }finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  async function onDelete(id){
    if (!confirm("¿Eliminar categoría? (No debe tener productos asociados)")) return;
    try{
      await api(`/api/categorias/${id}`, { method:"DELETE" });
      await load();
    }catch(e){
      alert(e?.message || "No se pudo eliminar");
    }
  }

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <h2 style={{margin:0}}>Categorías</h2>
        <Link to="/admin/categorias/nueva" className="btn menta">Nueva</Link>
      </div>

      {err && <p style={{color:"crimson"}}>{err}</p>}
      {loading ? (
        <div className="skel skel-line" style={{height:40}} />
      ) : (
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={{textAlign:"left"}}>ID</th>
              <th style={{textAlign:"left"}}>Nombre</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cats.map(c => (
              <tr key={c.id_categoria}>
                <td>{c.id_categoria}</td>
                <td>{c.nombre_categoria}</td>
                <td style={{textAlign:"right"}}>
                  <Link className="btn" to={`/admin/categorias/${c.id_categoria}/editar`}>Editar</Link>{" "}
                  <button className="btn" onClick={()=> onDelete(c.id_categoria)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
