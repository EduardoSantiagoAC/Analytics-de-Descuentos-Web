import React from "react";
import { CarritoProvider } from "./componentes/CarritoContext";
import { AuthProvider } from "./componentes/AuthContext";
import AppNavigator from "./AppNavigator";
import { ThemeProvider } from "./theme/themeprovider"; 

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CarritoProvider>
          <AppNavigator />
        </CarritoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
