import React from "react";
import { CarritoProvider } from "./componentes/CarritoContext";
import { AuthProvider } from "./componentes/AuthContext";
import AppNavigator from "./AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <AppNavigator />
      </CarritoProvider>
    </AuthProvider>
  );
}