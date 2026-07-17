const testAPI = async () => {
  try {
    // 1. Crear producto
    let res = await fetch('http://localhost:8080/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Remera",
        description: "Remera de algodon",
        code: "REM-" + Date.now(),
        price: 1500,
        stock: 10,
        category: "ropa",
        status: true
      })
    });
    const productData = await res.json();
    console.log("Producto creado:", productData);
    const pid = productData.payload._id;

    // 2. GET productos (paginacion)
    res = await fetch('http://localhost:8080/api/products?limit=5&page=1&sort=asc&query=ropa');
    const productsList = await res.json();
    console.log("Lista paginada:", productsList);

    // 3. Crear carrito
    res = await fetch('http://localhost:8080/api/carts', { method: 'POST' });
    const cartData = await res.json();
    console.log("Carrito creado:", cartData);
    const cid = cartData.payload._id;

    // 4. Agregar producto al carrito
    res = await fetch(`http://localhost:8080/api/carts/${cid}/products/${pid}`, { method: 'POST' });
    const addData = await res.json();
    console.log("Producto agregado al carrito:", addData);

    // 5. GET carrito populate
    res = await fetch(`http://localhost:8080/api/carts/${cid}`);
    const cartPopulated = await res.json();
    console.log("Carrito poblado:", JSON.stringify(cartPopulated, null, 2));

    // 6. Eliminar producto de carrito
    res = await fetch(`http://localhost:8080/api/carts/${cid}/products/${pid}`, { method: 'DELETE' });
    console.log("Producto eliminado del carrito:", await res.json());

  } catch (error) {
    console.error("Error en test:", error);
  }
};
testAPI();
