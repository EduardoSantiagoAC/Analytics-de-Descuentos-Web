import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen  from '../Screens/home';
const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Inicio" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
