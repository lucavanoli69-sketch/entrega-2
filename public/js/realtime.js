// ============================================================
// public/js/realtime.js - Lógica cliente WebSocket
// ============================================================

const socket = io();

// ── Listener: productos actualizados desde el servidor ───────
socket.on("productsUpdated", (products) => {
  const list = document.getElementById("products-list");
  list.innerHTML = "";

  if (products.length === 0) {
    list.innerHTML = "<li>No hay productos cargados.</li>";
    return;
  }

  products.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.title} | Precio: $${p.price} | Categoría: ${p.category} | Stock: ${p.stock}`;
    list.appendChild(li);
  });
});

// ── Agregar producto ─────────────────────────────────────────
document.getElementById("btn-add").addEventListener("click", () => {
  const product = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    code: document.getElementById("code").value.trim(),
    price: Number(document.getElementById("price").value),
    stock: Number(document.getElementById("stock").value),
    category: document.getElementById("category").value.trim(),
  };

  if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  socket.emit("addProduct", product);

  // Limpiar formulario
  ["title", "description", "code", "price", "stock", "category"].forEach((id) => {
    document.getElementById(id).value = "";
  });
});

// ── Eliminar producto ────────────────────────────────────────
document.getElementById("btn-delete").addEventListener("click", () => {
  const id = Number(document.getElementById("delete-id").value);
  if (!id) {
    alert("Ingresá un ID válido.");
    return;
  }
  socket.emit("deleteProduct", id);
  document.getElementById("delete-id").value = "";
});
