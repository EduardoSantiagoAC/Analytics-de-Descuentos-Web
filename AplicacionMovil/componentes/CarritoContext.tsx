import React, { createContext, useContext, useState } from "react";

interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

interface CarritoContextType {
  carrito: Product[];
  addToCarrito: (product: Omit<Product, "quantity">) => void;
  removeFromCarrito: (id: string) => void;
  clearCarrito: () => void;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carrito, setCarrito] = useState<Product[]>([]);

  const addToCarrito = (product: Omit<Product, "quantity">) => {
    setCarrito((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    console.log("🛒 Añadido al carrito:", product.title);
  };

  const removeFromCarrito = (id: string) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
    console.log("🛒 Eliminado del carrito, ID:", id);
  };

  const clearCarrito = () => {
    setCarrito([]);
    console.log("🛒 Carrito vaciado");
  };

  return (
    <CarritoContext.Provider value={{ carrito, addToCarrito, removeFromCarrito, clearCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error("useCarrito debe usarse dentro de un CarritoProvider");
  }
  return context;
};