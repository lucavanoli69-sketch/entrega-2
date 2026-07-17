// ============================================================
// managers/CartManager.js
// Gestiona la persistencia de carritos en MongoDB
// ============================================================

import { CartModel } from "../models/cart.model.js";

class CartManager {
  /**
   * Crea un nuevo carrito vacío.
   */
  async createCart() {
    const newCart = await CartModel.create({ products: [] });
    return newCart;
  }

  /**
   * Devuelve un carrito por su ID (con productos populados).
   * @throws {Error} Si el carrito no existe
   */
  async getCartById(id) {
    const cart = await CartModel.findById(id).populate("products.product").lean();
    if (!cart) throw new Error(`Carrito con id ${id} no encontrado`);
    return cart;
  }

  /**
   * Agrega un producto al carrito.
   * Si el producto ya existe en el carrito, incrementa su quantity.
   */
  async addProductToCart(cid, pid) {
    const cart = await CartModel.findById(cid);
    if (!cart) throw new Error(`Carrito con id ${cid} no encontrado`);

    const productIndex = cart.products.findIndex((p) => p.product.toString() === pid);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    return cart;
  }

  /**
   * Elimina un producto específico del carrito.
   */
  async removeProductFromCart(cid, pid) {
    const cart = await CartModel.findById(cid);
    if (!cart) throw new Error(`Carrito con id ${cid} no encontrado`);

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    return cart;
  }

  /**
   * Actualiza todos los productos de un carrito.
   */
  async updateCartProducts(cid, productsArray) {
    const cart = await CartModel.findById(cid);
    if (!cart) throw new Error(`Carrito con id ${cid} no encontrado`);

    cart.products = productsArray;
    await cart.save();
    return cart;
  }

  /**
   * Actualiza únicamente la cantidad de un producto en el carrito.
   */
  async updateProductQuantity(cid, pid, quantity) {
    const cart = await CartModel.findById(cid);
    if (!cart) throw new Error(`Carrito con id ${cid} no encontrado`);

    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
    } else {
      throw new Error(`Producto con id ${pid} no encontrado en el carrito`);
    }
    return cart;
  }

  /**
   * Elimina todos los productos del carrito (lo vacía).
   */
  async clearCart(cid) {
    const cart = await CartModel.findById(cid);
    if (!cart) throw new Error(`Carrito con id ${cid} no encontrado`);

    cart.products = [];
    await cart.save();
    return cart;
  }
}

export default new CartManager();
