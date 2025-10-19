// src/middlewares/auth.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next){
  try{
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");
    if (!token) return res.status(401).json({ message: "No autorizado" });
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, rol: payload.rol };
    next();
  }catch(err){
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function requireRole(role){
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "No autorizado" });
    if (req.user.rol !== role) return res.status(403).json({ message: "Prohibido" });
    next();
  };
}
