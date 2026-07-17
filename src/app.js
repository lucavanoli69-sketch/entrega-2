// ============================================================
// app.js - Servidor principal.
// ============================================================

import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { createServer } from "http";
import connectDB from "./config/db.js";

import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./managers/ProductManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 8080;

// Conectar a la base de datos
connectDB();

// ── Handlebars ───────────────────────────────────────────────
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// ── Middlewares ──────────────────────────────────────────────
app.use(express.json());           // Parsear body JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// ── Rutas ────────────────────────────────────────────────────
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// ── Ruta no encontrada (404 genérico) ────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Ruta no encontrada" });
});

// ── Socket.io ────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);

  // Escuchar evento para agregar producto
  socket.on("addProduct", async (productData) => {
    try {
      await ProductManager.addProduct(productData);
      const products = await ProductManager.getProducts();
      io.emit("productsUpdated", products);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Escuchar evento para eliminar producto
  socket.on("deleteProduct", async (id) => {
    try {
      await ProductManager.deleteProduct(id);
      const products = await ProductManager.getProducts();
      io.emit("productsUpdated", products);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// ── Iniciar servidor ─────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
