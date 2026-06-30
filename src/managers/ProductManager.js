// ============================================================
// managers/ProductManager.js
// Gestiona la persistencia de productos en products.json
// ============================================================

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, "../data/products.json");

class ProductManager {

  // ── Utilidades privadas ──────────────────────────────────

  /**
   * Lee el archivo JSON y devuelve el array de productos.
   * Si el archivo no existe, lo crea con [].
   */
  async #readFile() {
    try {
      const data = await fs.readFile(FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      // Si el archivo no existe, inicializarlo
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
   * Genera el próximo ID disponible (nunca reutiliza IDs eliminados).
   */
  #generateId(products) {
    if (products.length === 0) return 1;
    return Math.max(...products.map((p) => p.id)) + 1;
  }

  // ── Métodos públicos ─────────────────────────────────────

  /**
   * Devuelve todos los productos.
   * @param {number} [limit] - Limita la cantidad de resultados
   */
  async getProducts(limit) {
    const products = await this.#readFile();
    if (limit) return products.slice(0, limit);
    return products;
  }

  /**
   * Busca y devuelve un producto por su ID.
   * @throws {Error} Si el producto no existe
   */
  async getProductById(id) {
    const products = await this.#readFile();
    const product = products.find((p) => p.id === id);
    if (!product) throw new Error(`Producto con id ${id} no encontrado`);
    return product;
  }

  /**
   * Agrega un producto nuevo validando campos obligatorios.
   * @param {Object} productData - Datos del producto
   * @throws {Error} Si faltan campos obligatorios o el código ya existe
   */
  async addProduct(productData) {
    const { title, description, code, price, stock, category, status, thumbnails } = productData;

    // Validar campos obligatorios (thumbnails es opcional)
    const requiredFields = { title, description, code, price, stock, category };
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Campos obligatorios faltantes: ${missingFields.join(", ")}`);
    }

    const products = await this.#readFile();

    // Verificar que el código no esté duplicado
    const codeExists = products.some((p) => p.code === code);
    if (codeExists) throw new Error(`Ya existe un producto con el código "${code}"`);

    const newProduct = {
      id: this.#generateId(products),
      title,
      description,
      code,
      price: Number(price),
      status: status !== undefined ? Boolean(status) : true,
      stock: Number(stock),
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
    };

    products.push(newProduct);
    await this.#writeFile(products);
    return newProduct;
  }

  /**
   * Actualiza los campos de un producto (nunca modifica el id).
   * @param {number} id - ID del producto
   * @param {Object} updatedFields - Campos a actualizar
   * @throws {Error} Si el producto no existe
   */
  async updateProduct(id, updatedFields) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Producto con id ${id} no encontrado`);

    // Nunca permitir modificar el id
    const { id: _ignoredId, ...safeFields } = updatedFields;

    products[index] = { ...products[index], ...safeFields };
    await this.#writeFile(products);
    return products[index];
  }

  /**
   * Elimina un producto por su ID.
   * @param {number} id - ID del producto
   * @throws {Error} Si el producto no existe
   */
  async deleteProduct(id) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Producto con id ${id} no encontrado`);

    const [deleted] = products.splice(index, 1);
    await this.#writeFile(products);
    return deleted;
  }
}

// Exportar una única instancia (patrón Singleton)
export default new ProductManager();
