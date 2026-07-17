// ============================================================
// routes/views.router.js
// Endpoints: vistas Handlebars
// ============================================================

import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
import CartManager from "../managers/CartManager.js";

const router = Router();

// ── GET / ────────────────────────────────────────────────────
// Renderiza home.handlebars con el listado de productos sin paginar
router.get("/", async (req, res) => {
  try {
    const result = await ProductManager.getProducts({ limit: 100 });
    res.render("home", { title: "Inicio", products: result.docs });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ── GET /realtimeproducts ────────────────────────────────────
// Renderiza realTimeProducts.handlebars
router.get("/realtimeproducts", async (req, res) => {
  try {
    const result = await ProductManager.getProducts({ limit: 100 });
    res.render("realTimeProducts", { title: "Productos en Tiempo Real", products: result.docs });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ── GET /products ────────────────────────────────────────────
// Vista paginada de productos
router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    
    const result = await ProductManager.getProducts({ limit, page, sort, query });
    
    const buildLink = (pageNumber) => {
      if (!pageNumber) return null;
      let link = `/products?limit=${limit}&page=${pageNumber}`;
      if (sort) link += `&sort=${sort}`;
      if (query) link += `&query=${query}`;
      return link;
    };

    res.render("products", {
      title: "Productos",
      products: result.docs,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: buildLink(result.prevPage),
      nextLink: buildLink(result.nextPage)
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ── GET /products/:pid ───────────────────────────────────────
// Detalle de un producto específico
router.get("/products/:pid", async (req, res) => {
  try {
    const product = await ProductManager.getProductById(req.params.pid);
    res.render("productDetail", { title: product.title, product });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

// ── GET /carts/:cid ──────────────────────────────────────────
// Vista de un carrito específico
router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await CartManager.getCartById(req.params.cid);
    res.render("cart", { title: "Tu Carrito", cart });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

export default router;
