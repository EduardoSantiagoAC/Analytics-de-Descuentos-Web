import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProductoItem({ producto }) {
  return (
    <View style={styles.item}>
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
    borderRadius: 8
  },
  nombre: {
    fontWeight: 'bold',
    marginBottom: 4
  }
});
