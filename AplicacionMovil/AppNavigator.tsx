import React, { useEffect } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./Screens/home";
import BusquedaScreen from "./Screens/Busqueda";
import CarritoScreen from "./Screens/CarritoScreen";
import PerfilScreen from "./Screens/PerfilScreen";
import RegisterScreen from "./Screens/RegisterScreen";
import LoginScreen from "./Screens/LoginScreen";
import { theme } from "./theme/theme";
import { useCarrito } from "./componentes/CarritoContext";
import { useAuth } from "./componentes/AuthContext";
import { Text, View } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const { carrito } = useCarrito();

  return (
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
  );
};

const AppNavigator = () => {
  const { usuario, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading) {
      if (usuario) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Main", params: { screen: "Perfil" } }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    }
  }, [usuario, isLoading, navigation]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={usuario ? "Main" : "Login"}>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;