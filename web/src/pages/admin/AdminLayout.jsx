// web/src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout(){
  return (
    <div className="container section">
      <div className="card" style={{marginBottom:12, display:"flex", gap:8, flexWrap:"wrap"}}>
        <NavLink to="/admin/productos" className={({isActive}) => isActive ? "pill active" : "pill"}>Productos</NavLink>
        <NavLink to="/admin/productos/nuevo" className={({isActive}) => isActive ? "pill active" : "pill"}>Nuevo producto</NavLink>
        <span style={{opacity:.4}}>|</span>
        <NavLink to="/admin/categorias" className={({isActive}) => isActive ? "pill active" : "pill"}>Categorías</NavLink>
        <NavLink to="/admin/categorias/nueva" className={({isActive}) => isActive ? "pill active" : "pill"}>Nueva categoría</NavLink>
      </div>
      <Outlet />
    </div>
  );
}
