const express = require('express');
const app = express();

// Importa las rutas (asegúrate que la carpeta se llame exactamente 'Routes')
const mercadoLibreRoutes = require('./Routes/mercadoLibre');

app.use(express.json());

// Montar rutas bajo '/mercado-libre'
app.use('/mercado-libre', mercadoLibreRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
