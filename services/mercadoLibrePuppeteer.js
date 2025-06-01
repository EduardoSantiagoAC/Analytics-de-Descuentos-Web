const puppeteer = require('puppeteer');

// Función auxiliar para extraer precios
function extraerPrecio(texto) {
  const match = texto?.replace(/[^\d.,]/g, '').replace(',', '.').match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

// Función auxiliar para extraer unidades disponibles
function extraerUnidades(texto) {
  const match = texto?.match(/(\d+)\s*(?:unidades?|disponibles?)/i);
  return match ? parseInt(match[1]) : null;
}

async function scrapeMercadoLibrePuppeteer(query, maxResults = 15) {
  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );
  await page.setViewport({ width: 1366, height: 768 });

  try {
    console.log(`🌐 Abriendo página de búsqueda: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForSelector('li.ui-search-layout__item', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 2500));

    const productos = await page.evaluate((max) => {
      const items = document.querySelectorAll('li.ui-search-layout__item');
      const resultado = [];

      for (let i = 0; i < items.length && resultado.length < max; i++) {
        const item = items[i];

        try {
          const nombre = item.querySelector('a.poly-component__title')?.innerText.trim() || null;
          const urlProducto = item.querySelector('a.poly-component__title')?.href || null;

          // Precio con descuento (el grande)
          const precioDescuentoTexto = item.querySelector('.andes-money-amount--cents-superscript .andes-money-amount__fraction')?.innerText || '';
          // Precio original (el tachado)
          const precioOriginalTexto = item.querySelector('.andes-money-amount--previous .andes-money-amount__fraction')?.innerText || '';

          const imgTag = item.querySelector('img');
          let imagen = '';

          if (imgTag) {
            imagen = imgTag.getAttribute('src')?.trim() || '';
            if (
              !imagen ||
              imagen.startsWith('data:image') ||
              imagen.includes('placeholder.com')
            ) {
              imagen = imgTag.getAttribute('data-src')?.trim()
                    || imgTag.getAttribute('data-srcset')?.trim()
                    || '';
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

    // Scrapear stock desde la página individual de cada producto
    const productosFormateados = [];
    for (const producto of productos) {
      try {
        console.log(`🌐 Visitando producto: ${producto.urlProducto}`);
        await page.goto(producto.urlProducto, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // Esperar selector de stock o contenedor relevante
        await page.waitForSelector('.ui-pdp-buybox, .ui-pdp-stock-information, .ui-pdp-action--primary', { timeout: 10000 }).catch(() => console.log(`⚠️ No se encontraron selectores de stock para ${producto.urlProducto}`));

        const stockInfo = await page.evaluate(() => {
          // Posibles selectores para stock
          const stockElement = document.querySelector('.ui-pdp-stock-information') ||
                              document.querySelector('.ui-pdp-buybox__quantity') ||
                              document.querySelector('.ui-pdp-buybox');
          const stockTexto = stockElement?.innerText || '';
          
          // Verificar si el botón de compra está habilitado
          const comprarButton = document.querySelector('.andes-button--large:not(.andes-button--disabled)') ||
                               document.querySelector('.ui-pdp-action--primary:not([disabled])');
          
          return {
            stockTexto,
            isComprarEnabled: !!comprarButton
          };
        });

        // Determinar stock
        const stockTextoLower = stockInfo.stockTexto.toLowerCase();
        const stock = !stockTextoLower.includes('agotado') && 
                      !stockTextoLower.includes('no disponible') && 
                      stockInfo.isComprarEnabled;
        
        // Extraer unidades disponibles
        const unidadesDisponibles = extraerUnidades(stockInfo.stockTexto);

        // Log de depuración
        console.log(`📦 Stock para ${producto.nombre}: stock=${stock}, unidadesDisponibles=${unidadesDisponibles}, texto=${stockInfo.stockTexto}`);

        // Formatear precios y descuentos
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

        productosFormateados.push({
          nombre: producto.nombre,
          precio: precioConDescuento || precioOriginal || null,
          precioOriginal: precioOriginal || precioConDescuento || null,
          urlProducto: producto.urlProducto,
          imagen: producto.imagen,
          tienda: producto.tienda,
          estadoDescuento,
          porcentajeDescuento,
          esOferta,
          stock,
          unidadesDisponibles: unidadesDisponibles || null,
          fechaScraping: producto.fechaScraping
        });

        // Retraso para evitar bloqueos
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.warn(`⚠️ Error al scrapear stock para ${producto.urlProducto}: ${err.message}`);
        productosFormateados.push({
          ...producto,
          precio: extraerPrecio(producto.precioDescuentoTexto) || extraerPrecio(producto.precioOriginalTexto) || null,
          precioOriginal: extraerPrecio(producto.precioOriginalTexto) || extraerPrecio(producto.precioDescuentoTexto) || null,
          estadoDescuento: 'Normal',
          porcentajeDescuento: 0,
          esOferta: false,
          stock: true, // Valor por defecto si falla
          unidadesDisponibles: null,
          fechaScraping: producto.fechaScraping
        });
      }
    }

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