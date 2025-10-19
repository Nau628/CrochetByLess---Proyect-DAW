// src/routes/auth.routes.js
import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();
r.post("/login", login);
r.get("/me", requireAuth, me);
export default r;
