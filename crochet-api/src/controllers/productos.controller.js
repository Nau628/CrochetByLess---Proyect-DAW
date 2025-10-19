// src/controllers/productos.controller.js
import { pool } from "../config/db.js";

// Helpers de validación simples
function badRequest(res, msg) { return res.status(400).json({ message: msg }); }
function notFound(res, msg="No encontrado") { return res.status(404).json({ message: msg }); }
function handleError(res, err, fallback="Error del servidor") {
  console.error(fallback, err);
  return res.status(500).json({ message: fallback });
}
function isNonEmptyString(s){ return typeof s==="string" && s.trim().length>0; }
function isPositiveNumber(n){ return typeof n==="number" && Number.isFinite(n) && n>=0; }
function isOptionalString(s){ return s===null || s===undefined || typeof s==="string"; }

// GET /api/productos
export async function listarProductos(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const offset = (page - 1) * limit;

    const id_categoria = req.query.id_categoria ? Number(req.query.id_categoria) : null;
    const order = (req.query.order || "recientes").toLowerCase(); // "precio_asc" | "precio_desc" | "recientes"
    let orderBy = "p.fecha_creacion DESC";
    if (order === "precio_asc") orderBy = "p.precio ASC";
    if (order === "precio_desc") orderBy = "p.precio DESC";

    let where = "1=1";
    const params = [];
    if (id_categoria) { where += " AND p.id_categoria = ?"; params.push(id_categoria); }

    const [items] = await pool.query(
      `SELECT p.* , c.nombre_categoria
       FROM productos p
       LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
       WHERE ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM productos p WHERE ${where}`,
      params
    );

    return res.json({ items, page, limit, total, pages: Math.ceil(total/limit) });
  } catch (err) {
    return handleError(res, err, "Error al listar productos");
  }
}

// GET /api/productos/:id
export async function obtenerProducto(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest(res, "ID inválido");

    const [[row]] = await pool.query(
      `SELECT p.* , c.nombre_categoria
       FROM productos p
       LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
       WHERE p.id_producto = ? LIMIT 1`,
      [id]
    );
    if (!row) return notFound(res, "Producto no encontrado");

    const [imagenes] = await pool.query(
      `SELECT id_imagen, url, orden FROM producto_imagenes
       WHERE id_producto = ? ORDER BY orden ASC, id_imagen ASC`,
      [id]
    );
    row.imagenes = imagenes;

    return res.json(row);
  } catch (err) {
    return handleError(res, err, "Error al obtener producto");
  }
}

