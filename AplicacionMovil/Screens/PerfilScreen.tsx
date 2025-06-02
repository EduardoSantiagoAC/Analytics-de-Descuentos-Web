import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { theme } from "../theme/theme";

const PerfilScreen = () => {
  const usuario = {
    nombre: "Juan Pérez",
    email: "juan.perez@example.com",
    foto: "https://randomuser.me/api/portraits/men/1.jpg",
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: usuario.foto }} style={styles.foto} />
      <Text style={styles.nombre}>{usuario.nombre}</Text>
      <Text style={styles.email}>{usuario.email}</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Información del Perfil</Text>
        <Text style={styles.infoText}>Miembro desde: Enero 2025</Text>
        <Text style={styles.infoText}>Pedidos realizados: 5</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  nombre: {
    fontSize: theme.fontSizes.title,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  email: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.lg,
  },
  infoCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    width: "100%",
    ...theme.shadows.medium,
  },
  infoTitle: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.xs,
  },
});

export default PerfilScreen;