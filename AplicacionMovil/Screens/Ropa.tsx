import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import ProductCard from "../componentes/TarjetaProducto";
import ProductoPopup from "../componentes/PopUpProducto";

interface ProductoML {
  nombre: string;
  precio: number;
  precioOriginal: number;
  porcentajeDescuento: number;
  esOferta: boolean;
  urlProducto: string;
  imagen: string;
  tienda: string;
  fechaScraping: string;
}

const RopaScreen = () => {
  const [productos, setProductos] = useState<ProductoML[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductoML | null>(null);

  useEffect(() => {
    buscarProductos();
  }, []);

  const buscarProductos = async () => {
    setCargando(true);
    setError("");

    try {
      const response = await fetch(`https://analytics-de-descuentos-web.vercel.app/mercado-libre/buscar?q=ropa&max=10`);
      console.log("Estado de la respuesta (ropa):", response.status, response.ok); // Log
      const data = await response.json();
      console.log("Respuesta completa de la API (ropa):", data); // Log
      if (!response.ok) {
        throw new Error(data.error || "Error al buscar productos");
      }
      setProductos(data.productos || []);
      console.log("Productos establecidos (ropa):", data.productos || []); // Log
    } catch (err: any) {
      console.error("❌ Error al cargar productos de ropa:", err);
      setError("Error al cargar productos de ropa");
    } finally {
      setCargando(false);
    }
  };

  console.log("Productos a renderizar (ropa):", productos); // Log final

  return (
    <ScrollView style={styles.container}>
      {cargando && <ActivityIndicator size="large" color="#6200ee" style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.grid}>
        {productos.length === 0 && !cargando && !error && (
          <Text style={styles.noResults}>No se encontraron productos.</Text>
        )}
        {productos.map((p, index) => (
          <ProductCard
            key={index}
            product={{
              id: index.toString(),
              title: p.nombre,
              image: p.imagen || "https://via.placeholder.com/100x100.png?text=Producto",
              oldPrice: Number(p.precioOriginal) || Number(p.precio),
              price: Number(p.precio),
              discount: Number(p.porcentajeDescuento) || 0,
              category: "Ropa",
            }}
            onAddToCart={() => console.log("🛒 Añadido al carrito:", p.nombre)}
            onPress={() => setSelectedProduct(p)}
          />
        ))}
      </View>

      {selectedProduct && (
        <ProductoPopup
          isVisible={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          producto={{
            id: selectedProduct.urlProducto,
            imageUrl: selectedProduct.imagen,
            title: selectedProduct.nombre,
            description: `Precio: $${selectedProduct.precio.toFixed(2)}${selectedProduct.porcentajeDescuento ? ` (${selectedProduct.porcentajeDescuento}% OFF)` : ""}`,
            price: `$${selectedProduct.precio.toFixed(2)}`,
            link: selectedProduct.urlProducto,
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fefefe",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default RopaScreen;