import React, { useState } from "react";
import { View, TextInput, Button, ScrollView, StyleSheet, Text, ActivityIndicator } from "react-native";
import ProductCard from "../componentes/TarjetaProducto";

interface ProductoML {
  nombre: string;
  precio: number;
  urlProducto: string;
  imagen: string;
  tienda: string;
  fechaScraping: string;
}

const BusquedaScreen = () => {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ProductoML[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const buscarProductos = async () => {
    if (!busqueda.trim()) return;

    setCargando(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3000/mercado-libre/buscar?q=${encodeURIComponent(busqueda)}&max=10`);
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Respuesta no válida");
      }

      setResultados(data);
    } catch (err) {
      setError("Error al buscar productos");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder="Buscar producto..."
        style={styles.input}
      />
      <Button title="Buscar" onPress={buscarProductos} />

      {cargando && <ActivityIndicator size="large" color="#6200ee" style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView style={{ marginTop: 20 }}>
        {resultados.map((p, index) => (
          <ProductCard
            key={index}
            product={{
              id: index,
              title: p.nombre,
              image: p.imagen || "https://via.placeholder.com/100x100.png?text=Producto",
              oldPrice: p.precio, // opcional
              price: p.precio,
              discount: 0,
              category: "Ropa" // puedes ajustar esto dinámicamente si quieres
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});

export default BusquedaScreen;
