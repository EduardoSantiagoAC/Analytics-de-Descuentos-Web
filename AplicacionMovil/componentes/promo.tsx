import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "../theme/theme";

const PromoBanner = () => {
  return (
    <View style={[styles.banner, theme.shadows.medium]}>
      <Text style={styles.title}>DESCUENTOS</Text>
      <Text style={styles.subtitle}>HASTA 50% DCTO.</Text>
      <FontAwesome name="tag" size={30} color={theme.colors.cardBackground} style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    position: "relative",
  },
  title: {
    color: theme.colors.cardBackground,
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.large,
  },
  subtitle: {
    color: theme.colors.cardBackground,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.regular,
  },
  icon: {
    position: "absolute",
    right: theme.spacing.md,
    top: theme.spacing.md,
  },
});

export default PromoBanner;