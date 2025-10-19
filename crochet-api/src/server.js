// crochet-api/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import pedidosRoutes from "./routes/pedidos.routes.js";
import imagenesRoutes from "./routes/imagenes.routes.js";

dotenv.config();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// servir archivos desde /public/uploads en /uploads
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Healthcheck
app.get("/", (_req, res) => res.send("Crochet By Less API funcionando <3"));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/pedidos-personalizados", pedidosRoutes);
app.use("/api/productos", imagenesRoutes); // monta /:id/imagenes [...]

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto: ${PORT}`));