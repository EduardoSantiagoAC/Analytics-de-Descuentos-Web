const mongoose = require('mongoose');

// Conexión DIRECTA (sin variables de entorno)
mongoose.connect("mongodb+srv://SantiagoAD:unlock255@cluster0.4m8lv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error:", err));

  