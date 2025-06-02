import React from "react";
import { CarritoProvider } from "./componentes/CarritoContext";
import BottomNav from "./AppNavigator";

export default function App() {
  return (
    <CarritoProvider>
      <BottomNav />
    </CarritoProvider>
  );
}