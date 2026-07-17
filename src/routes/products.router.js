// ============================================================
// routes/products.router.js
// Endpoints: /api/products
// ============================================================

import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();

// ── GET /api/products ────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const result = await ProductManager.getProducts({ limit, page, sort, query });

    // Construir links de paginación manteniendo los filtros
    const buildLink = (pageNumber) => {
      if (!pageNumber) return null;
      let link = `/api/products?limit=${limit}&page=${pageNumber}`;
      if (sort) link += `&sort=${sort}`;
      if (query) link += `&query=${query}`;
      return link;
    };

    const response = {
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: buildLink(result.prevPage),
      nextLink: buildLink(result.nextPage)
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ── GET /api/products/:pid ───────────────────────────────────
router.get("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await ProductManager.getProductById(pid);
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

// ── POST /api/products ───────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const newProduct = await ProductManager.addProduct(req.body);
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    const isValidationError =
      error.message.includes("faltantes") || error.message.includes("código");
    res.status(isValidationError ? 400 : 500).json({ status: "error", message: error.message });
  }
});

// ── PUT /api/products/:pid ───────────────────────────────────
router.put("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const updated = await ProductManager.updateProduct(pid, req.body);
    res.status(200).json({ status: "success", payload: updated });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

// ── DELETE /api/products/:pid ────────────────────────────────
router.delete("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const deleted = await ProductManager.deleteProduct(pid);
    res.status(200).json({ status: "success", message: "Producto eliminado", payload: deleted });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

export default router;
