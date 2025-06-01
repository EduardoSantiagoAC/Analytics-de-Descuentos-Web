
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ProductCard from "../componentes/TarjetaProducto";
import { Producto } from "../componentes/PopUpProducto";

const electronicaProductos: Producto[] = [
  {
    id: 3,
    title: "Auriculares Bluetooth",
    image: "https://via.placeholder.com/100x100.png?text=Auriculares",
    oldPrice: 49.99,
    price: 29.99,
    discount: 40,
  },
  {
    id: 4,
    title: "Power Bank",
    image: "https://via.placeholder.com/100x100.png?text=PowerBank",
    oldPrice: 24.99,
    price: 17.49,
    discount: 30,
  },
];

const ElectronicaScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.grid}>
      {electronicaProductos.map((p) => (
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

export default ElectronicaScreen;
