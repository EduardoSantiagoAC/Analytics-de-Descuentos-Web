import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Button } from 'react-native';

export default function ProductoItem({ producto }) {
  const [expandido, setExpandido] = useState(false);

  const toggleExpandir = () => {
    setExpandido(!expandido);
  };

  return (
    <TouchableOpacity onPress={toggleExpandir} style={styles.item}>
      <Image source={{ uri: producto.imagen }} style={styles.image} />
      <Text style={styles.nombre}>{producto.nombre}</Text>
      <Text>Precio: ${producto.precio}</Text>
      <Text>Estado: {producto.estadoDescuento}</Text>

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
    </TouchableOpacity>
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
  extra: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
  },
  boton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
});
