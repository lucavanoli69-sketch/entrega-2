// ============================================================
// routes/carts.router.js
// Endpoints: /api/carts
// ============================================================

import { Router } from "express";
import CartManager from "../managers/CartManager.js";
import ProductManager from "../managers/ProductManager.js";

const router = Router();

// ── POST /api/carts ──────────────────────────────────────────
// Crea un nuevo carrito vacío.
router.post("/", async (req, res) => {
  try {
    const newCart = await CartManager.createCart();
    res.status(201).json({ status: "success", payload: newCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ── GET /api/carts/:cid ──────────────────────────────────────
// Devuelve los productos de un carrito.
router.get("/:cid", async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    if (isNaN(cid)) return res.status(400).json({ status: "error", message: "El id debe ser un número" });

    const cart = await CartManager.getCartById(cid);
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

// ── POST /api/carts/:cid/product/:pid ────────────────────────
// Agrega un producto al carrito. Si ya existe, incrementa quantity.
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    const pid = Number(req.params.pid);

    if (isNaN(cid) || isNaN(pid)) {
      return res.status(400).json({ status: "error", message: "Los ids deben ser números" });
    }

    // Verificar que el producto existe antes de agregarlo al carrito
    await ProductManager.getProductById(pid);

    const updatedCart = await CartManager.addProductToCart(cid, pid);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    // Si el carrito o producto no existe → 404
    const isNotFound = error.message.includes("no encontrado");
    res.status(isNotFound ? 404 : 500).json({ status: "error", message: error.message });
  }
});

export default router;
