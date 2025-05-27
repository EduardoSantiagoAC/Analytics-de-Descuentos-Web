import React, { useState } from "react";
import {
  ScrollView,
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

// 👇 Cambiá esta IP por la IP local de tu PC si usás un celular físico
const BACKEND_URL = "http://192.168.0.9:3000";

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeCategory, setActiveCategory] = useState<string>("Home");

  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

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
      console.log("📦 Productos recibidos:", data);

      if (!Array.isArray(data)) throw new Error("Respuesta inválida");

      const productosConvertidos = data.map((p: any, index: number): Product => ({
        id: index,
        title: p.nombre,
        image: p.imagen || "https://via.placeholder.com/150",
        oldPrice: p.precioOriginal || p.precio,
        price: p.precio,
        discount: p.porcentajeDescuento || 0,
        category: "Ropa",
      }));

      setProductos(productosConvertidos);
    } catch (err: any) {
      console.error("❌ Error cargando productos:", err.message);
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
    <ScrollView style={styles.container}>
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

      <CategoryTabs onCategoryChange={handleCategoryChange} activeCategory={activeCategory} />
      <PromoBanner />
      <AlertCard />

      <View style={styles.productsWrapper}>
        {cargando ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredProducts.length === 0 ? (
          <Text style={styles.noProducts}>No hay productos disponibles.</Text>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => navigation.navigate(product.category)}
            />
          ))
        )}
      </View>
    </ScrollView>
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
