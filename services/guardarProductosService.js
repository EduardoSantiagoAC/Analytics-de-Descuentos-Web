
const Producto = require('../Models/Producto');

async function guardarProductos(productos) {
  const operaciones = productos.map(producto => {
    return Producto.findOneAndUpdate(
      { urlProducto: producto.urlProducto },
      {
        $set: {
          ...producto,
          fechaActualizacion: new Date()
        },
        $push: {
          historicoPrecios: {
            precio: producto.precio,
            fecha: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );
  });

  return Promise.all(operaciones);
}

module.exports = guardarProductos;
