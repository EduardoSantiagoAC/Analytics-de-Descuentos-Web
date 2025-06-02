import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "../theme/theme";

const AlertCard = () => {
  return (
    <View style={[styles.card, theme.shadows.small]}>
      <Feather name="bell" size={24} color={theme.colors.textPrimary} style={styles.icon} />
      <View>
        <Text style={styles.title}>Prevención de escasez</Text>
        <Text style={styles.subtitle}>Recibe alertas sobre productos con bajo inventario</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.textSecondary + '33', // Opacidad 20%
  },
  icon: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
});

export default AlertCard;