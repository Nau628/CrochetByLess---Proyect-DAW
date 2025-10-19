// web/src/components/Nav.jsx
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/Auth.jsx";
// Si no usas carrito, comenta las 2 líneas con useCart y el link de Carrito
import { useCart } from "../context/Cart.jsx";

export default function Nav(){
  const [open, setOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { count = 0 } = useCart?.() || {};

  function close() { setOpen(false); }

  return (
    <header className="nav">
      <div className="container nav-row">
        <Link to="/" className="brand" onClick={close}>
          <img src="/img/logo.png" alt="Crochet by Less" />
          <span>Crochet By Less</span>
        </Link>

        <button className="hamb" onClick={()=> setOpen(v=>!v)} aria-label="Menú">
          ☰
        </button>

        <nav className={`menu ${open ? "open" : ""}`} onClick={close}>
          <ul>
            <li><NavLink to="/" end>Inicio</NavLink></li>
            <li><NavLink to="/catalogo">Catálogo</NavLink></li>
            <li><NavLink to="/personalizados">Personalizados</NavLink></li>
            <li><NavLink to="/contacto">Contacto</NavLink></li>
            {isAdmin && <li><NavLink to="/admin">Admin</NavLink></li>}
            <li className="menu-right">
              <NavLink to="/carrito" className="icon-link">
                Carrito {count > 0 && <span className="badge">{count}</span>}
              </NavLink>
            </li>
            <li>
              {!user ? (
                <NavLink to="/login" className="linklike">Iniciar sesión</NavLink>
              ) : (
                <button type="button" className="linklike" onClick={logout}>
                  Cerrar sesión
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
