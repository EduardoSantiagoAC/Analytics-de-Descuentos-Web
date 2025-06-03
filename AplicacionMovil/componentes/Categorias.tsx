import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, Animated } from "react-native";
import { theme } from "../theme/theme";

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
  const scaleAnims = categories.reduce((acc, category) => {
    acc[category.key] = new Animated.Value(activeCategory === category.key ? 1.1 : 1);
    return acc;
  }, {} as { [key: string]: Animated.Value });

  const handlePress = (categoryKey: string) => {
    onCategoryChange(categoryKey);
    console.log(`📋 Seleccionada categoría: ${categoryKey}`);
    Object.keys(scaleAnims).forEach((key) => {
      Animated.timing(scaleAnims[key], {
        toValue: key === categoryKey ? 1.1 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <Animated.View
          key={category.id}
          style={{
            transform: [{ scale: scaleAnims[category.key] }],
          }}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeCategory === category.key && styles.activeTab,
              theme.shadows.small,
            ]}
            onPress={() => handlePress(category.key)}
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
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.cardBackground,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  tab: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.background,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.medium,
  },
  activeText: {
    color: theme.colors.cardBackground,
    fontFamily: theme.fonts.bold,
  },
});

export default CategoryTabs;