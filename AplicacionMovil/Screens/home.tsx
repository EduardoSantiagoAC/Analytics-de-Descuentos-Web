import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TextInput,
  Keyboard,
  Platform,
  TouchableOpacity,
} from "react-native";
import Header from "../componentes/Cabezal";
import CategoryTabs from "../componentes/Categorias";
import PromoBanner from "../componentes/promo";
import AlertCard from "../componentes/Alertas";
import ProductCard from "../componentes/TarjetaProducto";
import ProductoPopup from "../componentes/PopUpProducto";
import { theme } from "../theme/theme";
import { LinearGradient } from "expo-linear-gradient";

interface Product {
  id: string;
  title: string;
  image: string;
  oldPrice: number;
  price: number;
  discount: number;
  category: string;
}

const BACKEND_URL = "http://83-229-35-215.cloud-xip.com:3000"; // url del backend en kamatera
const DEFAULT_IMAGE = "https://dummyimage.com/150x150/ccc/000.png&text=Producto";

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Home");
  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    buscarProductosInicial();
  }, []);

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

  const convertirProducto = (p: any, index: number): Product => {
    console.log("📋 Producto crudo:", JSON.stringify(p, null, 2));
    const parsePrice = (value: any): number => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const cleanedValue = value.replace(/[^0-9.]/g, "");
        return parseFloat(cleanedValue) || 0;
      }
      return 0;
    };

    // Asegurar IDs únicos con un hash simple basado en el índice y el título
    const uniqueId = `${p.urlProducto || p._id || p.title || 'product'}-${index}`;
    return {
      id: uniqueId,
      title: p.nombre || p.title || "Sin título",
      image: p.imagen || p.image || DEFAULT_IMAGE,
      oldPrice: parsePrice(p.precioOriginal || p.oldPrice || p.precio || p.price || 0),
      price: parsePrice(p.precio || p.price || 0),
      discount: Number(p.porcentajeDescuento || p.discount || 0),
      category: p.categoria || asignarCategoria(p.nombre || p.title || ""),
    };
  };

  const buscarProductosInicial = async () => {
    setCargando(true);
    setError("");
    setProductos([]);
    try {
      const url = `${BACKEND_URL}/mercado-libre/buscar?q=ofertas&max=10`;
      console.log(`🌐 Enviando solicitud inicial a ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ Estado de la respuesta inicial:", response.status, response.ok);
      const data = await response.json();
      console.log("📊 Respuesta completa de la API inicial:", JSON.stringify(data, null, 2));
      if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
      const productosConvertidos = (Array.isArray(data) ? data : data.productos || []).map(
        (item: any, index: number) => convertirProducto(item, index)
      );
      console.log("📋 Productos convertidos iniciales:", JSON.stringify(productosConvertidos, null, 2));
      if (productosConvertidos.length === 0) {
        console.warn("⚠️ No se encontraron productos en la respuesta inicial");
      }
      setProductos(productosConvertidos.length ? productosConvertidos : [
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
      console.error("❌ Error cargando productos iniciales:", err.message);
      setError(`Error al cargar productos iniciales: ${err.message}`);
      setProductos([
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

  const buscarProductos = async () => {
    const termino = busqueda.trim();
    if (!termino) return;
    Keyboard.dismiss();
    setCargando(true);
    setError("");
    setProductos([]);

    try {
      const url = `${BACKEND_URL}/mercado-libre/buscar?q=${encodeURIComponent(termino)}&max=10`;
      console.log(`🌐 Enviando solicitud de búsqueda a ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ Estado de la respuesta de búsqueda:", response.status, response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("📊 Respuesta de error del backend:", errorText);
        throw new Error(`Error HTTP ${response.status}: ${errorText || "Sin detalles"}`);
      }
      const data = await response.json();
      console.log("📊 Respuesta completa de la API de búsqueda:", JSON.stringify(data, null, 2));
      const productosConvertidos = (Array.isArray(data) ? data : data.productos || []).map(
        (item: any, index: number) => convertirProducto(item, index)
      );
      console.log("📋 Productos convertidos de búsqueda:", JSON.stringify(productosConvertidos, null, 2));
      if (productosConvertidos.length === 0) {
        console.warn("⚠️ No se encontraron productos en la búsqueda");
        setError("No se encontraron productos para esta búsqueda.");
      }
      setProductos(productosConvertidos.length ? productosConvertidos : []);
    } catch (err: any) {
      console.error("❌ Error en búsqueda:", err.message);
      setError(`Error al buscar productos: ${err.message}. Verifica la conexión o el backend.`);
      setProductos([
        {
          id: "1",
          title: "Producto de Prueba (Error)",
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

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    console.log(`📋 Categoría activa cambiada a: ${category}`);
  };

  const filteredProducts = activeCategory === "Home"
    ? productos
    : productos.filter(p => p.category === activeCategory);

  console.log("📋 Productos filtrados a renderizar:", JSON.stringify(filteredProducts, null, 2));

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.primary + "33"]}
      style={styles.container}
    >
      <FlatList
        ListHeaderComponent={
          <>
            <Header />
            <View style={styles.searchContainer}>
              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar productos..."
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={buscarProductos}
              >
                <Text style={styles.searchButtonText}>BUSCAR</Text>
              </TouchableOpacity>
            </View>
            <CategoryTabs
              onCategoryChange={handleCategoryChange}
              activeCategory={activeCategory}
            />
            <View style={styles.promoContainer}>
              <PromoBanner />
              <AlertCard />
            </View>
            {cargando && <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {!cargando && !error && filteredProducts.length === 0 && (
              <Text style={styles.noProducts}>No hay productos en esta categoría.</Text>
            )}
          </>
        }
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => {
          console.log("📋 Renderizando ProductCard para:", JSON.stringify(item, null, 2));
          return (
            <ProductCard
              product={item}
              onPress={() => setSelectedProduct(item)}
            />
          );
        }}
        contentContainerStyle={styles.productsWrapper}
      />

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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.regular,
    backgroundColor: theme.colors.cardBackground,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }
      : theme.shadows.small),
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.large,
    marginLeft: theme.spacing.sm,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }
      : theme.shadows.small),
  },
  searchButtonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
  },
  promoContainer: {
    marginVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  columnWrapper: {
    justifyContent: "space-around",
    marginVertical: theme.spacing.sm,
  },
  productsWrapper: {
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  loader: {
    marginVertical: theme.spacing.lg,
  },
  noProducts: {
    textAlign: "center",
    marginVertical: theme.spacing.lg,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  errorText: {
    textAlign: "center",
    marginVertical: theme.spacing.lg,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
  },
});

export default HomeScreen;