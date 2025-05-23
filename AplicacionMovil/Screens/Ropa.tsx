import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ProductCard from "../componentes/TarjetaProducto";
import { Product } from "../componentes/TarjetaProducto";

const ropaProductos: Product[] = [
  {
    id: 1,
    title: "Camiseta básica",
    image: "https://via.placeholder.com/100x100.png?text=Camiseta",
    oldPrice: 19.99,
    price: 9.99,
    discount: 50,
  },
  {
    id: 2,
    title: "Pantalones jeans",
    image: "https://via.placeholder.com/100x100.png?text=Jeans",
    oldPrice: 39.99,
    price: 27.99,
    discount: 30,
  },
];

const RopaScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.grid}>
      {ropaProductos.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { padding: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default RopaScreen;