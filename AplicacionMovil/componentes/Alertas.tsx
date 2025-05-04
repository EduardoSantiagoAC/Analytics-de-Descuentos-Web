import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
//componente para mostrar alertas de productos con bajo inventario

const AlertCard = () => {
  return (
    <View style={styles.card}>
      <Feather name="bell" size={24} color="black" style={styles.icon} />
      <View>
        <Text style={styles.title}>Prevención de escasez</Text>
        <Text style={styles.subtitle}>Recibe alertas sobre productos con bajo inventario</Text>
      </View>
    </View>
  );
};
//estilos
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f0e1",
    borderRadius: 10,
    padding: 12,
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
  },
  subtitle: {
    fontSize: 13,
    color: "gray",
  },
});

export default AlertCard;

