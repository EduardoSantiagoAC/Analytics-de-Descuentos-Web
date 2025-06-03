import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useAuth } from "../componentes/AuthContext";
import { theme } from "../theme/theme";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const PerfilScreen = () => {
  const { usuario, logout } = useAuth();
  const navigation = useNavigation();

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No has iniciado sesión</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.primary + "33"]}
      style={styles.container}
    >
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: usuario.foto || "https://via.placeholder.com/150x150.png?text=Sin+Foto" }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nombre: <Text style={styles.value}>{usuario.nombre}</Text></Text>
          <Text style={styles.label}>Email: <Text style={styles.value}>{usuario.email}</Text></Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }}
      >
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSizes.title,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: theme.spacing.md,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  infoContainer: {
    backgroundColor: theme.colors.cardBackground + "CC",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    width: "80%",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.15)",
        }
      : theme.shadows.medium),
  },
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.sm,
  },
  value: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
  },
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.medium,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.15)",
        }
      : theme.shadows.medium),
  },
  buttonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
  },
});

export default PerfilScreen;