import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Header from "../componentes/Cabezal";
import CategoryTabs from "../componentes/Categorias";
import PromoBanner from "../componentes/promo";
import AlertCard from "../componentes/Alertas";
import ProductCard from "../componentes/TarjetaProducto";

const dummyProducts = [
  {
    id: 1,
    title: "Camiseta",
    image: "https://via.placeholder.com/100x100.png?text=Camiseta",
    oldPrice: 9.99,
    price: 6.99,
    discount: 30,
  },
  {
    id: 2,
    title: "Auriculares",
    image: "https://via.placeholder.com/100x100.png?text=Auriculares",
    oldPrice: 59.99,
    price: 44.99,
    discount: 25,
  },
  {
    id: 3,
    title: "Canasta",
    image: "https://via.placeholder.com/100x100.png?text=Canasta",
    oldPrice: 24.99,
    price: 22.49,
    discount: 10,
  },
  {
    id: 4,
    title: "Portátil",
    image: "https://via.placeholder.com/100x100.png?text=Portátil",
    oldPrice: 799.99,
    price: 679.99,
    discount: 15,
  },
];

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Header />
      <CategoryTabs />
      <PromoBanner />
      <AlertCard />
      <View style={styles.productsWrapper}>
        {dummyProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
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
