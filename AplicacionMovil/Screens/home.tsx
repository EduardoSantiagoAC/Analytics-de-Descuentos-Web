// screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList, Image, TouchableOpacity } from 'react-native';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="Buscar productos"
        style={styles.searchBar}
      />

      <Text style={styles.sectionTitle}>Productos destacados</Text>
      <FlatList
        data={[]} // productos vacíos por ahora
        horizontal
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard}>
            <Image source={{ uri: '' }} style={styles.productImage} />
            <Text style={styles.productName}>Nombre</Text>
            <Text style={styles.productPrice}>$0.00</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productCard: {
    width: 140,
    marginRight: 10,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  productName: {
    fontSize: 14,
    marginTop: 5,
  },
  productPrice: {
    fontWeight: 'bold',
    color: '#d0021b',
  },
});
