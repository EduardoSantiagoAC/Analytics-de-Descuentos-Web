import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

type CategoryTabsProps = {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
};

const categories = [
  { id: "1", name: "Todos", key: "Home" },
  { id: "2", name: "Ropa", key: "Ropa" },
  { id: "3", name: "Electrónica", key: "Electrónica" },
  { id: "4", name: "Hogar", key: "Hogar" },
];

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  onCategoryChange,
  activeCategory,
}) => {
  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.tab,
            activeCategory === category.key && styles.activeTab,
          ]}
          onPress={() => {
            onCategoryChange(category.key);
            console.log(`📋 Seleccionada categoría: ${category.key}`);
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeCategory === category.key && styles.activeText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  tab: {
    padding: 10,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#6200ee",
  },
  tabText: {
    color: "#000",
    fontSize: 16,
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CategoryTabs;