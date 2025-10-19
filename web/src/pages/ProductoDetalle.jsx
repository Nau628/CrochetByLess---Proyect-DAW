// src/pages/ProductoDetalle.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api.js";
import { imgSrc } from "../utils/img.js";
import { useFavs } from "../context/Favs.jsx";
import { useCart } from "../context/Cart.jsx";
import { useToast } from "../context/Toast.jsx";

export default function ProductoDetalle(){
  const { id } = useParams();
  const [prod, setProd] = useState(null);
  const [imgs, setImgs] = useState([]); // {url}[]
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const favs = useFavs();
  const cart = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);

  // Modal (zoom)
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ dragging:false, startX:0, startY:0, origX:0, origY:0 });

  const mainUrl = useMemo(() => imgs[active]?.url ?? "/img/placeholder-300x200.png", [imgs, active]);

  useEffect(() => {
    let on = true;
    (async ()=>{
      try{
        setLoading(true); setErr("");

        const p = await api(`/api/productos/${id}`);
        if (!on) return;

        let arr = [];
        try { arr = await api(`/api/productos/${id}/imagenes`); } catch {}
        const normalized = (Array.isArray(arr) && arr.length)
          ? arr.map(x => ({ url: imgSrc(x.url) }))
          : [{ url: imgSrc(p?.imagen_url) }];

        setProd(p);
        setImgs(normalized);
        setActive(0);
      }catch(e){
        if (on) setErr(e?.message || "Error cargando detalle");
      }finally{
        if (on) setLoading(false);
      }
    })();
    return ()=>{ on = false; };
  }, [id]);

  // Navegación del modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, active, imgs.length]);

  function prev(){
    if (imgs.length < 2) return;
    setActive(a => (a - 1 + imgs.length) % imgs.length);
    resetZoom();
  }
  function next(){
    if (imgs.length < 2) return;
    setActive(a => (a + 1) % imgs.length);
    resetZoom();
  }
  function resetZoom(){
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    dragRef.current = { dragging:false, startX:0, startY:0, origX:0, origY:0 };
  }
  function openModal(){ setOpen(true); resetZoom(); }
  function closeModal(){ setOpen(false); resetZoom(); }

  // Drag para pan al hacer zoom
  function onMouseDown(e){
    if (zoom === 1) return;
    e.preventDefault();
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y
    };
  }
  function onMouseMove(e){
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  }
  function onMouseUp(){ dragRef.current.dragging = false; }
  function onDoubleClick(){ zoom === 1 ? setZoom(2) : resetZoom(); }

  if (loading) {
    return (
      <div className="container section">
        <div className="card" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
          <div className="skel" style={{aspectRatio:"1/1", borderRadius:12}}/>
          <div>
            <div className="skel skel-line" style={{height:24, width:"60%"}}/>
            <div className="skel skel-line" />
            <div className="skel skel-line sm" />
            <div className="skel" style={{height:40, width:180, marginTop:12, borderRadius:8}}/>
          </div>
        </div>
      </div>
    );
  }

  if (err) return <div className="container section"><p style={{color:"crimson"}}>{err}</p></div>;
  if (!prod) return <div className="container section"><p>No encontrado.</p></div>;

  const precio = Number(prod?.precio ?? 0);
  const isFav = favs.has(prod.id_producto);

  return (
    <div className="container section">
      <div className="card" style={{display:"grid", gridTemplateColumns:"minmax(260px, 520px) 1fr", gap:24}}>
        {/* Galería */}
        <div>
          <div
            style={{borderRadius:12, overflow:"hidden", border:"1px solid var(--border)", cursor:"zoom-in"}}
            onClick={openModal}
            title="Ampliar"
          >
            <img
              key={mainUrl}
              src={mainUrl}
              alt={prod.nombre_producto}
              style={{width:"100%", display:"block", objectFit:"cover"}}
              onError={(e)=>{ e.currentTarget.src="/img/placeholder-300x200.png"; }}
            />
          </div>

          {imgs.length > 1 && (
            <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap"}}>
              {imgs.map((im, i) => (
                <button
                  key={i}
                  onClick={()=> { setActive(i); resetZoom(); }}
                  aria-label={`Ver imagen ${i+1}`}
                  style={{
                    border: i===active ? "2px solid var(--menta)" : "1px solid var(--border)",
                    padding:0, background:"transparent",
                    borderRadius:10, overflow:"hidden", width:72, height:72, cursor:"pointer"
                  }}>
                  <img
                    src={im.url}
                    alt={`mini ${i+1}`}
                    style={{width:"100%", height:"100%", objectFit:"cover"}}
                    onError={(e)=>{ e.currentTarget.src="/img/placeholder-300x200.png"; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h2 style={{marginTop:0, display:"flex", alignItems:"center", gap:10}}>
            {prod.nombre_producto}
            <button
              onClick={()=>favs.toggle(prod.id_producto)}
              title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
              style={{border:"1px solid var(--border)", background:"#fff", borderRadius:999, width:32, height:32, cursor:"pointer"}}
            >
              <span style={{color: isFav ? "crimson" : "#666"}}>♥</span>
            </button>
          </h2>

          <div className="price" style={{fontSize:20}}>
            ${isFinite(precio) ? precio.toFixed(2) : "0.00"}
          </div>

          {prod.color && <p><b>Color:</b> {prod.color}</p>}
          {prod.descripcion && <p style={{opacity:.9, lineHeight:1.6}}>{prod.descripcion}</p>}

          {/* Cantidad + Carrito */}
          <div style={{display:"flex", gap:8, alignItems:"center", marginTop:12}}>
            <label>Cantidad</label>
            <input
              type="number" min={1} max={99} value={qty}
              onChange={e=> setQty(Math.max(1, Math.min(99, Number(e.target.value)||1)))}
              style={{width:80}}
            />
            <button className="btn" onClick={()=> cart.add(prod, qty)}>Agregar al carrito</button>
          </div>

          {/* CTA WhatsApp */}
          <a
            className="btn menta"
            href={`https://wa.me/50361739697?text=${encodeURIComponent(
              `Hola, quiero información del producto "${prod.nombre_producto}" (ID: ${prod.id_producto}).`
            )}`}
            target="_blank" rel="noreferrer"
            style={{display:"inline-flex", gap:8, alignItems:"center", marginTop:8}}
          >
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ===== Modal de zoom ===== */}
      {open && (
        <div
          className="zoom-backdrop"
          onClick={closeModal}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <button className="zoom-close" onClick={closeModal} aria-label="Cerrar">✕</button>

          {imgs.length > 1 && (
            <>
              <button className="zoom-nav prev" onClick={(e)=>{ e.stopPropagation(); prev(); }} aria-label="Anterior">‹</button>
              <button className="zoom-nav next" onClick={(e)=>{ e.stopPropagation(); next(); }} aria-label="Siguiente">›</button>
            </>
          )}

          <div className="zoom-stage" onClick={(e)=>e.stopPropagation()}>
            <img
              src={mainUrl}
              alt={prod.nombre_producto}
              className="zoom-img"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                cursor: zoom === 1 ? "zoom-in" : (dragRef.current.dragging ? "grabbing" : "grab")
              }}
              onDoubleClick={onDoubleClick}
              onMouseDown={onMouseDown}
              onError={(e)=>{ e.currentTarget.src="/img/placeholder-300x200.png"; }}
            />
          </div>

          <div className="zoom-help">
            Doble clic: 1×/2× · Arrastra para mover · ESC para cerrar
          </div>
        </div>
      )}
    </div>
  );
}
