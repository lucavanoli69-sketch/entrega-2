// ============================================================
// routes/carts.router.js
// Endpoints: /api/carts
// ============================================================

import { Router } from "express";
import CartManager from "../managers/CartManager.js";
import ProductManager from "../managers/ProductManager.js";

const router = Router();

// ── POST /api/carts ──────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const newCart = await CartManager.createCart();
    res.status(201).json({ status: "success", payload: newCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ── GET /api/carts/:cid ──────────────────────────────────────
router.get("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await CartManager.getCartById(cid);
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

// ── POST /api/carts/:cid/products/:pid ────────────────────────
// (También soportamos /product/:pid para retrocompatibilidad)
router.post(["/:cid/products/:pid", "/:cid/product/:pid"], async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // Verificar que el producto existe antes de agregarlo al carrito
    await ProductManager.getProductById(pid);

    const updatedCart = await CartManager.addProductToCart(cid, pid);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    const isNotFound = error.message.includes("no encontrado");
    res.status(isNotFound ? 404 : 500).json({ status: "error", message: error.message });
  }
});

// ── DELETE /api/carts/:cid/products/:pid ──────────────────────
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await CartManager.removeProductFromCart(cid, pid);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    const isNotFound = error.message.includes("no encontrado");
    res.status(isNotFound ? 404 : 500).json({ status: "error", message: error.message });
  }
});

// ── PUT /api/carts/:cid ───────────────────────────────────────
router.put("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: "error", message: "El formato debe ser un array de 'products'" });
    }

    const updatedCart = await CartManager.updateCartProducts(cid, products);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    const isNotFound = error.message.includes("no encontrado");
    res.status(isNotFound ? 404 : 500).json({ status: "error", message: error.message });
  }
});

// ── PUT /api/carts/:cid/products/:pid ─────────────────────────
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(Number(quantity))) {
      return res.status(400).json({ status: "error", message: "Se requiere un quantity numérico válido" });
    }

    const updatedCart = await CartManager.updateProductQuantity(cid, pid, Number(quantity));
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    const isNotFound = error.message.includes("no encontrado");
    res.status(isNotFound ? 404 : 500).json({ status: "error", message: error.message });
  }
});

// ── DELETE /api/carts/:cid ────────────────────────────────────
router.delete("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const updatedCart = await CartManager.clearCart(cid);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    const isNotFound = error.message.includes("no encontrado");
    res.status(isNotFound ? 404 : 500).json({ status: "error", message: error.message });
  }
});

export default router;
