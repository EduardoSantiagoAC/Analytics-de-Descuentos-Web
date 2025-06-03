import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useCarrito } from "../componentes/CarritoContext";
import { theme } from "../theme/theme";

const CarritoScreen = () => {
  const { carrito, removeFromCarrito, clearCarrito } = useCarrito();

  const renderItem = ({ item }: { item: { id: string; title: string; image: string; price: number; quantity: number } }) => (
    <View style={[styles.item, theme.shadows.small]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)} x {item.quantity}</Text>
        <Text style={styles.total}>Total: ${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCarrito(item.id)}
      >
        <Text style={styles.removeButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  const total = carrito.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      {carrito.length === 0 ? (
        <Text style={styles.emptyText}>El carrito está vacío</Text>
      ) : (
        <>
          <FlatList
            data={carrito}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearCarrito}
            >
              <Text style={styles.clearButtonText}>Vaciar Carrito</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  item: {
    flexDirection: "row",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.sm,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
  },
  price: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  total: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  removeButton: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
  },
  removeButtonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.medium,
  },
  emptyText: {
    textAlign: "center",
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.textSecondary + "33",
  },
  totalText: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
  },
  clearButton: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
  },
  clearButtonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.medium,
  },
});

export default CarritoScreen;