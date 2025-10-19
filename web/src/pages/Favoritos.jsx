// src/pages/Favoritos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useFavs } from "../context/Favs.jsx";
import { imgSrc } from "../utils/img.js";

export default function Favoritos(){
  const { ids, remove } = useFavs();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=> {
    let on = true;
    (async ()=>{
      setLoading(true);
      try{
        // Carga básica: traer todos y filtrar en front (simple y suficiente)
        const data = await api(`/api/productos?limit=200&page=1`);
        const arr = Array.isArray(data) ? data : (data.items || []);
        const filtered = arr.filter(p => ids.includes(p.id_producto));
        if (on) setItems(filtered);
      } finally { if (on) setLoading(false); }
    })();
    return ()=>{ on = false; };
  }, [ids]);

  return (
    <div className="container section">
      <h1>Mis favoritos</h1>
      {!ids.length && <p>No tienes productos en favoritos.</p>}
      <div className="grid">
        {loading
          ? Array.from({length:8}).map((_,i)=>(
              <div className="card" key={`sk-${i}`}>
                <div className="skel skel-img"></div>
                <div className="skel skel-line"></div>
              </div>
            ))
          : items.map(p=>{
              const precio = Number(p?.precio ?? 0);
              return (
                <div className="card" key={p.id_producto}>
                  <Link to={`/producto/${p.id_producto}`} style={{textDecoration:"none", color:"inherit", display:"block"}}>
                    <img src={imgSrc(p.imagen_url)} alt={p.nombre_producto}/>
                    <h3>{p.nombre_producto}</h3>
                    <div className="price">${isFinite(precio) ? precio.toFixed(2) : "0.00"}</div>
                  </Link>
                  <button className="btn" onClick={()=>remove(p.id_producto)} style={{marginTop:8}}>
                    Quitar
                  </button>
                </div>
              );
            })}
      </div>
    </div>
  );
}
