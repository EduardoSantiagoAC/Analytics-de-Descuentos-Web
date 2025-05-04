import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

const categories = ["Destacados", "Ropa", "Electrónica", "Hogar"];

const CategoryTabs = () => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {categories.map((cat, idx) => (
        <TouchableOpacity key={idx} style={styles.tab}>
          <Text style={[styles.text, idx === 0 && styles.active]}>{cat}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
//estilos
const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  tab: {
    marginRight: 20,
  },
  text: {
    fontSize: 16,
    color: "gray",
  },
  active: {
    color: "black",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "black",
  },
});

export default CategoryTabs;

