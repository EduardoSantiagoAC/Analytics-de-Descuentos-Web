import React, { useState } from "react";
import { View, TextInput, Button, ScrollView, StyleSheet, Text, ActivityIndicator, Switch } from "react-native";
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

const BusquedaScreen = () => {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ProductoML[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductoML | null>(null);

  const buscarProductos = async () => {
    if (!busqueda.trim()) return;

    setCargando(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3000/mercado-libre/buscar?q=${encodeURIComponent(busqueda)}&max=10`);
      console.log("Estado de la respuesta (búsqueda):", response.status, response.ok);
      const data = await response.json();
      console.log("Respuesta completa de la API (búsqueda):", data);
      if (!response.ok) {
        throw new Error(data.error || "Error al buscar productos");
      }
      setResultados(data.productos || [
        {
          nombre: "Producto de Prueba",
          precio: 150,
          precioOriginal: 200,
          porcentajeDescuento: 25,
          esOferta: true,
          urlProducto: "https://www.mercadolibre.com.mx",
          imagen: "https://via.placeholder.com/100x100.png?text=Producto",
          tienda: "MercadoLibre",
          fechaScraping: new Date().toISOString(),
        },
      ]);
      console.log("Resultados establecidos:", data.productos || []);
    } catch (err: any) {
      console.error("❌ Error al buscar productos:", err);
      setError("Error al buscar productos");
      setResultados([
        {
          nombre: "Producto de Prueba",
          precio: 150,
          precioOriginal: 200,
          porcentajeDescuento: 25,
          esOferta: true,
          urlProducto: "https://www.mercadolibre.com.mx",
          imagen: "https://via.placeholder.com/100x100.png?text=Producto",
          tienda: "MercadoLibre",
          fechaScraping: new Date().toISOString(),
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const filteredResults = soloOfertas ? resultados.filter(p => p.esOferta) : resultados;

  console.log("Resultados a renderizar:", filteredResults);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar producto..."
          style={styles.input}
        />
        <Button title="Buscar" onPress={buscarProductos} />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Mostrar solo ofertas</Text>
        <Switch value={soloOfertas} onValueChange={setSoloOfertas} />
      </View>

      {cargando && <ActivityIndicator size="large" color="#6200ee" style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView style={{ marginTop: 20 }}>
        {filteredResults.length === 0 && !cargando && !error && (
          <Text style={styles.noResults}>No se encontraron productos.</Text>
        )}
        {filteredResults.map((p, index) => (
          <ProductCard
            key={index}
            product={{
              id: index.toString(),
              title: p.nombre,
              image: p.imagen || "https://via.placeholder.com/100x100.png?text=Producto",
              oldPrice: Number(p.precioOriginal) || Number(p.precio),
              price: Number(p.precio),
              discount: Number(p.porcentajeDescuento) || 0,
              category: p.categoria || "General",
            }}
            onAddToCart={() => console.log("🛒 Añadido al carrito:", p.nombre)}
            onPress={() => setSelectedProduct(p)}
          />
        ))}
      </ScrollView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#fefefe",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 16,
    color: "#333",
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

export default BusquedaScreen;