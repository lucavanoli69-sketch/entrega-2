# Backend Entrega Final - Coderhouse

Este proyecto es la entrega final del curso de Backend de Coderhouse. 
Es una API RESTful con Handlebars como motor de plantillas y MongoDB como base de datos principal, gestionando productos y carritos.

## Tecnologías Utilizadas
- **Node.js & Express:** Servidor y rutas.
- **MongoDB & Mongoose:** Persistencia de datos.
- **mongoose-paginate-v2:** Paginación de productos.
- **Handlebars:** Vistas HTML.
- **Socket.io:** WebSockets para productos en tiempo real.

## Instalación

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   ```
2. Configura las variables de entorno:
   Renombra o copia el archivo `.env.example` a `.env` y ajusta tu `MONGO_URI`.
   ```env
   MONGO_URI=mongodb+srv://admin:admin@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```
3. Inicia el proyecto en modo desarrollo:
   ```bash
   npm run dev
   ```

## Endpoints Principales

### Productos (`/api/products`)
- `GET /api/products` - Obtiene todos los productos.
  **Ejemplos de Query Params (Paginación, Filtros y Ordenamiento):**
  - `/api/products?limit=5` (Limita a 5 por página)
  - `/api/products?page=2` (Va a la página 2)
  - `/api/products?query=ropa` (Filtra por categoría 'ropa')
  - `/api/products?query=true` (Filtra por status=true)
  - `/api/products?sort=asc` (Ordena por precio ascendente)
  - `/api/products?sort=desc` (Ordena por precio descendente)
  - Combinado: `/api/products?limit=5&page=2&query=ropa&sort=asc`
- `GET /api/products/:pid` - Obtiene un producto por ID.
- `POST /api/products` - Crea un nuevo producto.
- `PUT /api/products/:pid` - Actualiza un producto.
- `DELETE /api/products/:pid` - Elimina un producto.

### Carritos (`/api/carts`)
- `POST /api/carts` - Crea un carrito vacío.
- `GET /api/carts/:cid` - Obtiene un carrito con sus productos completos (usando `populate`).
- `POST /api/carts/:cid/products/:pid` - Agrega un producto al carrito (o incrementa su cantidad).
- `PUT /api/carts/:cid/products/:pid` - Actualiza la cantidad de un producto específico en el carrito (`req.body = { quantity: 10 }`).
- `DELETE /api/carts/:cid/products/:pid` - Elimina un producto específico del carrito.
- `PUT /api/carts/:cid` - Actualiza todo el array de productos del carrito.
- `DELETE /api/carts/:cid` - Vacía completamente el carrito.

## Vistas (Handlebars)
- `/products` - Listado paginado de productos con botones para ver detalle o agregar al carrito.
- `/products/:pid` - Vista detallada de un producto específico.
- `/carts/:cid` - Vista del carrito, muestra los productos agregados usando datos populados, y permite vaciar el carrito o eliminar un producto de él.

## Explicación Breve
* **Paginación:** Usando `mongoose-paginate-v2` se devuelven metadatos adicionales (prevLink, nextLink, page, etc) que facilitan la navegación en el frontend, conservando los query params originales.
* **Filtros:** Se puede buscar por categoría directamente (`query=categoria`) o por disponibilidad (`query=true|false`).
* **Ordenamiento:** La propiedad `sort=asc|desc` impacta directamente sobre el precio del producto al consultar MongoDB.
* **Populate:** Al consultar un carrito por id (`GET /api/carts/:cid`), Mongoose intercepta la referencia `product` mediante `ObjectId` y trae todo el objeto Product embebido para poder mostrarlo fácilmente.
* **Operaciones de Carrito:** Ahora es posible manipular detalladamente las cantidades (con PUT individual) y los productos del array (eliminándolos individualmente o de manera masiva).
