import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../Screens/home';
import BusquedaScreen from '../Screens/Busqueda';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Buscar" component={BusquedaScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;