import { Router } from "express";
import {
  listarProductos, obtenerProducto, crearProducto,
  actualizarProducto, eliminarProducto, listarImagenesProducto
} from "../controllers/productos.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/", listarProductos);
router.get("/:id", obtenerProducto);

// NUEVO: imágenes de un producto
router.get("/:id/imagenes", listarImagenesProducto);

// Solo admin
router.post("/", requireAuth, requireRole("admin"), crearProducto);
router.put("/:id", requireAuth, requireRole("admin"), actualizarProducto);
router.delete("/:id", requireAuth, requireRole("admin"), eliminarProducto);

export default router;
