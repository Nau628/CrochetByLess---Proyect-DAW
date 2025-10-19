// crochet-api/src/routes/imagenes.routes.js
import { Router } from "express";
import { upload } from "../config/upload.js";
import {
  listarImagenes, subirImagenes, borrarImagen, reordenarImagenes
} from "../controllers/imagenes.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const r = Router();

// Público: listar imágenes de un producto
r.get("/:id/imagenes", listarImagenes);

// Admin: subir, borrar, reordenar
r.post("/:id/imagenes", requireAuth, requireRole("admin"), upload.array("files", 8), subirImagenes);
r.delete("/:id/imagenes/:idImg", requireAuth, requireRole("admin"), borrarImagen);
r.put("/:id/imagenes/orden", requireAuth, requireRole("admin"), reordenarImagenes);

export default r;
