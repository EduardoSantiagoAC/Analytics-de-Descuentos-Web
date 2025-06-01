const Producto = require('../Models/Producto');

async function guardarProductos(productos) {
  const operaciones = productos.map(async (productoData) => {
    const existente = await Producto.findOne({ urlProducto: productoData.urlProducto });

    if (existente) {
      existente.precio = productoData.precio;
      existente.nombre = productoData.nombre;
      existente.categoria = productoData.categoria;
      existente.tienda = productoData.tienda;
      existente.imagen = productoData.imagen;
      existente.stock = productoData.stock;
      existente.precioOriginal = productoData.precioOriginal || null;
      existente.fechaActualizacion = new Date();

      // Solo empuja nuevo precio al historial si cambió
      if (existente.precio !== productoData.precio) {
        existente.historicoPrecios.push({
          precio: productoData.precio,
          fecha: new Date()
        });
      }

      return await existente.save(); // 🔥 activa middleware
    } else {
      const nuevoProducto = new Producto({
        ...productoData,
        fechaActualizacion: new Date(),
        historicoPrecios: [{
          precio: productoData.precio,
          fecha: new Date()
        }]
      });

      return await nuevoProducto.save(); // 🔥 activa middleware
    }
  });

  return Promise.all(operaciones);
}

module.exports = guardarProductos;
