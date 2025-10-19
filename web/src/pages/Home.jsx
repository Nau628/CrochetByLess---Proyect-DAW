// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useCategories } from "../hooks/useCategories";
import s from "./Home.module.css";

// Mini-skeleton para ítems de “Novedades”
function NewsSkeletonItem(){
  return (
    <div className={`card ${s.newsItem}`}>
      <div className="skel" style={{width:90, aspectRatio:"3/2", borderRadius:8}} />
      <div style={{width:"100%"}}>
        <div className="skel skel-line" />
        <div className="skel skel-line sm" />
      </div>
    </div>
  );
}

export default function Home(){
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { cats, loading: loadingCats } = useCategories();

  async function loadNews(){
    setLoading(true);
    try{
      const data = await api("/api/productos?sort=newest");
      const arr = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
      setNews(arr.slice(0, 4));
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ loadNews(); }, []);

  return (
    <div className={`container ${s.root}`}>
      {/* ===== Pills de categorías (dinámicas) ===== */}
      <div className="section">
        <div className={s.pills}>
          {loadingCats && (
            <>
              <span className={`${s.pill} skel skel-line`} style={{width:120}} />
              <span className={`${s.pill} skel skel-line`} style={{width:140}} />
              <span className={`${s.pill} skel skel-line`} style={{width:110}} />
            </>
          )}
          {!loadingCats && cats.map(c => (
            <Link key={c.id_categoria} className={s.pill} to={`/catalogo?categoria=${c.id_categoria}`}>
              {c.nombre_categoria}
            </Link>
          ))}
          {!loadingCats && cats.length === 0 && (
            <span className="hint">Sin categorías</span>
          )}
        </div>
      </div>

      {/* ===== HERO: Bienvenida (izq) + Novedades (der) ===== */}
      <div className={`section ${s.hero}`}>
        {/* Izquierda: Bienvenida/CTA */}
        <article className="card">
          <div className={s.heroCard}>
            <img
              src="/img/logo.png"
              alt="Destacado Crochet By Less"
              className={s.heroImage}
            />
            <div>
              <h2>Bienvenido a Crochet By Less</h2>
              <p style={{marginTop:6, lineHeight:1.5}}>
                Descubre creaciones únicas, hechas a mano con dedicación y amor.
                Explora nuestro catálogo y personaliza tus pedidos a tu gusto.
              </p>
              <Link to="/catalogo" className="btn menta" style={{marginTop:10, display:"inline-block"}}>
                Ver catálogo
              </Link>
            </div>
          </div>
        </article>

        {/* Derecha: Novedades (con skeletons) */}
        <aside className="card">
          <h3 style={{marginTop:0}}>Novedades</h3>

          {loading ? (
            <div className={s.newsList}>
              {Array.from({length:4}).map((_,i)=> <NewsSkeletonItem key={`sk-${i}`} />)}
            </div>
          ) : news.length === 0 ? (
            <p style={{opacity:.8}}>
              Aún no hay novedades. Crea productos desde el admin o agrega algunos en la base de datos.
            </p>
          ) : (
            <div className={s.newsList}>
              {news.map(p=>{
                const precio = Number(p?.precio ?? 0);
                return (
                  <Link
                    key={p.id_producto}
                    to={`/producto/${p.id_producto}`}
                    className={`card ${s.newsItem}`}
                  >
                    <img
                      src={p.imagen_url || "https://via.placeholder.com/200x150"}
                      alt={p.nombre_producto}
                      className={s.newsThumb}
                    />
                    <div>
                      <div style={{fontWeight:700, marginBottom:4}}>{p.nombre_producto || "Producto"}</div>
                      <small style={{opacity:.8}}>
                        ${isFinite(precio) ? precio.toFixed(2) : "0.00"}
                      </small>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </aside>
      </div>

      {/* ===== Banner de envío ===== */}
      <div className="section">
        <div className="banner">Envío gratis en pedidos mayores a $20</div>
      </div>

      {/* ===== Tres tarjetas informativas ===== */}
      <div className={`section ${s.infoGrid}`}>
        <article className="card">
          <div style={{height:60, width:60, background:"var(--lila-claro)", borderRadius:12, marginBottom:8}} />
          <h3>Materiales de calidad</h3>
          <p>Utilizamos hilos y accesorios seleccionados para un acabado profesional.</p>
        </article>
        <article className="card">
          <div style={{height:60, width:60, background:"var(--lila-claro)", borderRadius:12, marginBottom:8}} />
          <h3>Personaliza tu pedido</h3>
          <p>Elige color y detalles. Hacemos realidad tu idea.</p>
        </article>
        <article className="card">
          <div style={{height:60, width:60, background:"var(--lila-claro)", borderRadius:12, marginBottom:8}} />
          <h3>Entrega y envíos</h3>
          <p>Retiro en punto fijo o envío a domicilio según tu preferencia.</p>
        </article>
      </div>

      {/* ===== Extras (2 bloques) ===== */}
      <div className={`section ${s.extraGrid}`}>
        <article className="card">
          <div style={{height:60, width:60, background:"var(--lila-claro)", borderRadius:12, marginBottom:8}} />
          <h3>Cuidados</h3>
          <p>Recomendaciones para mantener tus piezas como nuevas por más tiempo.</p>
        </article>
        <article className="card">
          <div style={{height:60, width:60, background:"var(--lila-claro)", borderRadius:12, marginBottom:8}} />
          <h3>Mayoristas / Eventos</h3>
          <p>Pedidos al por mayor para regalos, eventos o empresas. ¡Consúltanos!</p>
        </article>
      </div>

      <footer className="section" style={{opacity:.8, fontSize:13}}>
        © {new Date().getFullYear()} Crochet By Less — Todos los derechos reservados
      </footer>
    </div>
  );
}
