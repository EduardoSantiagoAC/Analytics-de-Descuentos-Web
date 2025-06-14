const puppeteer = require('puppeteer');

// Función auxiliar para extraer precios
function extraerPrecio(texto) {
  const match = texto?.replace(/[^\d.,]/g, '').replace(',', '.').match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

async function scrapeMercadoLibrePuppeteer(query, maxResults = 15) {
  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;
  const browser = await puppeteer.launch({
    headless: 'new', // Cambiado para producción
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' //Buscador basico y predeterminado
  );
  await page.setViewport({ width: 1366, height: 768 });

  try {
    console.log(`🌐 Abriendo: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const selectors = [
      'li.ui-search-layout__item',
      'div.andes-card',
      'div.ui-search-result'
    ];
    
    let foundSelector = false;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 20000 });
        console.log(`✅ Selector encontrado: ${selector}`);
        foundSelector = true;
        break;
      } catch (err) {
        console.log(`⚠️ Selector ${selector} no encontrado, intentando el siguiente...`);
      }
    }

    if (!foundSelector) {
      throw new Error('No se encontraron selectores de productos en la página');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    const productos = await page.evaluate((max) => {
      const items = document.querySelectorAll('li.ui-search-layout__item, div.andes-card, div.ui-search-result');
      const resultado = [];

      for (let i = 0; i < items.length && resultado.length < max; i++) {
        const item = items[i];

        try {
          const nombre = item.querySelector('a.poly-component__title, h2.ui-search-item__title, h2.andes-card__title')?.innerText.trim() || null;
          const urlProducto = item.querySelector('a.poly-component__title, a.ui-search-link')?.href || null;

          const precioDescuentoTexto = item.querySelector('.andes-money-amount--cents-superscript .andes-money-amount__fraction, .ui-search-price__part .andes-money-amount__fraction')?.innerText || '';
          const precioOriginalTexto = item.querySelector('.andes-money-amount--previous .andes-money-amount__fraction, .ui-search-price__original-value .andes-money-amount__fraction')?.innerText || '';

          const imgTag = item.querySelector('img');
          let imagen = '';

          if (imgTag) {
            imagen = imgTag.getAttribute('src')?.trim() || '';
            if (!imagen || imagen.startsWith('data:image') || imagen.includes('placeholder.com')) {
              imagen = imgTag.getAttribute('data-src')?.trim() || imgTag.getAttribute('data-srcset')?.trim() || '';
            }
            if (imagen.includes(' ')) {
              imagen = imagen.split(' ')[0];
            }
          }

          if (nombre && urlProducto) {
            resultado.push({
              nombre,
              precioDescuentoTexto,
              precioOriginalTexto,
              urlProducto,
              imagen: imagen || 'https://via.placeholder.com/150',
              tienda: 'MercadoLibre',
              fechaScraping: new Date().toISOString()
            });
          }
        } catch (_) {
          continue;
        }
      }

      return resultado;
    }, maxResults);

    const productosFormateados = productos.map(producto => {
      const precioConDescuento = extraerPrecio(producto.precioDescuentoTexto);
      const precioOriginal = extraerPrecio(producto.precioOriginalTexto);

      let porcentajeDescuento = 0;
      let estadoDescuento = 'Normal';
      let esOferta = false;

      if (precioOriginal && precioConDescuento && precioOriginal > precioConDescuento) {
        porcentajeDescuento = Math.round(((precioOriginal - precioConDescuento) / precioOriginal) * 100);
        estadoDescuento = 'Descuento';
        esOferta = porcentajeDescuento > 10;
      }

      return {
        nombre: producto.nombre,
        precio: precioConDescuento || precioOriginal || null,
        precioOriginal: precioOriginal || precioConDescuento || null,
        urlProducto: producto.urlProducto,
        imagen: producto.imagen,
        tienda: producto.tienda,
        estadoDescuento,
        porcentajeDescuento,
        esOferta,
        fechaScraping: producto.fechaScraping
      };
    });

    console.log(`✅ Productos encontrados: ${productosFormateados.length}`);
    return productosFormateados;
  } catch (err) {
    console.error(`❌ Error en scraping MercadoLibre con Puppeteer:`, err.stack);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = scrapeMercadoLibrePuppeteer;