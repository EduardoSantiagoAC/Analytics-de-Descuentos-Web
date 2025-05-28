import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Button } from "react-native";

interface Product {
  id: string;
  title: string;
  image: string;
  oldPrice: number;
  price: number;
  discount: number;
  category: string;
}

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  const [expandido, setExpandido] = useState(false);

  // Calculamos el precio final con descuento si aplica
  const precioFinal =
    product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

  return (
    <TouchableOpacity onPress={() => setExpandido(!expandido)} style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.title}</Text>

      <View style={styles.priceContainer}>
        {product.discount > 0 && (
          <Text style={styles.oldPrice}>${product.price.toFixed(2)}</Text>
        )}
        <Text style={styles.price}>${precioFinal.toFixed(2)}</Text>
      </View>

      {product.discount > 0 && (
        <Text style={styles.discount}>-{product.discount}%</Text>
      )}

      {expandido && (
        <View style={styles.extra}>
          <Text style={styles.category}>Categoría: {product.category}</Text>
          <Button title="Añadir al carrito" onPress={() => onAddToCart?.(product)} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  price: {
    fontSize: 14,
    color: "#4caf50",
    fontWeight: "bold",
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#888",
  },
  discount: {
    fontSize: 12,
    color: "#f44336",
    fontWeight: "bold",
    marginTop: 2,
  },
  extra: {
    marginTop: 10,
  },
  category: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },
});

export default ProductCard;
