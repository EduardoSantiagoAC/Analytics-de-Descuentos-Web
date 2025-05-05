import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen  from '../Screens/home';
import RopaScreen from '../Screens/Ropa';
import ElectronicaScreen from '../Screens/Electronica';
import HogarScreen from '../Screens/Articuloshogar';
//import Detalles from '../Screens/detalles';
const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Inicio" component={HomeScreen} />
      <Stack.Screen name="Ropa" component={RopaScreen} />
      <Stack.Screen name="Electrónica" component={ElectronicaScreen} />
      <Stack.Screen name="Hogar" component={HogarScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;