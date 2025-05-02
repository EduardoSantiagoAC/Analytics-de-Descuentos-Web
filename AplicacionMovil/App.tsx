import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navegacion/BarraDeNaveGacion';

export default function App() {
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}
