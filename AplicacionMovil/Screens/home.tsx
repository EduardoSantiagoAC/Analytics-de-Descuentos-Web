import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Header from "../componentes/Cabezal";
import CategoryTabs from "../componentes/Categorias";
import PromoBanner from "../componentes/promo";
import AlertCard from "../componentes/Alertas";
import ProductCard from "../componentes/TarjetaProducto";

// Tipos para navegación
type RootStackParamList = {
  Home: undefined;
  Ropa: undefined;
  Electrónica: undefined;
  Hogar: undefined;
};

type ProductCategory = keyof Omit<RootStackParamList, 'Home'>;

interface Product {
  id: number;
  title: string;
  image: string;
  oldPrice: number;
  price: number;
  discount: number;
  category: ProductCategory;
}

// Productos de prueba (podés reemplazarlos por productos reales más adelante)
const dummyProducts: Product[] = [
  {
    id: 1,
    title: "Remera deportiva",
    image: "https://via.placeholder.com/150",
    oldPrice: 400,
    price: 300,
    discount: 25,
    category: "Ropa"
  },
  {
    id: 2,
    title: "Batidora eléctrica",
    image: "https://via.placeholder.com/150",
    oldPrice: 800,
    price: 600,
    discount: 25,
    category: "Hogar"
  },
];

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeCategory, setActiveCategory] = useState<string>("Home");

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category !== "Home") {
      navigation.navigate(category as keyof RootStackParamList);
    }
  };

  const filteredProducts = activeCategory === "Home"
    ? dummyProducts
    : dummyProducts.filter(product => product.category === activeCategory);

  return (
    <ScrollView style={styles.container}>
      <Header />
      <CategoryTabs
        onCategoryChange={handleCategoryChange}
        activeCategory={activeCategory}
      />
      <PromoBanner />
      <AlertCard />
      <View style={styles.productsWrapper}>
        {filteredProducts.length === 0 ? (
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
});

export default HomeScreen;
