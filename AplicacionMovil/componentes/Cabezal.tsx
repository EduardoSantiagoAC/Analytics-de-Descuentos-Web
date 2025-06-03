import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>ECONOFY</Text>
        <Text style={styles.subtitle}>Ahorra inteligentemente</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="search" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.small,
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.large, // Bordes redondeados
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.title,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
});

export default Header;