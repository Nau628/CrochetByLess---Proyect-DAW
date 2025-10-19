// src/context/Cart.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(()=> {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); }
    catch { return []; }
  });

  useEffect(()=> {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  function add(product, qty = 1){
    setItems(prev => {
      const idx = prev.findIndex(x => x.id_producto === product.id_producto);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: Math.min(99, copy[idx].qty + qty) };
        return copy;
      }
      return [...prev, { ...product, qty: Math.max(1, Math.min(99, qty)) }];
    });
  }
  function remove(id){ setItems(prev => prev.filter(x => x.id_producto !== id)); }
  function setQty(id, qty){
    setItems(prev => prev.map(x => x.id_producto === id ? { ...x, qty: Math.max(1, Math.min(99, qty)) } : x));
  }
  function clear(){ setItems([]); }

  const count = items.reduce((a,b)=> a + b.qty, 0);
  const subtotal = items.reduce((a,b)=> a + (Number(b.precio||0) * b.qty), 0);
  const value = useMemo(()=>({ items, add, remove, setQty, clear, count, subtotal }), [items, count, subtotal]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export function useCart(){ return useContext(CartCtx); }
