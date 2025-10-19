// src/controllers/imagenes.controller.js
import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";

function urlFromPath(localPath){
  const idx = localPath.lastIndexOf(`${path.sep}uploads${path.sep}`);
  if (idx === -1) return null;
  const rel = localPath.slice(idx).replaceAll(path.sep, "/");
  return rel.startsWith("/") ? rel : `/${rel}`;
}

export async function listarImagenes(req, res){
  try{
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT id_imagen, id_producto, url, orden, fecha_creacion FROM producto_imagenes WHERE id_producto=? ORDER BY orden ASC, id_imagen ASC",
      [id]
    );
    res.json(rows);
  }catch{ res.status(500).json({ message: "Error listando imágenes" }); }
}

export async function subirImagenes(req, res){
  try{
    const { id } = req.params;
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: "Sin archivos" });

    const [[{ maxOrden }]] = await pool.query(
      "SELECT COALESCE(MAX(orden), 0) as maxOrden FROM producto_imagenes WHERE id_producto=?",
      [id]
    );

    const values = [];
    files.forEach((f, i) => {
      const pubUrl = urlFromPath(f.path);
      if (pubUrl) values.push([id, pubUrl, maxOrden + 1 + i]);
    });
    if (!values.length) return res.status(400).json({ message: "No se pudieron generar URLs" });

    await pool.query("INSERT INTO producto_imagenes (id_producto, url, orden) VALUES ?", [values]);
    res.json({ ok: true, count: values.length });
  }catch{ res.status(500).json({ message: "Error subiendo imágenes" }); }
}

export async function borrarImagen(req, res){
  try{
    const { id, idImg } = req.params;

    const [[row]] = await pool.query(
      "SELECT url FROM producto_imagenes WHERE id_imagen=? AND id_producto=?",
      [idImg, id]
    );
    if (!row) return res.status(404).json({ message: "No encontrada" });

    const absPath = path.join(process.cwd(), row.url.replace(/\//g, path.sep));
    if (fs.existsSync(absPath)) { try{ fs.unlinkSync(absPath); }catch{} }

    await pool.query(
      "DELETE FROM producto_imagenes WHERE id_imagen=? AND id_producto=?",
      [idImg, id]
    );

    res.json({ ok: true });
  }catch{ res.status(500).json({ message: "Error borrando imagen" }); }
}

export async function reordenarImagenes(req, res){
  try{
    const { id } = req.params;
    const { orden } = req.body; // [{id_imagen, orden}]
    if (!Array.isArray(orden) || !orden.length) return res.status(400).json({ message: "Formato inválido" });

    const conn = await pool.getConnection();
    try{
      await conn.beginTransaction();
      for (const it of orden) {
        await conn.query(
          "UPDATE producto_imagenes SET orden=? WHERE id_imagen=? AND id_producto=?",
          [Number(it.orden), Number(it.id_imagen), id]
        );
      }
      await conn.commit();
    }catch(e){
      await conn.rollback();
      throw e;
    }finally{ conn.release(); }

    res.json({ ok: true });
  }catch{ res.status(500).json({ message: "Error reordenando imágenes" }); }
}

export async function setPrincipal(req, res){
  try{
    const { id, idImg } = req.params;

    // 1) obtener URL de la imagen elegida
    const [[row]] = await pool.query(
      "SELECT url FROM producto_imagenes WHERE id_imagen=? AND id_producto=?",
      [idImg, id]
    );
    if (!row) return res.status(404).json({ message: "Imagen no encontrada" });

    const conn = await pool.getConnection();
    try{
      await conn.beginTransaction();
      // 2) poner orden=1 a la elegida y renumerar las demás
      await conn.query(
        "UPDATE producto_imagenes SET orden = CASE WHEN id_imagen=? THEN 1 ELSE orden+1 END WHERE id_producto=?",
        [idImg, id]
      );
      // 3) actualizar imagen_url del producto
      await conn.query(
        "UPDATE productos SET imagen_url=? WHERE id_producto=?",
        [row.url, id]
      );
      await conn.commit();
    }catch(e){
      await conn.rollback();
      throw e;
    }finally{ conn.release(); }

    res.json({ ok:true, imagen_url: row.url });
  }catch{ res.status(500).json({ message: "Error fijando imagen principal" }); }
}
