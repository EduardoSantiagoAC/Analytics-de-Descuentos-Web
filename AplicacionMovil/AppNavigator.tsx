import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./Screens/home";
import BusquedaScreen from "./Screens/Busqueda";
import CarritoScreen from "./Screens/CarritoScreen";
import PerfilScreen from "./Screens/PerfilScreen";
import { theme } from "./theme/theme";
import { useCarrito } from "./componentes/CarritoContext";
import { Text, View } from "react-native";

const Tab = createBottomTabNavigator();

const BottomNav = () => {
  const { carrito } = useCarrito();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";
            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Búsqueda") {
              iconName = focused ? "search" : "search-outline";
            } else if (route.name === "Carrito") {
              iconName = focused ? "cart" : "cart-outline";
            } else if (route.name === "Perfil") {
              iconName = focused ? "person" : "person-outline";
            }
            return (
              <View style={{ position: "relative" }}>
                <Ionicons name={iconName} size={size} color={color} />
                {route.name === "Carrito" && carrito.length > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -10,
                      backgroundColor: theme.colors.discount,
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.cardBackground,
                        fontSize: 12,
                        fontFamily: theme.fonts.bold,
                      }}
                    >
                      {carrito.reduce((sum, item) => sum + item.quantity, 0)}
                    </Text>
                  </View>
                )}
              </View>
            );
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.cardBackground,
            borderTopColor: theme.colors.textSecondary + "33",
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: theme.fontSizes.small,
            fontFamily: theme.fonts.regular,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Búsqueda" component={BusquedaScreen} />
        <Tab.Screen name="Carrito" component={CarritoScreen} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default BottomNav;