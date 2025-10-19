// web/src/hooks/useCategories.js
import { useEffect, useState } from "react";
import { api } from "../api";

export function useCategories(){
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(()=>{
    let on = true;
    (async ()=>{
      setLoading(true); setErr("");
      try{
        const data = await api("/api/categorias");
        if (on) setCats(Array.isArray(data) ? data : []);
      }catch(e){
        if (on) setErr(e?.message || "Error cargando categorías");
      }finally{
        if (on) setLoading(false);
      }
    })();
    return ()=>{ on = false; };
  }, []);

  return { cats, loading, err };
}