// POST /api/productos  (admin)
export async function crearProducto(req, res) {
  try {
    const {
      id_categoria = null,
      nombre_producto,
      descripcion = null,
      precio,
      stock = 0,
      color = null,
      imagen_url = null
    } = req.body || {};

    if (!isNonEmptyString(nombre_producto)) return badRequest(res, "nombre_producto es requerido");
    const precioNum = typeof precio === "string" ? Number(precio) : precio;
    if (!isPositiveNumber(precioNum)) return badRequest(res, "precio debe ser número ≥ 0");

    const stockNum = typeof stock === "string" ? Number(stock) : stock;
    if (!isPositiveNumber(stockNum)) return badRequest(res, "stock debe ser número ≥ 0");

    if (!isOptionalString(descripcion)) return badRequest(res, "descripcion debe ser texto");
    if (!isOptionalString(color)) return badRequest(res, "color debe ser texto");
    if (!isOptionalString(imagen_url)) return badRequest(res, "imagen_url debe ser texto");
    const idCat = id_categoria === null ? null : Number(id_categoria);
    if (idCat !== null && (!Number.isInteger(idCat) || idCat <= 0)) return badRequest(res, "id_categoria inválido");

    const [result] = await pool.query(
      `INSERT INTO productos (id_categoria, nombre_producto, descripcion, precio, stock, color, imagen_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idCat, nombre_producto.trim(), descripcion, precioNum, stockNum, color, imagen_url]
    );
    const insertedId = result.insertId;

    const [[row]] = await pool.query(`SELECT * FROM productos WHERE id_producto = ?`, [insertedId]);
    return res.status(201).json(row);
  } catch (err) {
    return handleError(res, err, "Error al crear producto");
  }
}

// PUT /api/productos/:id  (admin)
export async function actualizarProducto(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest(res, "ID inválido");

    const [[exists]] = await pool.query(`SELECT 1 FROM productos WHERE id_producto = ?`, [id]);
    if (!exists) return notFound(res, "Producto no encontrado");

    let {
      id_categoria = undefined,
      nombre_producto = undefined,
      descripcion = undefined,
      precio = undefined,
      stock = undefined,
      color = undefined,
      imagen_url = undefined
    } = req.body || {};

    const updates = [];
    const params = [];

    if (id_categoria !== undefined) {
      const idCat = id_categoria === null ? null : Number(id_categoria);
      if (idCat !== null && (!Number.isInteger(idCat) || idCat <= 0)) return badRequest(res, "id_categoria inválido");
      updates.push("id_categoria = ?"); params.push(idCat);
    }
    if (nombre_producto !== undefined) {
      if (!isNonEmptyString(nombre_producto)) return badRequest(res, "nombre_producto inválido");
      updates.push("nombre_producto = ?"); params.push(nombre_producto.trim());
    }
    if (descripcion !== undefined) {
      if (!isOptionalString(descripcion)) return badRequest(res, "descripcion debe ser texto o null");
      updates.push("descripcion = ?"); params.push(descripcion);
    }
    if (precio !== undefined) {
      const precioNum = typeof precio === "string" ? Number(precio) : precio;
      if (!isPositiveNumber(precioNum)) return badRequest(res, "precio debe ser número ≥ 0");
      updates.push("precio = ?"); params.push(precioNum);
    }
    if (stock !== undefined) {
      const stockNum = typeof stock === "string" ? Number(stock) : stock;
      if (!isPositiveNumber(stockNum)) return badRequest(res, "stock debe ser número ≥ 0");
      updates.push("stock = ?"); params.push(stockNum);
    }
    if (color !== undefined) {
      if (!isOptionalString(color)) return badRequest(res, "color debe ser texto o null");
      updates.push("color = ?"); params.push(color);
    }
    if (imagen_url !== undefined) {
      if (!isOptionalString(imagen_url)) return badRequest(res, "imagen_url debe ser texto o null");
      updates.push("imagen_url = ?"); params.push(imagen_url);
    }

    if (updates.length === 0) return badRequest(res, "No hay campos para actualizar");

    const sql = `UPDATE productos SET ${updates.join(", ")} WHERE id_producto = ?`;
    params.push(id);
    await pool.query(sql, params);

    const [[row]] = await pool.query(`SELECT * FROM productos WHERE id_producto = ?`, [id]);
    return res.json(row);
  } catch (err) {
    return handleError(res, err, "Error al actualizar producto");
  }
}

// DELETE /api/productos/:id  (admin)
export async function eliminarProducto(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest(res, "ID inválido");

    const [del] = await pool.query(
      `DELETE FROM productos WHERE id_producto = ?`,
      [id]
    );
    if (del.affectedRows === 0) return notFound(res, "Producto no encontrado");

    return res.json({ ok: true });
  } catch (err) {
    // Si hay FK en producto_imagenes con ON DELETE RESTRICT, MySQL puede lanzar ER_ROW_IS_REFERENCED_2
    if (err?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ message: "No se puede eliminar: hay imágenes asociadas" });
    }
    return handleError(res, err, "Error al eliminar producto");
  }
}

// GET /api/productos/:id/imagenes
export async function listarImagenesProducto(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest(res, "ID inválido");

    const [imgs] = await pool.query(
      `SELECT id_imagen, url, orden
         FROM producto_imagenes
        WHERE id_producto = ?
        ORDER BY orden ASC, id_imagen ASC`,
      [id]
    );
    return res.json(imgs);
  } catch (err) {
    return handleError(res, err, "Error al listar imágenes");
  }
}
