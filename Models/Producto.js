const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, index: true },
  precio: { type: Number, required: true },
  precioAnterior: Number,
  categoria: { type: String, index: true },
  tienda: { type: String, enum: ['Amazon', 'MercadoLibre', 'Walmart'] },
  urlProducto: String,
  stock: { type: Boolean, default: true },
  umbralEscasez: { type: Number, default: 3 }, // Nivel de stock crítico
  historicoPrecios: [{
    precio: Number,
    fecha: { type: Date, default: Date.now }
  }],
  fechaActualizacion: { type: Date, default: Date.now }
});

// Actualiza histórico automáticamente
productoSchema.pre('save', function(next) {
  if (this.isModified('precio')) {
    this.historicoPrecios.push({ precio: this.precio });
  }
  next();
});

module.exports = mongoose.model('Producto', productoSchema);