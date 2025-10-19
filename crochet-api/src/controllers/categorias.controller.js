// src/controllers/categorias.controller.js
import { pool } from "../config/db.js";

/** GET /api/categorias */
export const listarCategorias = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_categoria, nombre_categoria FROM categorias ORDER BY nombre_categoria ASC"
    );
    res.json(rows);
  } catch (e) {
    console.error("GET /api/categorias", e);
    res.status(500).json({ message: "Error listando categorías" });
  }
};

/** GET /api/categorias/:id  (opcional) */
export const obtenerCategoria = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const [rows] = await pool.query(
      "SELECT id_categoria, nombre_categoria FROM categorias WHERE id_categoria=? LIMIT 1",
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "No encontrada" });

    res.json(rows[0]);
  } catch (e) {
    console.error("GET /api/categorias/:id", e);
    res.status(500).json({ message: "Error obteniendo categoría" });
  }
};

/** POST /api/categorias  (admin) */
export const crearCategoria = async (req, res) => {
  try {
    const { nombre_categoria } = req.body || {};
    if (typeof nombre_categoria !== "string" || !nombre_categoria.trim()) {
      return res.status(400).json({ message: "nombre_categoria es requerido" });
    }

    const nombre = nombre_categoria.trim();

    const [result] = await pool.query(
      "INSERT INTO categorias (nombre_categoria) VALUES (?)",
      [nombre]
    );

    const [[row]] = await pool.query(
      "SELECT id_categoria, nombre_categoria FROM categorias WHERE id_categoria = ?",
      [result.insertId]
    );

    return res.status(201).json(row);
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") {
      // requiere haber creado un índice único en DB:
      // ALTER TABLE categorias ADD UNIQUE KEY uq_nombre_categoria (nombre_categoria);
      return res.status(400).json({ message: "La categoría ya existe" });
    }
    console.error("POST /api/categorias", e);
    return res.status(500).json({ message: "Error al crear categoría" });
  }
};

/** PUT /api/categorias/:id  (admin) */
export const actualizarCategoria = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const { nombre_categoria } = req.body || {};
    if (typeof nombre_categoria !== "string" || !nombre_categoria.trim()) {
      return res.status(400).json({ message: "nombre_categoria es requerido" });
    }

    const nombre = nombre_categoria.trim();

    const [upd] = await pool.query(
      "UPDATE categorias SET nombre_categoria = ? WHERE id_categoria = ?",
      [nombre, id]
    );
    if (upd.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    const [[row]] = await pool.query(
      "SELECT id_categoria, nombre_categoria FROM categorias WHERE id_categoria = ?",
      [id]
    );
    return res.json(row);
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "La categoría ya existe" });
    }
    console.error("PUT /api/categorias/:id", e);
    return res.status(500).json({ message: "Error al actualizar categoría" });
  }
};

/** DELETE /api/categorias/:id  (admin) */
export const eliminarCategoria = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    // Si hay FK desde productos(id_categoria) con ON DELETE RESTRICT, dará error.
    // Recomendado: ON DELETE SET NULL o CASCADE según tu modelo.
    const [del] = await pool.query(
      "DELETE FROM categorias WHERE id_categoria = ?",
      [id]
    );

    if (del.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/categorias/:id", e);
    // Si la FK impide borrar, MySQL suele lanzar ER_ROW_IS_REFERENCED_2
    if (e?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message: "No se puede eliminar: hay productos que dependen de esta categoría",
      });
    }
    return res.status(500).json({ message: "Error al eliminar categoría" });
  }
};
