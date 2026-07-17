// ============================================================
// managers/ProductManager.js
// Gestiona la persistencia de productos en MongoDB
// ============================================================

import { ProductModel } from "../models/product.model.js";

class ProductManager {
  /**
   * Devuelve productos con paginación, filtros y ordenamiento.
   * @param {Object} options - Opciones de paginación
   */
  async getProducts({ limit = 10, page = 1, sort, query }) {
    const filter = {};
    if (query) {
      // El query puede ser para filtrar por categoría o status
      if (query.toLowerCase() === "true" || query.toLowerCase() === "false") {
        filter.status = query.toLowerCase() === "true";
      } else {
        filter.category = query;
      }
    }

    const paginateOptions = {
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      lean: true // Para que devuelva objetos planos (mejor para Handlebars)
    };

    if (sort) {
      if (sort === "asc") paginateOptions.sort = { price: 1 };
      else if (sort === "desc") paginateOptions.sort = { price: -1 };
    }

    const result = await ProductModel.paginate(filter, paginateOptions);
    return result;
  }

  /**
   * Busca y devuelve un producto por su ID.
   * @throws {Error} Si el producto no existe
   */
  async getProductById(id) {
    const product = await ProductModel.findById(id).lean();
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

    const requiredFields = { title, description, code, price, stock, category };
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Campos obligatorios faltantes: ${missingFields.join(", ")}`);
    }

    const codeExists = await ProductModel.findOne({ code });
    if (codeExists) throw new Error(`Ya existe un producto con el código "${code}"`);

    const newProduct = await ProductModel.create({
      title,
      description,
      code,
      price: Number(price),
      status: status !== undefined ? Boolean(status) : true,
      stock: Number(stock),
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
    });

    return newProduct;
  }

  /**
   * Actualiza los campos de un producto.
   * @param {string} id - ID del producto
   * @param {Object} updatedFields - Campos a actualizar
   * @throws {Error} Si el producto no existe
   */
  async updateProduct(id, updatedFields) {
    // Nunca permitir modificar el id
    const { _id, ...safeFields } = updatedFields;

    const updated = await ProductModel.findByIdAndUpdate(id, safeFields, { new: true, lean: true });
    if (!updated) throw new Error(`Producto con id ${id} no encontrado`);
    return updated;
  }

  /**
   * Elimina un producto por su ID.
   * @param {string} id - ID del producto
   * @throws {Error} Si el producto no existe
   */
  async deleteProduct(id) {
    const deleted = await ProductModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new Error(`Producto con id ${id} no encontrado`);
    return deleted;
  }
}

// Exportar una única instancia (patrón Singleton)
export default new ProductManager();
