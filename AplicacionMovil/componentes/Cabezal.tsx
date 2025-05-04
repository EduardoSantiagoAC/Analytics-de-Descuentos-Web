import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Componente de encabezado que muestra el título y un icono de búsqueda
const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ECONOFY</Text>
      <Text style={styles.subtitle}>Ahorra inteligentemente</Text>
      <TouchableOpacity>
        <Ionicons name="search" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};
//estilos
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "gray",
  },
});

export default Header;


