import { Router } from "express";
import { pool } from '../config/db.js';

const router = Router();

router.post("/", async (req, res) => {
  try{
    const { nombre, email=null, asunto=null, mensaje } = req.body || {};
    if(!nombre || !mensaje) return res.status(400).json({ message: "nombre y mensaje son requeridos" });

    const [r] = await pool.query(
      "INSERT INTO contacto (nombre, email, asunto, mensaje) VALUES (?, ?, ?, ?)",
      [nombre, email, asunto, mensaje]
    );
    res.status(201).json({ id_contacto: r.insertId, ok: true });
  }catch(err){
    console.error("POST /api/contacto", err);
    res.status(500).json({ message: "Error al enviar contacto" });
  }
});

export default router;
