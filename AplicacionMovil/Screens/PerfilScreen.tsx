import React from "react";
import { View, Text, Image, StyleSheet, Button } from "react-native";
import { theme } from "../theme/theme";
import { useAuth } from "../componentes/AuthContext";
import { useNavigation } from "@react-navigation/native";

const PerfilScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Por favor, inicia sesión para ver tu perfil.</Text>
        <Button
          title="Iniciar Sesión"
          onPress={() => navigation.navigate("Login")}
          color={theme.colors.primary}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.foto }} style={styles.foto} />
      <Text style={styles.nombre}>{user.nombre}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Información del Perfil</Text>
        <Text style={styles.infoText}>Miembro desde: Enero 2025</Text>
        <Text style={styles.infoText}>Pedidos realizados: 5</Text>
      </View>
      <Button title="Cerrar Sesión" onPress={handleLogout} color={theme.colors.error} />
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
    marginBottom: theme.spacing.lg,
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
  error: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
});

export default PerfilScreen;