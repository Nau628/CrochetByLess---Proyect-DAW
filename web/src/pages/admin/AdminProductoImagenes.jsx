// web/src/pages/admin/AdminProductoImagenes.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api.js";
import { imgSrc } from "../../utils/img.js";

export default function AdminProductoImagenes(){
  const { id } = useParams();
  const [prod, setProd] = useState(null);
  const [imgs, setImgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const dragIndex = useRef(null);

  async function load(){
    setLoading(true); setErr("");
    try{
      const p = await api(`/api/productos/${id}`);
      const arr = await api(`/api/productos/${id}/imagenes`);
      setProd(p);
      setImgs(Array.isArray(arr) ? arr : []);
    }catch(e){ setErr(e?.message || "Error cargando"); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); }, [id]);

  async function onUpload(e){
    const f = e.target.files;
    if (!f || !f.length) return;
    const form = new FormData();
    Array.from(f).forEach(file => form.append("files", file));
    try{
      await fetch(`/api/productos/${id}/imagenes`, { method: "POST", body: form })
        .then(async r=>{ if(!r.ok) throw new Error(await r.text()); });
      e.target.value = null;
      await load();
    }catch(err){ alert(err.message || "No se pudo subir"); }
  }

  async function onDelete(idImg){
    if (!confirm("¿Eliminar imagen?")) return;
    try{
      await api(`/api/productos/${id}/imagenes/${idImg}`, { method: "DELETE" });
      await load();
    }catch(e){ alert(e?.message || "No se pudo borrar"); }
  }

  async function persistOrder(next){
    const ordenPayload = next.map((x, k)=> ({ id_imagen: x.id_imagen, orden: k+1 }));
    try{
      await api(`/api/productos/${id}/imagenes/orden`, { method:"PUT", body:{ orden: ordenPayload } });
    }catch(e){ alert(e?.message || "No se pudo reordenar"); }
  }

  // Drag & Drop
  function onDragStart(e, index){
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e){ e.preventDefault(); }
  async function onDrop(e, overIndex){
    e.preventDefault();
    const from = dragIndex.current;
    if (from == null || from === overIndex) return;
    const next = [...imgs];
    const [moved] = next.splice(from, 1);
    next.splice(overIndex, 0, moved);
    setImgs(next);
    dragIndex.current = null;
    await persistOrder(next);
  }

  async function setPrincipal(idImg){
    try{
      await api(`/api/productos/${id}/imagenes/${idImg}/principal`, { method:"PUT" });
      await load();
      alert("Imagen principal actualizada");
    }catch(e){ alert(e?.message || "No se pudo fijar principal"); }
  }

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>
        Galería del producto #{id}{prod?.nombre_producto ? ` — ${prod.nombre_producto}` : ""}
      </h2>
      {prod?.imagen_url && (
        <div className="hint" style={{marginBottom:8}}>
          Principal actual: <code>{prod.imagen_url}</code>
        </div>
      )}

      <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:10}}>
        <label className="btn">
          Subir imágenes
          <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={onUpload} />
        </label>
        <span className="hint">Arrastra tarjetas para reordenar · Click “Principal” para fijarla como portada</span>
      </div>

      {err && <p style={{color:"crimson"}}>{err}</p>}
      {loading ? (
        <div className="skel skel-line" style={{height:40}}/>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(170px, 1fr))", gap:12}}>
          {imgs.map((im, idx)=>(
            <div
              key={im.id_imagen}
              className="card"
              draggable
              onDragStart={(e)=> onDragStart(e, idx)}
              onDragOver={onDragOver}
              onDrop={(e)=> onDrop(e, idx)}
              style={{padding:8, borderStyle:"dashed"}}
              title="Arrastra para reordenar"
            >
              <img
                src={imgSrc(im.url)}
                alt={`img-${im.id_imagen}`}
                style={{width:"100%", aspectRatio:"1/1", objectFit:"cover", borderRadius:8}}
              />
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8}}>
                <div className="hint">#{im.orden}</div>
                <div style={{display:"flex", gap:6}}>
                  <button className="btn" onClick={()=> setPrincipal(im.id_imagen)}>Principal</button>
                  <button className="btn" onClick={()=> onDelete(im.id_imagen)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
          {!imgs.length && <div className="hint">Aún no hay imágenes.</div>}
        </div>
      )}
    </div>
  );
}
