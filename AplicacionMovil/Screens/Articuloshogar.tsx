import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ProductCard from "../componentes/TarjetaProducto";
import { Product } from "../componentes/TarjetaProducto";

const hogarProductos: Product[] = [
  {
    id: 5,
    title: "Juego de sábanas",
    image: "https://via.placeholder.com/100x100.png?text=Sábanas",
    oldPrice: 59.99,
    price: 44.99,
    discount: 25,
  },
  {
    id: 6,
    title: "Set de utensilios",
    image: "https://via.placeholder.com/100x100.png?text=Utensilios",
    oldPrice: 29.99,
    price: 19.99,
    discount: 33,
  },
];

const HogarScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.grid}>
      {hogarProductos.map((p) => (
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

export default HogarScreen;
