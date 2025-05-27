import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../Screens/HomeScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => (
  <Stack.Navigator>
    <Stack.Screen name="Inicio" component={HomeScreen} />
  </Stack.Navigator>
);

export default Navigation;
