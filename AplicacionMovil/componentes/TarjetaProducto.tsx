import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

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
  onAddToCart: (product: Product) => void;
  onPress: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart, onPress }) => {
  console.log("📋 Props de ProductCard:", JSON.stringify(product, null, 2));

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        onError={(e) => console.error("❌ Error cargando imagen:", e.nativeEvent.error)}
        defaultSource={{ uri: "https://dummyimage.com/150x150/ccc/000.png&text=Producto" }}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title || "Sin título"}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {product.discount > 0 && (
          <>
            <Text style={styles.oldPrice}>${product.oldPrice.toFixed(2)}</Text>
            <Text style={styles.discount}>{product.discount}% OFF</Text>
          </>
        )}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onAddToCart(product)}
      >
        <Text style={styles.addButtonText}>Añadir al carrito</Text>
      </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 8,
  },
  info: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
    color: "#333",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200ee",
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#888",
  },
  discount: {
    fontSize: 12,
    color: "#e91e63",
  },
  addButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#6200ee",
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default ProductCard;