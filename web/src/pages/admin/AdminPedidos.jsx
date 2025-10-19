// web/src/pages/admin/AdminPedidos.jsx
import { useEffect, useState, useMemo } from "react";
import { getToken } from "../../hooks/useAuth";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminPedidos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const token = getToken();

  const grouped = useMemo(() => {
    const g = { pendiente: [], en_proceso: [], completado: [] };
    for (const it of items) (g[it.estado] || g.pendiente).push(it);
    return g;
  }, [items]);

  async function fetchData() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API}/api/pedidos-personalizados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error cargando pedidos");
      setItems(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function cambiarEstado(id_pedido, estado) {
    try {
      const res = await fetch(`${API}/api/pedidos-personalizados/${id_pedido}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar");
      setItems(prev => prev.map(p => p.id_pedido === id_pedido ? data : p));
    } catch (e) {
      alert(e.message);
    }
  }

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="container section">
      <h2>Pedidos personalizados</h2>
      {err && <div className="toast err" style={{margin:"8px 0"}}>{err}</div>}
      {loading && <div className="card">Cargando...</div>}

      {!loading && (
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          {["pendiente","en_proceso","completado"].map(st => (
            <div className="card" key={st}>
              <h3 style={{ marginTop:0, textTransform:"capitalize" }}>
                {st.replace("_"," ")} ({grouped[st].length})
              </h3>
              <div style={{ display:"grid", gap:10 }}>
                {grouped[st].map(p => (
                  <div key={p.id_pedido} className="card" style={{padding:10}}>
                    <div style={{display:"grid", gap:6}}>
                      <div><b>Pedido #{p.id_pedido}</b> • {new Date(p.fecha_pedido).toLocaleString()}</div>
                      {p.nombre_producto && <div>Producto: {p.nombre_producto}</div>}
                      <div>Cliente: {p.nombre_cliente} — {p.telefono_cliente}</div>
                      {p.color_preferido && <div>Color: {p.color_preferido}</div>}
                      {p.descripcion_detalle && <div>Detalle: {p.descripcion_detalle}</div>}
                      {p.imagen_referencia && (
                        <div>Ref: <a href={p.imagen_referencia} target="_blank">ver imagen</a></div>
                      )}
                      {p.whatsapp && (
                        <div><a className="btn menta" href={p.whatsapp} target="_blank">Abrir WhatsApp</a></div>
                      )}
                      <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                        <button className="pill" onClick={()=>cambiarEstado(p.id_pedido, "pendiente")}>Pendiente</button>
                        <button className="pill" onClick={()=>cambiarEstado(p.id_pedido, "en_proceso")}>En proceso</button>
                        <button className="pill" onClick={()=>cambiarEstado(p.id_pedido, "completado")}>Completado</button>
                      </div>
                    </div>
                  </div>
                ))}
                {grouped[st].length === 0 && <div className="hint">Sin pedidos en este estado.</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
