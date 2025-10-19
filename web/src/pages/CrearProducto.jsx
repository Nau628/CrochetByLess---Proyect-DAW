import { useState } from "react";
import { api } from "../api";

export default function CrearProducto(){
  const [form, setForm] = useState({ nombre_producto:"", precio:"", stock:"" });
  const [msg, setMsg] = useState("");

  function set(k, v){ setForm(prev => ({ ...prev, [k]: v })); }

  async function onSubmit(e){
    e.preventDefault();
    setMsg("");
    try{
      const created = await api("/api/productos", { method:"POST", auth:true, body:{
        nombre_producto: form.nombre_producto,
        precio: Number(form.precio),
        stock: Number(form.stock || 0),
        descripcion: form.descripcion || null,
        color: form.color || null,
        imagen_url: form.imagen_url || null,
        id_categoria: form.id_categoria ? Number(form.id_categoria) : null
      }});
      setMsg("Creado: " + created.id_producto);
    }catch(e){
      setMsg(e?.message || "Error");
    }
  }

  return (
    <form onSubmit={onSubmit} style={{maxWidth:520}}>
      <h1>Crear producto</h1>
      <input placeholder="Nombre" value={form.nombre_producto} onChange={e=>set("nombre_producto", e.target.value)} style={{display:"block", width:"100%", margin:"8px 0"}}/>
      <input placeholder="Precio" value={form.precio} onChange={e=>set("precio", e.target.value)} style={{display:"block", width:"100%", margin:"8px 0"}}/>
      <input placeholder="Stock" value={form.stock} onChange={e=>set("stock", e.target.value)} style={{display:"block", width:"100%", margin:"8px 0"}}/>
      <input placeholder="Color (opcional)" value={form.color||""} onChange={e=>set("color", e.target.value)} style={{display:"block", width:"100%", margin:"8px 0"}}/>
      <input placeholder="URL imagen (opcional)" value={form.imagen_url||""} onChange={e=>set("imagen_url", e.target.value)} style={{display:"block", width:"100%", margin:"8px 0"}}/>
      <input placeholder="ID categoría (opcional)" value={form.id_categoria||""} onChange={e=>set("id_categoria", e.target.value)} style={{display:"block", width:"100%", margin:"8px 0"}}/>
      <textarea placeholder="Descripción (opcional)" value={form.descripcion||""} onChange={e=>set("descripcion", e.target.value)} style={{display:"block", width:"100%", margin:"8px 0"}}/>
      <button>Guardar</button>
      {msg && <p style={{marginTop:8}}>{msg}</p>}
      <p style={{opacity:.7, marginTop:8}}>Necesitas estar logueado. Si ves 401/403, inicia sesión en /login.</p>
    </form>
  );
}
