import axios from 'axios';

const BASE_URL = 'https://analytics-de-descuentos-web.vercel.app'; // Cambia a tu IP local si pruebas en dispositivo real

export const buscarProductos = async (termino) => {
  const response = await axios.get(`${BASE_URL}/mercado-libre/buscar?q=${encodeURIComponent(termino)}&max=15`);
  return response.data;
};
