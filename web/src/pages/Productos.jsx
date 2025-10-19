// src/pages/Productos.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { useCategories } from "../hooks/useCategories.js";
import { imgSrc } from "../utils/img.js";
import { useFavs } from "../context/Favs.jsx";
import { useCart } from "../context/Cart.jsx";
import { useToast } from "../context/Toast.jsx";

/* ---------- UI ---------- */
function SkeletonCard(){
  return (
    <div className="card">
      <div className="skel skel-img"></div>
      <div className="skel skel-line"></div>
      <div className="skel skel-line sm"></div>
    </div>
  );
}

/* ---------- Mapeos UI → API ---------- */
function mapSortToOrder(sortUI){
  // UI: "newest" | "price_asc" | "price_desc" | "name_asc" | "name_desc"
  // API soportado: order = "precio_asc" | "precio_desc" (recientes por defecto)
  if (sortUI === "price_asc") return "precio_asc";
  if (sortUI === "price_desc") return "precio_desc";
  // Para "name_*" tu API no ordena por nombre; dejamos que el back ordene por defecto (recientes).
  return ""; // "" => no mandamos 'order' → back usa fecha desc
}

export default function Productos(){
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page:1, limit:12, total:0, totalPages:1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [sp, setSp] = useSearchParams();
  const q          = sp.get("q") || "";
  const sort       = sp.get("sort") || "newest";
  const categoria  = sp.get("categoria") || "";   // <- UI param
  const page       = Number(sp.get("page") || 1);
  const limit      = Number(sp.get("limit") || 12);

  const { cats, loading: loadingCats } = useCategories();
  const favs  = useFavs();
  const cart  = useCart();
  const toast = useToast();

  const activeCat = useMemo(() => Number(categoria || 0), [categoria]);

  function setParam(key, value){
    const next = new URLSearchParams(sp);
    if (value === "" || value == null) next.delete(key);
    else next.set(key, String(value));
    if (["q","sort","categoria","limit"].includes(key)) next.set("page","1");
    setSp(next);
  }

  async function load(){
    setLoading(true); setErr("");
    try{
      const params = new URLSearchParams();

      // búsqueda libre si la soportas en back (si no, quita esto)
      if(q) params.set("q", q);

      // mapear sort UI -> order API
      const order = mapSortToOrder(sort);
      if (order) params.set("order", order);

      // mapear categoria UI -> id_categoria API
      if (categoria) params.set("id_categoria", categoria);

      params.set("page", String(page));
      params.set("limit", String(limit));

      const data = await api(`/api/productos?${params.toString()}`);

      // tu back devuelve { items, page, limit, total, pages } o un array plano
      const arr = Array.isArray(data) ? data : (data.items || []);
      const total = Array.isArray(data) ? arr.length : (data.total ?? arr.length);
      const totalPages = Array.isArray(data)
        ? Math.max(Math.ceil(total / limit), 1)
        : (data.pages || data.totalPages || 1);

      setItems(arr);
      setMeta({ page, limit, total, totalPages });
    }catch(e){
      setErr(e?.message || "Error cargando productos");
      setItems([]); setMeta(prev=>({ ...prev, total:0, totalPages:1 }));
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [q, sort, categoria, page, limit]);

  return (
    <section className="container">
      <div className="section">
        <h1>Productos</h1>

        {/* Filtros rápidos */}
        <div style={{display:"flex", gap:8, flexWrap:"wrap", margin:"8px 0"}}>
          <input
            placeholder="Buscar..."
            defaultValue={q}
            onKeyDown={e=>{ if(e.key==="Enter") setParam("q", e.currentTarget.value); }}
            style={{minWidth:220}}
          />
          <select value={sort} onChange={e=>setParam("sort", e.target.value)}>
            <option value="newest">Más nuevos</option>
            <option value="price_asc">Precio ↑</option>
            <option value="price_desc">Precio ↓</option>
            {/* El back no ordena por nombre; si lo agregas luego, descomenta: */}
            {/* <option value="name_asc">Nombre A-Z</option>
            <option value="name_desc">Nombre Z-A</option> */}
          </select>
          <select value={String(limit)} onChange={e=>setParam("limit", Number(e.target.value))}>
            <option value="8">8 por página</option>
            <option value="12">12 por página</option>
            <option value="16">16 por página</option>
            <option value="24">24 por página</option>
          </select>
        </div>

        {/* Categorías dinámicas (pills) */}
        <div style={{display:"flex", gap:8, flexWrap:"wrap", margin:"8px 0"}}>
          <button
            type="button"
            className={`pill ${activeCat === 0 ? "active" : ""}`}
            onClick={()=> setParam("categoria","")}
          >
            Todas
          </button>

          {loadingCats ? (
            <>
              <span className="pill skel skel-line" style={{width:120}} />
              <span className="pill skel skel-line" style={{width:140}} />
            </>
          ) : (cats?.length ? (
            cats.map(c => (
              <button
                key={c.id_categoria}
                type="button"
                className={`pill ${activeCat === c.id_categoria ? "active" : ""}`}
                onClick={()=> setParam("categoria", c.id_categoria)}
              >
                {c.nombre_categoria}
              </button>
            ))
          ) : (
            <span className="hint">Sin categorías</span>
          ))}
        </div>

        {err && <p style={{color:"crimson"}}>{err}</p>}
        {!items.length && !loading && !err && <p>Sin resultados.</p>}

        {/* Grid de productos */}
        <div className="grid">
          {loading
            ? Array.from({ length: Number(limit) || 12 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)
            : items.map(p=>{
                const precio = Number(p?.precio ?? 0);
                const fav = favs.has(p.id_producto);
                return (
                  <div key={p.id_producto} className="card" style={{position:"relative"}}>
                    {/* favorito */}
                    <button
                      aria-label="Favorito"
                      onClick={(e)=>{ e.preventDefault(); favs.toggle(p.id_producto); }}
                      style={{
                        position:"absolute", top:8, right:8, border:"none", background:"white",
                        borderRadius:999, width:36, height:36, cursor:"pointer",
                        boxShadow:"0 1px 6px rgba(0,0,0,.12)"
                      }}
                      title={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      <span style={{fontSize:18, color: fav ? "crimson" : "#666"}}>♥</span>
                    </button>

                    <Link
                      to={`/producto/${p.id_producto}`}
                      style={{textDecoration:"none", color:"inherit", display:"block"}}
                    >
                      <img src={imgSrc(p.imagen_url)} alt={p.nombre_producto}/>
                      <h3>{p.nombre_producto || "Producto"}</h3>
                      <div className="price">${isFinite(precio) ? precio.toFixed(2) : "0.00"}</div>
                      {p.color && <small>Color: {p.color}</small>}
                    </Link>

                    <button
                      className="btn"
                      onClick={()=> {
                        cart.add(p, 1);
                        toast.show(`Añadido: "${p.nombre_producto}" al carrito.`, "ok");
                      }}
                      style={{marginTop:8, width:"100%"}}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                );
              })}
        </div>

        {/* Paginación */}
        <div style={{display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", margin:"16px 0"}}>
          <button className="btn" disabled={loading || page <= 1} onClick={()=> setParam("page", page - 1)}>
            ← Anterior
          </button>

          {Array.from({ length: meta.totalPages }).slice(
            Math.max(0, page - 4),
            Math.max(0, page - 4) + 7
          ).map((_, i) => {
            const n = Math.max(1, page - 3) + i;
            if (n > meta.totalPages) return null;
            const active = n === page;
            return (
              <button
                key={n}
                className="btn"
                style={active ? { filter:"brightness(.95)", fontWeight:700 } : {}}
                onClick={()=> setParam("page", n)}
                disabled={loading || active}
              >
                {n}
              </button>
            );
          })}

          <button className="btn" disabled={loading || page >= meta.totalPages} onClick={()=> setParam("page", page + 1)}>
            Siguiente →
          </button>

          <span style={{marginLeft:8, opacity:.7}}>
            Página {meta.page} de {meta.totalPages} · {meta.total} resultados
          </span>
        </div>
      </div>
    </section>
  );
}
