// web/src/App.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Home from "./pages/Home.jsx";
import Productos from "./pages/Productos.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Personalizados from "./pages/Personalizados.jsx";
import Contacto from "./pages/Contacto.jsx";
import Carrito from "./pages/Carrito.jsx";          // si aún no lo tienes, comenta esta línea y su ruta
import Checkout from "./pages/Checkout.jsx";        // si aún no lo tienes, comenta esta línea y su ruta
import Login from "./pages/Login.jsx";
import AdminPedidos from "./pages/admin/AdminPedidos.jsx"; // requiere el archivo que te pasé
import { useAuth } from "./hooks/useAuth";
import "./theme.css";

// Layout base con Nav arriba
function Layout() {
  return (
    <>
      <Nav />
      <main className="container section">
        <Outlet />
      </main>
      <footer className="container section" style={{ opacity: .8, fontSize: 14 }}>
        © {new Date().getFullYear()} Crochet By Less — Hecho con ♥
      </footer>
    </>
  );
}

// Guard de Admin
function RequireAdmin({ children }) {
  const { token, isAdmin } = useAuth();
  if (!token || !isAdmin) {
    return <Navigate to="/login" replace state={{ from: "/admin/pedidos" }} />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/catalogo" element={<Productos />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/personalizados" element={<Personalizados />} />
        <Route path="/contacto" element={<Contacto />} />

        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin/pedidos"
          element={
            <RequireAdmin>
              <AdminPedidos />
            </RequireAdmin>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
