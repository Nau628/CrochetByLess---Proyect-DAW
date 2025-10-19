// web/src/utils/cart.js
const KEY = "cart";

export function readCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
export function writeCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  // notifica a Nav y demás listeners
  window.dispatchEvent(new Event("cart:update"));
}
export function clearCart() { writeCart([]); }

export function addToCart(prod, qty = 1) {
  const items = readCart();
  const id = Number(prod.id_producto ?? prod.id);
  const i = items.findIndex(it => Number(it.id_producto) === id);
  if (i >= 0) {
    items[i].qty = Math.min(99, Number(items[i].qty || 1) + Number(qty || 1));
  } else {
    items.push({
      id_producto: id,
      nombre_producto: prod.nombre_producto,
      precio: Number(prod.precio || 0),
      imagen_url: prod.imagen_url || "",
      qty: Number(qty || 1)
    });
  }
  writeCart(items);
}

export function updateQty(id_producto, qty) {
  const items = readCart();
  const i = items.findIndex(it => Number(it.id_producto) === Number(id_producto));
  if (i >= 0) {
    const q = Math.max(1, Math.min(99, Number(qty || 1)));
    items[i].qty = q;
    writeCart(items);
  }
}

export function removeFromCart(id_producto) {
  const items = readCart().filter(it => Number(it.id_producto) !== Number(id_producto));
  writeCart(items);
}

export function totals() {
  const items = readCart();
  const subtotal = items.reduce((s, it) => s + Number(it.precio) * Number(it.qty || 1), 0);
  return { items, subtotal, total: subtotal }; // sin envío/impuestos
}
