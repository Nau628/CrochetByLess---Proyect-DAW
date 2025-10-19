// src/controllers/pedidos.controller.js
import { pool } from "../config/db.js";

/* ===== Helpers ===== */
function isNonEmptyString(s) {
  return typeof s === "string" && s.trim().length > 0;
}
function isOptionalString(s) {
  return s === null || s === undefined || typeof s === "string";
}
function badRequest(res, message) {
  return res.status(400).json({ message });
}
function notFound(res, message = "No encontrado") {
  return res.status(404).json({ message });
}
function handleError(res, err, fallback = "Error del servidor") {
  console.error(fallback, err);
  return res.status(500).json({ message: fallback });
}

/** Construye el texto del mensaje para WhatsApp */
function buildWaText(p) {
  const lines = [
    "Hola! Quiero un pedido personalizado:",
    p.id_producto ? `- Producto base ID: ${p.id_producto}` : null,
    `- Cliente: ${p.nombre_cliente}`,
    p.color_preferido ? `- Color: ${p.color_preferido}` : null,
    p.descripcion_detalle ? `- Detalles: ${p.descripcion_detalle}` : null,
    p.imagen_referencia ? `- Imagen ref: ${p.imagen_referencia}` : null,
  ].filter(Boolean);
  return encodeURIComponent(lines.join("\n"));
}

/* ===========================================================
   POST /api/pedidos-personalizados
   Crea un pedido personalizado y devuelve link de WhatsApp
   Body esperado:
     {
       id_producto?: number|null,
       nombre_cliente: string,
       telefono_cliente: string (solo dígitos, 8-15),
       color_preferido?: string|null,
       talla?: string|null,                // OPCIONAL (frontend ya no lo usa)
       descripcion_detalle?: string|null,
       imagen_referencia?: string|null
     }
   =========================================================== */
export const crearPedido = async (req, res) => {
  try {
    let {
      id_producto = null,
      nombre_cliente,
      telefono_cliente,
      color_preferido = null,
      talla = null, // opcional, permitido null
      descripcion_detalle = null,
      imagen_referencia = null,
    } = req.body || {};

    // Requeridos
    if (!isNonEmptyString(nombre_cliente)) {
      return badRequest(res, "nombre_cliente es obligatorio");
    }
    if (!isNonEmptyString(telefono_cliente)) {
      return badRequest(res, "telefono_cliente es obligatorio");
    }

    // Normaliza id_producto
    if (id_producto === "" || id_producto === undefined) id_producto = null;
    if (id_producto !== null) {
      const n = Number(id_producto);
      if (!Number.isInteger(n) || n <= 0) {
        return badRequest(res, "id_producto inválido");
      }
      // Valida existencia
      const [prod] = await pool.query(
        "SELECT 1 FROM productos WHERE id_producto = ?",
        [n]
      );
      if (prod.length === 0) {
        return badRequest(res, "El producto base no existe");
      }
      id_producto = n;
    }

    // Teléfono: solo dígitos, 8-15
    const rxPhone = /^[0-9]{8,15}$/;
    if (!rxPhone.test(String(telefono_cliente))) {
      return badRequest(res, "teléfono inválido (solo dígitos, 8-15)");
    }

    // Campos opcionales tipo string
    if (!isOptionalString(color_preferido)) {
      return badRequest(res, "color_preferido debe ser texto o null");
    }
    if (!isOptionalString(talla)) {
      return badRequest(res, "talla debe ser texto o null");
    }
    if (!isOptionalString(descripcion_detalle)) {
      return badRequest(res, "descripcion_detalle debe ser texto o null");
    }
    if (!isOptionalString(imagen_referencia)) {
      return badRequest(res, "imagen_referencia debe ser texto o null");
    }

    const [result] = await pool.query(
      `INSERT INTO pedidos_personalizados
       (id_producto, nombre_cliente, telefono_cliente, color_preferido, talla, descripcion_detalle, imagen_referencia)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id_producto,
        nombre_cliente.trim(),
        telefono_cliente.trim(),
        color_preferido,
        talla,
        descripcion_detalle,
        imagen_referencia,
      ]
    );

    // Número de WhatsApp de la tienda (formato internacional sin +)
    const PHONE_SHOP = process.env.PHONE_SHOP || "50361739697";
    const text = buildWaText({
      id_producto,
      nombre_cliente,
      color_preferido,
      talla,
      descripcion_detalle,
      imagen_referencia,
    });
    const whatsapp = `https://wa.me/${PHONE_SHOP}?text=${text}`;

    const [[row]] = await pool.query(
      "SELECT * FROM pedidos_personalizados WHERE id_pedido = ?",
      [result.insertId]
    );

    return res.status(201).json({ ...row, whatsapp });
  } catch (err) {
    return handleError(res, err, "Error al crear pedido personalizado");
  }
};

/* ===========================================================
   GET /api/pedidos-personalizados
   Lista pedidos (incluye nombre del producto si hay)
   =========================================================== */
export const listarPedidos = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT pp.*, p.nombre_producto
         FROM pedidos_personalizados pp
         LEFT JOIN productos p ON p.id_producto = pp.id_producto
       ORDER BY pp.fecha_pedido DESC`
    );
    return res.json(rows);
  } catch (err) {
    return handleError(res, err, "Error al listar pedidos");
  }
};

/* ===========================================================
   (opcional) GET /api/pedidos-personalizados/:id
   =========================================================== */
export const obtenerPedido = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest(res, "ID inválido");

    const [[row]] = await pool.query(
      `SELECT pp.*, p.nombre_producto
         FROM pedidos_personalizados pp
         LEFT JOIN productos p ON p.id_producto = pp.id_producto
       WHERE pp.id_pedido = ?
       LIMIT 1`,
      [id]
    );
    if (!row) return notFound(res, "Pedido no encontrado");
    return res.json(row);
  } catch (err) {
    return handleError(res, err, "Error al obtener pedido");
  }
};

/* ===========================================================
   PATCH /api/pedidos-personalizados/:id
   Body: { estado: "pendiente" | "en_proceso" | "completado" }
   =========================================================== */
export const actualizarEstado = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) return badRequest(res, "ID inválido");

    const { estado } = req.body || {};
    const permitidos = new Set(["pendiente", "en_proceso", "completado"]);
    if (!permitidos.has(String(estado))) {
      return badRequest(res, "estado inválido (pendiente|en_proceso|completado)");
    }

    const [[exists]] = await pool.query(
      "SELECT 1 FROM pedidos_personalizados WHERE id_pedido = ?",
      [id]
    );
    if (!exists) return notFound(res, "Pedido no encontrado");

    await pool.query(
      "UPDATE pedidos_personalizados SET estado = ? WHERE id_pedido = ?",
      [estado, id]
    );

    const [[row]] = await pool.query(
      "SELECT * FROM pedidos_personalizados WHERE id_pedido = ?",
      [id]
    );
    return res.json(row);
  } catch (err) {
    return handleError(res, err, "Error al actualizar estado");
  }
};
