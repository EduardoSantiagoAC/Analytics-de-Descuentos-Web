import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Pantallas principales
import HomeScreen from '../Screens/home';
import RopaScreen from '../Screens/Ropa';
import ElectronicaScreen from '../Screens/Electronica';
import HogarScreen from '../Screens/Articuloshogar';
import BusquedaScreen from '../Screens/Busqueda';

// Creamos el stack
const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Inicio">
      <Stack.Screen name="Inicio" component={HomeScreen} />
      
      {/* Se espera que RopaScreen reciba un parámetro producto */}
      <Stack.Screen name="Ropa" component={RopaScreen} />

      <Stack.Screen name="Electrónica" component={ElectronicaScreen} />
      <Stack.Screen name="Hogar" component={HogarScreen} />
      <Stack.Screen name="Buscar" component={BusquedaScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
