import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
//banner de promociones

const PromoBanner = () => {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>DESCUENTOS</Text>
      <Text style={styles.subtitle}>HASTA 50% DCTO.</Text>
      <FontAwesome name="tag" size={30} color="white" style={styles.icon} />
    </View>
  );
};
//estilos
const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#f57c00",
    borderRadius: 12,
    padding: 16,
    margin: 10,
    position: "relative",
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  subtitle: {
    color: "white",
    fontSize: 14,
  },
  icon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
});

export default PromoBanner;
