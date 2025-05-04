import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
// interface de tarjeta de producto que muestra la imagen, título, precio y descuento
export interface Product {
  id: number;
  title: string;
  image: string;
  oldPrice: number;
  price: number;
  discount: number;
}
//rops de producto
interface ProductCardProps {
  product: Product;
}
//componente de tarjeta de producto
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.discount}>{product.discount}%</Text>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.oldPrice}>${product.oldPrice.toFixed(2)}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
    </View>
  );
};
//estilos de la tarjeta de producto
const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  discount: {
    backgroundColor: "#f46c1f",
    color: "white",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 5,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    marginBottom: 8,
  },
  title: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  oldPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ProductCard;
