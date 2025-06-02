import React, { useState } from "react";
import { View, TextInput, Button, ScrollView, StyleSheet, Text, ActivityIndicator, Switch } from "react-native";
import ProductCard from "../componentes/TarjetaProducto";
import ProductoPopup from "../componentes/PopUpProducto";
import { theme } from "../theme/theme";

interface Product {
  id: string;
  title: string;
  image: string;
  oldPrice: number;
  price: number;
  discount: number;
  category: string;
}

const BACKEND_URL = "http://localhost:3000";
const DEFAULT_IMAGE = "https://dummyimage.com/150x150/ccc/000.png&text=Producto";

const BusquedaScreen = () => {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const asignarCategoria = (nombre: string): string => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes("tenis") || nombreLower.includes("ropa") || nombreLower.includes("zapat") || nombreLower.includes("camis")) {
      return "Ropa";
    }
    if (nombreLower.includes("samsung") || nombreLower.includes("motorola") || nombreLower.includes("laptop") || nombreLower.includes("dron") || nombreLower.includes("roku")) {
      return "Electrónica";
    }
    if (nombreLower.includes("hidrolavadora") || nombreLower.includes("mueble") || nombreLower.includes("cocina")) {
      return "Hogar";
    }
    return "General";
  };

  const convertirProducto = (p: any): Product => {
    console.log("📋 Producto crudo:", JSON.stringify(p, null, 2));
    return {
      id: p.urlProducto || p._id || Math.random().toString(),
      title: p.nombre || p.title || "Sin título",
      image: p.imagen || p.image || DEFAULT_IMAGE,
      oldPrice: Number(p.precioOriginal || p.oldPrice || p.precio || p.price || 0),
      price: Number(p.precio || p.price || 0),
      discount: Number(p.porcentajeDescuento || p.discount || 0),
      category: p.categoria || asignarCategoria(p.nombre || p.title || ""),
    };
  };

  const buscarProductos = async () => {
    if (!busqueda.trim()) return;

    setCargando(true);
    setError("");
    setResultados([]);

    try {
      const url = `${BACKEND_URL}/mercado-libre/buscar?q=${encodeURIComponent(busqueda)}&max=10`;
      console.log(`🌐 Enviando solicitud a ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ Estado de la respuesta:", response.status, response.ok);
      const data = await response.json();
      console.log("📊 Respuesta completa de la API:", JSON.stringify(data, null, 2));
      if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
      const productosConvertidos = (Array.isArray(data) ? data : data.productos || []).map(convertirProducto);
      console.log("📋 Productos convertidos:", JSON.stringify(productosConvertidos, null, 2));
      if (productosConvertidos.length === 0) {
        console.warn("⚠️ No se encontraron productos en la búsqueda");
      }
      setResultados(productosConvertidos.length ? productosConvertidos : [
        {
          id: "1",
          title: "Producto de Prueba",
          image: DEFAULT_IMAGE,
          oldPrice: 200,
          price: 150,
          discount: 25,
          category: "General",
        },
      ]);
    } catch (err: any) {
      console.error("❌ Error al buscar productos:", err.message);
      setError(`Error al buscar productos: ${err.message}`);
      setResultados([
        {
          id: "1",
          title: "Producto de Prueba",
          image: DEFAULT_IMAGE,
          oldPrice: 200,
          price: 150,
          discount: 25,
          category: "General",
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const filteredResults = soloOfertas ? resultados.filter(p => p.discount > 0) : resultados;

  console.log("📋 Resultados a renderizar:", JSON.stringify(filteredResults, null, 2));

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar producto..."
          style={styles.input}
        />
        <Button title="Buscar" onPress={buscarProductos} color={theme.colors.primary} />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Mostrar solo ofertas</Text>
        <Switch
          value={soloOfertas}
          onValueChange={setSoloOfertas}
          trackColor={{ true: theme.colors.primary }}
        />
      </View>

      {cargando && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.lg }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView style={{ marginTop: theme.spacing.md }}>
        {filteredResults.length === 0 && !cargando && !error && (
          <Text style={styles.noResults}>No se encontraron productos.</Text>
        )}
        {filteredResults.map((p) => {
          console.log("📋 Renderizando ProductCard para:", JSON.stringify(p, null, 2));
          return (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={() => console.log("🛒 Añadido al carrito:", p.title)}
              onPress={() => setSelectedProduct(p)}
            />
          );
        })}
      </ScrollView>

      {selectedProduct && (
        <ProductoPopup
          isVisible={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          producto={{
            id: selectedProduct.id,
            imageUrl: selectedProduct.image,
            title: selectedProduct.title,
            description: `Precio: $${selectedProduct.price.toFixed(2)}${selectedProduct.discount ? ` (${selectedProduct.discount}% OFF)` : ""}`,
            price: `$${selectedProduct.price.toFixed(2)}`,
            link: selectedProduct.id,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.regular,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.small,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  filterLabel: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
  },
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    textAlign: "center",
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.regular,
  },
  noResults: {
    textAlign: "center",
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
});

export default BusquedaScreen;