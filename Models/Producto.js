const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    index: true 
  },
  precio: { 
    type: Number, 
    required: true,
    min: 0 
  },
  categoria: { 
    type: String,
    index: true 
  },
  tienda: { 
    type: String, 
    enum: ['Amazon', 'MercadoLibre', 'Walmart'], 
    required: true
  },
  urlProducto: String,
  imagen: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
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
  precioOriginal: {
    type: Number,
    validate: {
      validator: function(v) {
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
  esOferta: { 
    type: Boolean,
    default: false
  }
});

// Middleware para actualizar historial y calcular descuentos
productoSchema.pre('save', function(next) {
  if (this.isModified('precio')) {
    this.historicoPrecios.push({ 
      precio: this.precio,
      fecha: new Date()
    });

    if (this.precioOriginal && this.precioOriginal > this.precio) {
      this.estadoDescuento = 'Descuento';
      this.porcentajeDescuento = Math.round(
        ((this.precioOriginal - this.precio) / this.precioOriginal) * 100
      );
      this.esOferta = this.porcentajeDescuento > 10;
    } else {
      this.estadoDescuento = 'Normal';
      this.porcentajeDescuento = 0;
      this.esOferta = false;
    }
  }
  next();
});

// Método personalizado
productoSchema.methods.tendenciaPrecio = function() {
  if (this.historicoPrecios.length < 2) return 'Estable';
  const ultimo = this.historicoPrecios[this.historicoPrecios.length - 1].precio;
  const anterior = this.historicoPrecios[this.historicoPrecios.length - 2].precio;
  return ultimo < anterior ? 'Bajando' : 'Subiendo';
};

// Índices para optimización
productoSchema.index({ categoria: 1, estadoDescuento: 1 });
productoSchema.index({ precio: 1, fechaActualizacion: -1 });

module.exports = mongoose.model('Producto', productoSchema);
