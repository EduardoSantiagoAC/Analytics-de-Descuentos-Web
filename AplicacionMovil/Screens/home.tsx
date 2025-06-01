/*
Este archivo es la creacion principal de nuestro producto desde donde se entra en el app.tsx
Aqui se manejan las navegaciones y como muchos componentes son usados por lo que es crucial detallar
cuales son los cambios realizados al momento de modificar por que un mal cambio a este podria romper la entrada de la app
y posiblemente hacer que la misma no cargue 
*/
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

// tipos de la ropa 
type RootStackParamList = {
  Home: undefined;
  Ropa: undefined;
  Electrónica: undefined;
  Hogar: undefined;
};

type ProductCategory = keyof Omit<RootStackParamList, "Home">;

interface Product {
  id: string;
  title: string;
  image: string;
  oldPrice: number;
  price: number;
  discount: number;
  category: ProductCategory;
}

// backend simulado
const BACKEND_URL = "http://192.168.56.1:3000";

// Función para capitalizar y normalizar las categorías
const capitalizarCategoria = (cat: string): ProductCategory => {
  if (!cat) return "Ropa";
  const normalizado = cat.trim().toLowerCase();
  if (normalizado === "ropa") return "Ropa";
  if (normalizado === "electrónica" || normalizado === "electronica") return "Electrónica";
  if (normalizado === "hogar") return "Hogar";
  return "Ropa"; // fallback
};

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

  const convertirProducto = (p: any): Product => ({
    id: p._id?.toString() || Math.random().toString(),
    title: p.nombre || "Sin título",
    image: p.imagen || "https://via.placeholder.com/150",
    oldPrice: p.precioOriginal || p.precio || 0,
    price: p.precio || 0,
    discount: p.porcentajeDescuento || 0,
    category: capitalizarCategoria(p.categoria),
  });

  const buscarProductosInicial = async () => {
    setCargando(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/mercado-libre/destacados`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Datos inválidos");
      const productosConvertidos = data.map(convertirProducto);
      setProductos(productosConvertidos);
    } catch (err: any) {
      console.error("❌ Error cargando productos iniciales:", err.message);
      setError("No se pudieron cargar los productos iniciales.");
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
      const response = await fetch(
        `${BACKEND_URL}/mercado-libre/buscar?q=${encodeURIComponent(termino)}&max=10`
      );
      const data = await response.json();

      console.log("Respuesta del backend:", data);

      if (!Array.isArray(data)) throw new Error("Respuesta inválida");

      const productosConvertidos = data.map(convertirProducto);
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

  const añadirAlCarrito = (producto: Product) => {
    console.log("🛒 Añadido al carrito:", producto.title);
    // Aquí puedes agregar lógica para almacenar en un estado global o local
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
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAddToCart={añadirAlCarrito}
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
