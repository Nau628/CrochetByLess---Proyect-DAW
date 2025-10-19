import { Router } from "express";
import { crearPedido, listarPedidos } from "../controllers/pedidos.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

// Público: cualquier cliente puede crear pedido personalizado
router.post("/", crearPedido);

// Solo admin: ver el listado de pedidos
router.get("/", requireAuth, requireRole("admin"), listarPedidos);

export default router;
