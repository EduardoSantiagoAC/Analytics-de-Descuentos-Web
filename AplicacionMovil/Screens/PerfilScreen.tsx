import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../componentes/AuthContext";
import { theme } from "../theme/theme";
import { useNavigation } from "@react-navigation/native";

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
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Image
        source={{ uri: usuario.foto || "https://via.placeholder.com/120x120.png?text=Sin+Foto" }}
        style={styles.image}
      />
      <Text style={styles.label}>Nombre: {usuario.nombre}</Text>
      <Text style={styles.label}>Email: {usuario.email}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSizes.title,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.sm,
  },
  button: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.small,
  },
  buttonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.bold,
  },
});

export default PerfilScreen;