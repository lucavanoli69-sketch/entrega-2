// ============================================================
// routes/views.router.js
// Endpoints: vistas Handlebars
// ============================================================

import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();

// ── GET / ────────────────────────────────────────────────────
// Renderiza home.handlebars con el listado de productos.
router.get("/", async (req, res) => {
  try {
    const products = await ProductManager.getProducts();
    res.render("home", { title: "Inicio", products });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ── GET /realtimeproducts ────────────────────────────────────
// Renderiza realTimeProducts.handlebars con el listado de productos.
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await ProductManager.getProducts();
    res.render("realTimeProducts", { title: "Productos en Tiempo Real", products });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
