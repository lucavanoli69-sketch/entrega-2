// ============================================================
// routes/products.router.js
// Endpoints: /api/products
// ============================================================

import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();

// ── GET /api/products ────────────────────────────────────────
// Devuelve todos los productos.
// Query param opcional: ?limit=N  → limita la cantidad
router.get("/", async (req, res) => {
  try {
    const { limit } = req.query;
    const products = await ProductManager.getProducts(limit ? Number(limit) : undefined);
    res.status(200).json({ status: "success", payload: products });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ── GET /api/products/:pid ───────────────────────────────────
// Devuelve un producto por su ID.
router.get("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);
    if (isNaN(pid)) return res.status(400).json({ status: "error", message: "El id debe ser un número" });

    const product = await ProductManager.getProductById(pid);
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

// ── POST /api/products ───────────────────────────────────────
// Crea un nuevo producto.
router.post("/", async (req, res) => {
  try {
    const newProduct = await ProductManager.addProduct(req.body);
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    // Errores de validación → 400, errores inesperados → 500
    const isValidationError =
      error.message.includes("faltantes") || error.message.includes("código");
    res.status(isValidationError ? 400 : 500).json({ status: "error", message: error.message });
  }
});

// ── PUT /api/products/:pid ───────────────────────────────────
// Actualiza un producto (cualquier campo excepto id).
router.put("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);
    if (isNaN(pid)) return res.status(400).json({ status: "error", message: "El id debe ser un número" });

    const updated = await ProductManager.updateProduct(pid, req.body);
    res.status(200).json({ status: "success", payload: updated });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

// ── DELETE /api/products/:pid ────────────────────────────────
// Elimina un producto por su ID.
router.delete("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);
    if (isNaN(pid)) return res.status(400).json({ status: "error", message: "El id debe ser un número" });

    const deleted = await ProductManager.deleteProduct(pid);
    res.status(200).json({ status: "success", message: "Producto eliminado", payload: deleted });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

export default router;
