import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";

const Header = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>
          <Text style={styles.brand}>ECONO</Text>
          <Text style={styles.brandAccent}>FY</Text>
        </Text>
        <Text style={styles.subtitle}>Ahorra inteligentemente</Text>
      </View>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons
          name="search"
          size={24}
          color={theme.colors.textPrimary}
          style={{ opacity: 0.7 }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 0.3,
    borderBottomColor: "#ccc",
    ...theme.shadows.small,
  },
  title: {
    fontSize: theme.fontSizes.title,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
  },
  brand: {
    color: theme.colors.textPrimary,
  },
  brandAccent: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  iconButton: {
    padding: theme.spacing.sm,
    borderRadius: 100,
  },
});

export default Header;
