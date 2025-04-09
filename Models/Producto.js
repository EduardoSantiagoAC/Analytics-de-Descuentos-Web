const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  // Campos existentes
  nombre: { 
    type: String, 
    required: true,
    index: true // Para búsquedas más rápidas
  },
  precio: { 
    type: Number, 
    required: true,
    min: 0 // Validación para precios positivos
  },
  categoria: { 
    type: String,
    index: true 
  },
  tienda: { 
    type: String, 
    enum: ['Amazon', 'MercadoLibre', 'Walmart'], // Extensible
    required: true
  },
  urlProducto: String,
  stock: { 
    type: Boolean, 
    default: true 
  },
  umbralEscasez: { 
    type: Number, 
    default: 3 
  },
  historicoPrecios: [{
    precio: Number,
    fecha: { 
      type: Date, 
      default: Date.now 
    }
  }],
  fechaActualizacion: { 
    type: Date, 
    default: Date.now 
  },

  // Nuevos campos para descuentos
  precioOriginal: {
    type: Number,
    validate: {
      validator: function(v) {
        // El precio original debe ser mayor que el precio con descuento
        return v === null || v > this.precio;
      },
      message: 'El precio original debe ser mayor al precio actual'
    }
  },
  estadoDescuento: {
    type: String,
    enum: ['Normal', 'Descuento'],
    default: 'Normal'
  },
  porcentajeDescuento: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  esOferta: { // Campo adicional para futuras funcionalidades
    type: Boolean,
    default: false
  }
});

// Middleware para actualizar histórico de precios
productoSchema.pre('save', function(next) {
  if (this.isModified('precio')) {
    this.historicoPrecios.push({ 
      precio: this.precio,
      fecha: new Date()
    });

    // Actualiza automáticamente el estado de descuento
    if (this.precioOriginal && this.precioOriginal > this.precio) {
      this.estadoDescuento = 'Descuento';
      this.porcentajeDescuento = Math.round(
        ((this.precioOriginal - this.precio) / this.precioOriginal) * 100
      );
      this.esOferta = this.porcentajeDescuento > 10; // Oferta si >10%
    } else {
      this.estadoDescuento = 'Normal';
      this.porcentajeDescuento = 0;
      this.esOferta = false;
    }
  }
  next();
});

// Método para calcular tendencia de precios
productoSchema.methods.tendenciaPrecio = function() {
  if (this.historicoPrecios.length < 2) return 'Estable';
  const ultimo = this.historicoPrecios[this.historicoPrecios.length - 1].precio;
  const anterior = this.historicoPrecios[this.historicoPrecios.length - 2].precio;
  return ultimo < anterior ? 'Bajando' : 'Subiendo';
};

// Índices para mejor rendimiento
productoSchema.index({ categoria: 1, estadoDescuento: 1 });
productoSchema.index({ precio: 1, fechaActualizacion: -1 });

module.exports = mongoose.model('Producto', productoSchema);