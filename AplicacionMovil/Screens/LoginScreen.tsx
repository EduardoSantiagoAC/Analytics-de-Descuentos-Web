import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useAuth } from "../componentes/AuthContext";
import { theme } from "../theme/theme";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await login(email, password);
      console.log("🔐 Inicio de sesión exitoso...");
      navigation.reset({
        index: 0,
        routes: [{ name: "Main", params: { screen: "Perfil" } }],
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
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
      <Button title="Iniciar Sesión" onPress={handleLogin} color={theme.colors.primary} />
      <Button
        title="¿No tienes cuenta? Regístrate"
        onPress={() => navigation.navigate("Register")}
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

export default LoginScreen;