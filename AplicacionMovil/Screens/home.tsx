import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TextInput,
  Button,
  Keyboard,
} from "react-native";
import Header from "../componentes/Cabezal";
import CategoryTabs from "../componentes/Categorias";
import PromoBanner from "../componentes/promo";
import AlertCard from "../componentes/Alertas";
import ProductCard from "../componentes/TarjetaProducto";
import ProductoPopup from "../componentes/PopUpProducto";
import { theme } from "../theme/theme"; //carpeta de los diseños

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

  const buscarProductosInicial = async () => {
    setCargando(true);
    setError("");
    setProductos([]);
    try {
      const url = `${BACKEND_URL}/mercado-libre/buscar?q=ofertas&max=10`;
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
        console.warn("⚠️ No se encontraron productos en la respuesta");
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
      setError(`Error al cargar productos: ${err.message}`);
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
      console.log(`🌐 Enviando solicitud a ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ Estado de la respuesta (búsqueda):", response.status, response.ok);
      const data = await response.json();
      console.log("📊 Respuesta completa de la API (búsqueda):", JSON.stringify(data, null, 2));
      if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
      const productosConvertidos = (Array.isArray(data) ? data : data.productos || []).map(convertirProducto);
      console.log("📋 Productos convertidos (búsqueda):", JSON.stringify(productosConvertidos, null, 2));
      if (productosConvertidos.length === 0) {
        console.warn("⚠️ No se encontraron productos en la búsqueda");
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
      console.error("❌ Error en búsqueda:", err.message);
      setError(`Error al buscar productos: ${err.message}`);
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

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    console.log(`📋 Categoría activa cambiada a: ${category}`);
  };

  const añadirAlCarrito = (producto: Product) => {
    console.log("🛒 Añadido al carrito:", producto.title);
  };

  const filteredProducts = activeCategory === "Home"
    ? productos
    : productos.filter(p => p.category === activeCategory);

  console.log("📋 Productos a renderizar:", JSON.stringify(filteredProducts, null, 2));

  return (
    <View style={styles.container}>
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
              <Button title="Buscar" onPress={buscarProductos} color={theme.colors.primary} />
            </View>
            <CategoryTabs
              onCategoryChange={handleCategoryChange}
              activeCategory={activeCategory}
            />
            <PromoBanner />
            <AlertCard />
            {cargando && <ActivityIndicator size="large" color={theme.colors.primary} />}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {!cargando && !error && filteredProducts.length === 0 && (
              <Text style={styles.noProducts}>No hay productos en esta categoría.</Text>
            )}
          </>
        }
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          console.log("📋 Renderizando ProductCard para:", JSON.stringify(item, null, 2));
          return (
            <ProductCard
              product={item}
              onAddToCart={añadirAlCarrito}
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
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.regular,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.small,
  },
  productsWrapper: {
    paddingBottom: theme.spacing.lg,
  },
  noProducts: {
    textAlign: "center",
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  errorText: {
    textAlign: "center",
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
  },
});

export default HomeScreen;