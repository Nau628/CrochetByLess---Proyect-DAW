import { useState } from "react";
import { api } from "../../api";

export default function AdminCrearProducto(){
  const [f, setF] = useState({ nombre_producto:"", precio:"", stock:0, id_categoria:"", descripcion:"", color:"", imagen_url:"" });
  const [msg, setMsg] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setMsg("");
    const body = {
      nombre_producto: f.nombre_producto,
      precio: Number(f.precio),
      stock: Number(f.stock),
      id_categoria: f.id_categoria ? Number(f.id_categoria) : null,
      descripcion: f.descripcion || null,
      color: f.color || null,
      imagen_url: f.imagen_url || null
    };
    await api("/api/productos", { method: "POST", body });
    setMsg("Producto creado");
  }

  return (
    <div className="container">
      <div className="section card" style={{maxWidth:620, margin:"0 auto"}}>
        <h2>Crear producto</h2>
        <form onSubmit={onSubmit}>
          <div className="field"><label>Nombre</label><input value={f.nombre_producto} onChange={e=>setF({...f, nombre_producto:e.target.value})} /></div>
          <div className="field"><label>Precio</label><input value={f.precio} onChange={e=>setF({...f, precio:e.target.value})} /></div>
          <div className="field"><label>Stock</label><input value={f.stock} onChange={e=>setF({...f, stock:e.target.value})} /></div>
          <div className="field"><label>ID Categoría</label><input value={f.id_categoria} onChange={e=>setF({...f, id_categoria:e.target.value})} /></div>
          <div className="field"><label>Color</label><input value={f.color} onChange={e=>setF({...f, color:e.target.value})} /></div>
          <div className="field"><label>Imagen URL</label><input value={f.imagen_url} onChange={e=>setF({...f, imagen_url:e.target.value})} /></div>
          <div className="field"><label>Descripción</label><textarea rows={4} value={f.descripcion} onChange={e=>setF({...f, descripcion:e.target.value})} /></div>
          <button className="btn menta">Guardar</button>
          {msg && <p style={{color:"#1a7f5a"}}>{msg}</p>}
        </form>
      </div>
    </div>
  );
}
