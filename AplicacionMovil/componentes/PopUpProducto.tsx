import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from "react-native";
import Modal from "react-native-modal";

// Definimos la interfaz de cosas que tendra el producto
interface Producto {
  imageUrl: string;
  title: string;
  description: string;
  price?: string;
  link: string;
}
// 2 modos se ve o no se ve 
interface Props {
  isVisible: boolean;
  onClose: () => void;
  producto: Producto;
}

// Componente que muestra un popup con la información del producto
const ProductoPopup: React.FC<Props> = ({ isVisible, onClose, producto }) => {
  const { imageUrl, title, description, price, link } = producto;

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} animationIn="zoomIn" animationOut="zoomOut">
      <View style={styles.container}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        <Text style={styles.title}>{title}</Text>
        {price && <Text style={styles.price}>{price}</Text>}
        <Text style={styles.description}>{description}</Text>

        <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(link)}>
          <Text style={styles.buttonText}>Ver más</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
// estilos
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  price: {
    fontSize: 16,
    color: "#e53935",
    fontWeight: "600",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff6f00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ProductoPopup;
