import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import ProductoItem from '../componentes/ProductoItem';
import { buscarProductos } from '../utils/api';

export default function HomeScreen() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);

  const handleBuscar = async () => {
    try {
      const data = await buscarProductos(termino);
      setResultados(data);
    } catch (error) {
      console.error('Error al buscar:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar producto..."
        value={termino}
        onChangeText={setTermino}
        style={styles.input}
      />
      <Button title="Buscar" onPress={handleBuscar} />
      <FlatList
        data={resultados}
        keyExtractor={(item) => item.urlProducto}
        renderItem={({ item }) => <ProductoItem producto={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10
  }
});
