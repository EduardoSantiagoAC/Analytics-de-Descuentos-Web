import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function ProductoItem({ producto }) {
  return (
    <View style={styles.item}>
      <Image source={{ uri: producto.imagen }} style={styles.image} />
      <Text style={styles.nombre}>{producto.nombre}</Text>
      <Text>Precio: ${producto.precio}</Text>
      <Text>Estado: {producto.estadoDescuento}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  nombre: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    marginBottom: 8,
    borderRadius: 8,
  },
});
