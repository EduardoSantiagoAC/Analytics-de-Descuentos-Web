const express = require('express');
const app = express();

const mercadoLibreRoutes = require('./Routes/mercadoLibre');

app.use(express.json());

// Conectar la ruta de MercadoLibre
app.use('/mercado-libre', mercadoLibre);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
