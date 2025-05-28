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
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Header from "../componentes/Cabezal";
import CategoryTabs from "../componentes/Categorias";
import PromoBanner from "../componentes/promo";
import AlertCard from "../componentes/Alertas";
import ProductCard from "../componentes/TarjetaProducto";

type RootStackParamList = {
  Home: undefined;
  Ropa: undefined;
  Electrónica: undefined;
  Hogar: undefined;
};

type ProductCategory = keyof Omit<RootStackParamList, "Home">;

interface Product {
  id: number;
  title: string;
  image: string;
  oldPrice: number;
  price: number;
  discount: number;
  category: ProductCategory;
}

// Cambia esta IP por la IP local donde corre tu backend, debe incluir http://
const BACKEND_URL = "http://192.168.56.1:3000";

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeCategory, setActiveCategory] = useState<string>("Home");
  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    buscarProductosInicial();
  }, []);

  const buscarProductosInicial = async () => {
    setCargando(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/mercado-libre/destacados`);
      const data = await response.json();
      const productosConvertidos = data.map((p: any, index: number): Product => ({
        id: index,
        title: p.nombre,
        image: p.imagen || "https://via.placeholder.com/150",
        oldPrice: p.precioOriginal || p.precio,
        price: p.precio,
        discount: p.porcentajeDescuento || 0,
        category: p.categoria || "Ropa",
      }));
      setProductos(productosConvertidos);
    } catch (err: any) {
      console.error("❌ Error cargando productos iniciales:", err.message);
      setError("No se pudieron cargar los productos iniciales.");
    } finally {
      setCargando(false);
    }
  };

  const buscarProductos = async () => {
    if (!busqueda.trim()) return;
    Keyboard.dismiss();
    setCargando(true);
    setError("");
    setProductos([]);

    try {
      const response = await fetch(
        `${BACKEND_URL}/mercado-libre/buscar?q=${encodeURIComponent(busqueda)}&max=10`
      );
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error("Respuesta inválida");

      const productosConvertidos = data.map((p: any, index: number): Product => ({
        id: index,
        title: p.nombre,
        image: p.imagen || "https://via.placeholder.com/150",
        oldPrice: p.precioOriginal || p.precio,
        price: p.precio,
        discount: p.porcentajeDescuento || 0,
        category: p.categoria || "Ropa",
      }));

      setProductos(productosConvertidos);
    } catch (err: any) {
      console.error("❌ Error en búsqueda:", err.message);
      setError("No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category !== "Home") {
      navigation.navigate(category as keyof RootStackParamList);
    }
  };

  const filteredProducts =
    activeCategory === "Home"
      ? productos
      : productos.filter((product) => product.category === activeCategory);

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
              <Button title="Buscar" onPress={buscarProductos} />
            </View>
            <CategoryTabs
              onCategoryChange={handleCategoryChange}
              activeCategory={activeCategory}
            />
            <PromoBanner />
            <AlertCard />
            {cargando && <ActivityIndicator size="large" color="#6200ee" />}
            {error !== "" && <Text style={styles.errorText}>{error}</Text>}
            {!cargando && !error && filteredProducts.length === 0 && (
              <Text style={styles.noProducts}>No hay productos disponibles.</Text>
            )}
          </>
        }
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate(item.category)}
          />
        )}
        contentContainerStyle={styles.productsWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fefefe",
  },
  searchContainer: {
    flexDirection: "column",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  productsWrapper: {
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  noProducts: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
});

export default HomeScreen;
