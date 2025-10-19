import { Router } from "express";
import {
  listarCategorias, obtenerCategoria,
  crearCategoria, actualizarCategoria, eliminarCategoria
} from "../controllers/categorias.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const r = Router();

r.get("/", listarCategorias);
r.get("/:id", obtenerCategoria);

// Solo admin
r.post("/", requireAuth, requireRole("admin"), crearCategoria);
r.put("/:id", requireAuth, requireRole("admin"), actualizarCategoria);
r.delete("/:id", requireAuth, requireRole("admin"), eliminarCategoria);

export default r;
