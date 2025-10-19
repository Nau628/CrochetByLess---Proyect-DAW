// src/pages/Carrito.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/Cart.jsx";
import { imgSrc } from "../utils/img.js";

export default function Carrito(){
  const { items, remove, setQty, subtotal, clear } = useCart();
  const nav = useNavigate();

  return (
    <div className="container section">
      <h1>Carrito</h1>
      {!items.length && (
        <p>Tu carrito está vacío. <Link to="/catalogo">Ver catálogo</Link></p>
      )}

      {!!items.length && (
        <>
          <div className="card">
            <table style={{width:"100%", borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th style={{textAlign:"left"}}>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(it=>{
                  const precio = Number(it.precio||0);
                  const total = precio * it.qty;
                  return (
                    <tr key={it.id_producto}>
                      <td style={{display:"flex", alignItems:"center", gap:10, padding:"8px 0"}}>
                        <img src={imgSrc(it.imagen_url)} alt={it.nombre_producto} style={{width:60, height:60, objectFit:"cover", borderRadius:8}}/>
                        <div>
                          <Link to={`/producto/${it.id_producto}`} style={{textDecoration:"none"}}>{it.nombre_producto}</Link>
                          {it.color && <div className="hint">Color: {it.color}</div>}
                        </div>
                      </td>
                      <td>
                        <input type="number" min={1} max={99} value={it.qty}
                          onChange={e=> setQty(it.id_producto, Number(e.target.value)||1)}
                          style={{width:70}}
                        />
                      </td>
                      <td>${precio.toFixed(2)}</td>
                      <td>${total.toFixed(2)}</td>
                      <td><button className="btn" onClick={()=> remove(it.id_producto)}>Quitar</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card" style={{marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontWeight:700}}>Subtotal: ${subtotal.toFixed(2)}</div>
              <small className="hint">* El costo de envío se coordina por WhatsApp.</small>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button className="btn" onClick={clear}>Vaciar</button>
              <button className="btn menta" onClick={()=> nav("/checkout")}>Continuar al checkout</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
