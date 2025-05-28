const puppeteer = require('puppeteer');

async function buscarProductosMercadoLibre(terminoBusqueda, limite = 10) {
  const navegador = await puppeteer.launch({ headless: 'new' });
  const pagina = await navegador.newPage();
  const urlBusqueda = `https://www.mercadolibre.com.mx/search?as_word=${encodeURIComponent(terminoBusqueda)}`;
  await pagina.goto(urlBusqueda, { waitUntil: 'networkidle2' });

  const productos = await pagina.evaluate((limite) => {
    const items = [];
    const nodos = document.querySelectorAll('.ui-search-result');

    for (let i = 0; i < nodos.length && items.length < limite; i++) {
      const nodo = nodos[i];

      const nombre = nodo.querySelector('h2')?.innerText?.trim() || 'Sin nombre';
      const precioTexto = nodo.querySelector('.price-tag-fraction')?.innerText?.replace(/[^\d]/g, '');
      const precio = precioTexto ? parseFloat(precioTexto) : 0;

      // Extraer imagen real desde el primer <img> con src válido
      const img = nodo.querySelector('img');
      const imagen = img?.getAttribute('src') || 'https://via.placeholder.com/150';

      items.push({
        nombre,
        precio,
        imagen,
        tienda: 'MercadoLibre',
      });
    }

    return items;
  }, limite);

  await navegador.close();
  return productos;
}

module.exports = { buscarProductosMercadoLibre };
