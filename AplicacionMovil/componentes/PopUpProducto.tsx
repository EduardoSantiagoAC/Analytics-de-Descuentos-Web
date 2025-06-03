import React, { useRef, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking, Animated } from "react-native";
import Modal from "react-native-modal";
import { theme } from "../theme/theme";

export interface Producto {
  id: any;
  imageUrl: string;
  title: string;
  description: string;
  price?: any;
  link: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  producto: Producto;
}

const ProductoPopup: React.FC<Props> = ({ isVisible, onClose, producto }) => {
  const { imageUrl, title, description, price, link } = producto;

  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <Animated.View
        style={[
          styles.container,
          theme.shadows.medium,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <Text style={styles.title}>{title}</Text>
        {price && <Text style={styles.price}>{price}</Text>}
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL(link)}
        >
          <Text style={styles.buttonText}>Ver más</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  price: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
  },
  buttonText: {
    color: theme.colors.cardBackground,
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.medium,
  },
});

export default ProductoPopup;