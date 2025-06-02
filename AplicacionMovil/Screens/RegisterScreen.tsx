import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../componentes/AuthContext";
import { theme } from "../theme/theme";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const RegisterScreen = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const { register } = useAuth();
  const navigation = useNavigation();

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
    }
  };

  const handleRegister = async () => {
    try {
      // Crear FormData para enviar los datos
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("email", email);
      formData.append("password", password);

      if (foto) {
        formData.append("foto", {
          uri: foto,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar");
      }

      const data = await response.json();
      await register(nombre, email, password); // Sincronizar con AuthContext
      Alert.alert("Éxito", "Registro exitoso", [
        { text: "OK", onPress: () => navigation.navigate("Perfil") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Seleccionar Foto de Perfil</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Registrarse" onPress={handleRegister} color={theme.colors.primary} />
      <Button
        title="¿Ya tienes cuenta? Inicia sesión"
        onPress={() => navigation.navigate("Login")}
        color={theme.colors.secondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
  },
  title: {
    fontSize: theme.fontSizes.title,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  imageContainer: {
    alignSelf: "center",
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageText: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.regular,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.regular,
    backgroundColor: theme.colors.cardBackground,
  },
});

export default RegisterScreen;