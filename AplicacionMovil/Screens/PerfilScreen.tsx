import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Button, Alert, TouchableOpacity } from "react-native";
import { theme } from "../theme/theme";
import { useAuth } from "../componentes/AuthContext";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const PerfilScreen = () => {
  const { user, logout, fetchUser } = useAuth();
  const navigation = useNavigation();
  const [foto, setFoto] = useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso requerido", "Se necesita acceso a la galería para seleccionar una foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append("foto", {
        uri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);

      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch("http://localhost:3000/auth/update-photo", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar foto");
      }

      const data = await response.json();
      Alert.alert("Éxito", "Foto de perfil actualizada");
      await fetchUser(); // Actualizar datos del usuario
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

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
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: foto || user.foto }} style={styles.foto} />
        <Text style={styles.changePhotoText}>Cambiar Foto</Text>
      </TouchableOpacity>
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
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  changePhotoText: {
    textAlign: "center",
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.medium,
    marginBottom: theme.spacing.md,
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