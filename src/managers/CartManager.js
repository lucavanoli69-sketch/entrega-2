// ============================================================
// managers/CartManager.js
// Gestiona la persistencia de carritos en carts.json
// ============================================================

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, "../data/carts.json");

class CartManager {

  // ── Utilidades privadas ──────────────────────────────────

  /**
   * Lee el archivo JSON y devuelve el array de carritos.
   * Si el archivo no existe, lo crea con [].
   */
  async #readFile() {
    try {
      const data = await fs.readFile(FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        await this.#writeFile([]);
        return [];
      }
      throw error;
    }
  }

  /**
   * Escribe el array en el archivo JSON con formato legible.
   */
  async #writeFile(data) {
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  }

  /**
   * Genera el próximo ID disponible.
   */
  #generateId(carts) {
    if (carts.length === 0) return 1;
    return Math.max(...carts.map((c) => c.id)) + 1;
  }

  // ── Métodos públicos ─────────────────────────────────────

  /**
   * Crea un nuevo carrito vacío.
   */
  async createCart() {
    const carts = await this.#readFile();

    const newCart = {
      id: this.#generateId(carts),
      products: [],
    };

    carts.push(newCart);
    await this.#writeFile(carts);
    return newCart;
  }

  /**
   * Devuelve un carrito por su ID.
   * @throws {Error} Si el carrito no existe
   */
  async getCartById(id) {
    const carts = await this.#readFile();
    const cart = carts.find((c) => c.id === id);
    if (!cart) throw new Error(`Carrito con id ${id} no encontrado`);
    return cart;
  }

  /**
   * Agrega un producto al carrito.
   * Si el producto ya existe en el carrito, incrementa su quantity.
   * @param {number} cid - ID del carrito
   * @param {number} pid - ID del producto
   * @throws {Error} Si el carrito no existe
   */
  async addProductToCart(cid, pid) {
    const carts = await this.#readFile();
    const cartIndex = carts.findIndex((c) => c.id === cid);
    if (cartIndex === -1) throw new Error(`Carrito con id ${cid} no encontrado`);

    const cart = carts[cartIndex];

    // Buscar si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex((p) => p.product === pid);

    if (productIndex !== -1) {
      // El producto ya existe → incrementar quantity
      cart.products[productIndex].quantity += 1;
    } else {
      // El producto no existe → agregarlo con quantity 1
      cart.products.push({ product: pid, quantity: 1 });
    }

    carts[cartIndex] = cart;
    await this.#writeFile(carts);
    return cart;
  }
}

// Exportar una única instancia (patrón Singleton)
export default new CartManager();
