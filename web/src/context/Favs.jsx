// src/context/Favs.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavsCtx = createContext(null);

export function FavsProvider({ children }) {
  const [ids, setIds] = useState(()=> {
    try { return JSON.parse(localStorage.getItem("favs") || "[]"); }
    catch { return []; }
  });

  useEffect(()=> {
    localStorage.setItem("favs", JSON.stringify(ids));
  }, [ids]);

  const has = (id)=> ids.includes(id);
  const add = (id)=> setIds(prev => has(id) ? prev : [...prev, id]);
  const remove = (id)=> setIds(prev => prev.filter(x => x !== id));
  const toggle = (id)=> has(id) ? remove(id) : add(id);

  const value = useMemo(()=>({ ids, has, add, remove, toggle }), [ids]);
  return <FavsCtx.Provider value={value}>{children}</FavsCtx.Provider>;
}

export function useFavs(){ return useContext(FavsCtx); }
