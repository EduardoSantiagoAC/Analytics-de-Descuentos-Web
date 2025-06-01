import React from 'react';
import { createBottomTabsNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screens/home';
import BusquedaScreen from '../Screens/Busqueda';
import RopaScreen from '../Screens/Ropa';
import ElectronicaScreen from '../Screens/Electronica';
import HogarScreen from '../Screens/Articuloshogar';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabsNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Buscar') iconName = 'search';
          else if (route.name === 'Ropa') iconName = 'checkroom';
          else if (route.name === 'Electrónica') iconName = 'devices';
          else if (route.name === 'Hogar') iconName = 'chair';
          else iconName = 'help';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Buscar" component={BusquedaScreen} />
      <Tab.Screen name="Ropa" component={RopaScreen} />
      <Tab.Screen name="Electrónica" component={ElectronicaScreen} />
      <Tab.Screen name="Hogar" component={HogarScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;