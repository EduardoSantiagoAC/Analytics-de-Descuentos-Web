import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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


const dummyProducts: Product[] = [
  {
    id: 1,
    title: "Camiseta",
    image: "https://via.placeholder.com/100x100.png?text=Camiseta",
    oldPrice: 9.99,
    price: 6.99,
    discount: 30,
    category: "Ropa",
  },
  {
    id: 2,
    title: "Auriculares",
    image: "https://via.placeholder.com/100x100.png?text=Auriculares",
    oldPrice: 59.99,
    price: 44.99,
    discount: 25,
    category: "Electrónica",
  },
  {
    id: 3,
    title: "Canasta",
    image: "https://via.placeholder.com/100x100.png?text=Canasta",
    oldPrice: 24.99,
    price: 22.49,
    discount: 10,
    category: "Hogar",
  },
  {
    id: 4,
    title: "Portátil",
    image: "https://via.placeholder.com/100x100.png?text=Portátil",
    oldPrice: 799.99,
    price: 679.99,
    discount: 15,
    category: "Electrónica",
  },
];
const HomeScreen = () => {
  const navigation = useNavigation<any>(); // Temporalmente any para pruebas

  return (
    <ScrollView style={styles.container}>
      <Header />
      <CategoryTabs />
      <PromoBanner />
      <AlertCard />
      <View style={styles.productsWrapper}>
        {dummyProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => navigation.navigate(product.category)}
          />
        ))}
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
});

export default HomeScreen;