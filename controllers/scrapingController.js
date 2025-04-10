const Producto = require('../Models/Producto');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');


puppeteer.use(StealthPlugin());

const scrapeAmazon = async (productoNombre) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });

  try {
    await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(productoNombre)}&ref=nb_sb_noss`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    
    await page.waitForSelector('.s-result-item', { timeout: 15000 });

    const productos = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.s-result-item')).map(item => {
        const nombre = item.querySelector('h2 a span')?.textContent.trim();
        const precioTexto = item.querySelector('.a-price .a-offscreen')?.textContent.replace(/[^0-9.]/g, '');
        const precioOriginalTexto = item.querySelector('.a-price[data-a-strike="true"] .a-offscreen')?.textContent.replace(/[^0-9.]/g, '');
        const url = item.querySelector('h2 a')?.href.split('?')[0];
        
        return {
          nombre,
          precio: precioTexto ? parseFloat(precioTexto) : null,
          precioOriginal: precioOriginalTexto ? parseFloat(precioOriginalTexto) : null,
          urlProducto: url,
          tienda: 'Amazon'
        };
      }).filter(item => item.nombre && item.precio);
    });

    await browser.close();
    return productos;
  } catch (error) {
    console.error('Error en scraping:', error);
    await browser.close();
    return [];
  }
};

exports.scrapeAndSave = async (req, res) => {
  try {
    const { producto } = req.body;
    
    
    const productosScrapeados = await scrapeAmazon(producto);
    if (productosScrapeados.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontraron productos en Amazon o el scraping falló.' 
      });
    }

    
    const operaciones = productosScrapeados.map(async (item) => {
      try {
        const productoActualizado = await Producto.findOneAndUpdate(
          { urlProducto: item.urlProducto },
          {
            $set: {
              nombre: item.nombre,
              precio: item.precio,
              precioOriginal: item.precioOriginal || item.precio,
              categoria: 'Electrónicos',
              tienda: item.tienda,
              urlProducto: item.urlProducto,
              fechaActualizacion: new Date()
            },
            $push: {
              historicoPrecios: {
                precio: item.precio,
                fecha: new Date()
              }
            }
          },
          { upsert: true, new: true }
        );
        return productoActualizado;
      } catch (error) {
        console.error(`Error al guardar ${item.nombre}:`, error);
        return null;
      }
    });

    const resultados = await Promise.all(operaciones);
    const productosGuardados = resultados.filter(item => item !== null);

    
    const stats = {
      total: productosGuardados.length,
      conDescuento: productosGuardados.filter(p => p.estadoDescuento === 'Descuento').length,
      precioPromedio: productosGuardados.reduce((sum, p) => sum + p.precio, 0) / productosGuardados.length,
      mayorDescuento: Math.max(...productosGuardados.map(p => p.porcentajeDescuento))
    };

    res.json({
      success: true,
      stats,
      data: productosGuardados
    });
  } catch (error) {
    console.error('Error en el controlador:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      detalle: error.message 
    });
  }
};