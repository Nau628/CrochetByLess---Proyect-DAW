// src/controllers/auth.controller.js
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

function signToken(payload){
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export async function login(req, res){
  try{
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email y password son requeridos" });
    }

    const [rows] = await pool.query(
      "SELECT id_usuario, email, password, rol FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = signToken({ id: user.id_usuario, rol: user.rol });
    return res.json({
      token,
      user: { id: user.id_usuario, email: user.email, rol: user.rol }
    });
  }catch(err){
    console.error("[auth.login] ", err);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
}

export async function me(req, res){
  try{
    // requireAuth ya adjunta req.user
    return res.json({ user: req.user });
  }catch(err){
    console.error("[auth.me] ", err);
    return res.status(500).json({ message: "Error" });
  }
}
