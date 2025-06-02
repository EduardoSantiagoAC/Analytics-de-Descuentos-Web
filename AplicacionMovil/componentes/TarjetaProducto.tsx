import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme/theme";

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
    <TouchableOpacity style={[styles.card, theme.shadows.medium]} onPress={onPress}>
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
    margin: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: theme.spacing.sm,
  },
  info: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSizes.medium,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
  },
  price: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  oldPrice: {
    fontSize: theme.fontSizes.small,
    textDecorationLine: "line-through",
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  discount: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.discount,
    fontFamily: theme.fonts.medium,
  },
  addButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.small,
  },
  addButtonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.medium,
  },
});

export default ProductCard;