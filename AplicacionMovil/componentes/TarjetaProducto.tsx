import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export interface Product {
  id: string;
  title: string;
  image: string;
  oldPrice: number;
  price: number;
  discount: number;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.discount}>{product.discount}%</Text>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.oldPrice}>${product.oldPrice.toFixed(2)}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );
};

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
