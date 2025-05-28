import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function RopaScreen() {
  const route = useRoute();
  const { producto } = route.params;
  const [expandido, setExpandido] = useState(true); // Siempre expandido aquí

  if (!producto) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>❌ Producto no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: producto.imagen }} style={styles.image} />
      <Text style={styles.nombre}>{producto.nombre}</Text>
      <Text style={styles.precio}>Precio: ${producto.precio}</Text>
      <Text style={styles.estado}>Estado: {producto.estadoDescuento}</Text>

      {expandido && (
        <View style={styles.extra}>
          <Text>URL: {producto.urlProducto}</Text>
          <Text>Tienda: {producto.tienda}</Text>
          <Text>Fecha: {new Date(producto.fechaScraping).toLocaleString()}</Text>
          <View style={styles.boton}>
            <Button title="Añadir al carrito" onPress={() => console.log('Añadido al carrito')} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 16,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  precio: {
    fontSize: 16,
    marginBottom: 4,
  },
  estado: {
    fontSize: 14,
    marginBottom: 12,
  },
  extra: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 12,
  },
  boton: {
    marginTop: 16,
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
});
