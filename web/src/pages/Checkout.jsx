// src/pages/Checkout.jsx
import { useState, useMemo } from "react";
import { useCart } from "../context/Cart.jsx";

export default function Checkout(){
  const { items, subtotal, clear } = useCart();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodo, setMetodo] = useState("retiro"); // retiro | envio
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");


  const valido = useMemo(()=> {
    if (!items.length) return false;
    if (!nombre.trim() || !telefono.trim()) return false;
    if (metodo === "envio" && !direccion.trim()) return false;
    return true;
  }, [items, nombre, telefono, metodo, direccion]);

  function toWA(){
    const lines = [];
    lines.push(`Nuevo pedido Crochet By Less`);
    lines.push(`Nombre: ${nombre}`);
    lines.push(`Teléfono: ${telefono}`);
    lines.push(`Método: ${metodo === "envio" ? "Envío" : "Retiro"}`);
    if (metodo === "envio") lines.push(`Dirección: ${direccion}`);
    if (notas.trim()) lines.push(`Notas: ${notas}`);
    lines.push(`---`);
    items.forEach(it=>{
      lines.push(`• ${it.nombre_producto} x${it.qty} - $${Number(it.precio||0).toFixed(2)}`);
    });
    lines.push(`Subtotal: $${subtotal.toFixed(2)}`);

    const msg = encodeURIComponent(lines.join("\n"));
    // Número de la empresa (ya lo tienes): 50361739697
    const url = `https://wa.me/50361739697?text=${msg}`;
    window.open(url, "_blank");
  }

  return (
    <div className="container section">
      <h1>Checkout</h1>
      {!items.length && <p>Tu carrito está vacío.</p>}

      {!!items.length && (
        <div className="card" style={{display:"grid", gap:12, maxWidth:720}}>
          <label>Nombre completo
            <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre"/>
          </label>
          <label>Teléfono
            <input value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="Tu número"/>
          </label>

          <div>
            <label style={{display:"block"}}><b>Método de entrega</b></label>
            <label style={{display:"inline-flex", gap:6, marginRight:12}}>
              <input type="radio" name="metodo" value="retiro" checked={metodo==="retiro"} onChange={()=>setMetodo("retiro")} />
              Retiro en punto acordado
            </label>
            <label style={{display:"inline-flex", gap:6}}>
              <input type="radio" name="metodo" value="envio" checked={metodo==="envio"} onChange={()=>setMetodo("envio")} />
              Envío a domicilio
            </label>
          </div>

          {metodo === "envio" && (
            <label>Dirección de envío
              <textarea value={direccion} onChange={e=>setDireccion(e.target.value)} rows={3} placeholder="Colonia, calle, referencias..."/>
            </label>
          )}

          <label>Notas del pedido
            <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={3} placeholder="Colores, medidas, indicaciones..."/>
          </label>

          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div><b>Subtotal:</b> ${subtotal.toFixed(2)}</div>
            <div style={{display:"flex", gap:8}}>
              <button className="btn" onClick={clear}>Vaciar carrito</button>
              <button className="btn menta" disabled={!valido} onClick={toWA}>
                Enviar pedido por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
