import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  nombre: string;
  email: string;
  foto: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = "http://localhost:3000"; // Ajusta si es necesario

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Cargar token al iniciar para autentificacion
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          setToken(storedToken);
          await fetchUser(storedToken);
        }
      } catch (error) {
        console.error("❌ Error cargando datos de autenticación:", error);
      }
    };
    loadAuthData();
  }, []);

  const fetchUser = async (authToken?: string) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    try {
      const response = await fetch(`${BACKEND_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener datos del usuario");
      const userData = await response.json();
      setUser(userData);
      console.log("✅ Usuario cargado:", userData);
    } catch (error) {
      console.error("❌ Error obteniendo datos del usuario:", error);
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem("authToken");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar sesión");
      }
      const data = await response.json();
      setToken(data.token);
      setUser(data.usuario);
      await AsyncStorage.setItem("authToken", data.token);
      console.log("✅ Inicio de sesión exitoso:", data.usuario);
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  };

  const register = async (nombre: string, email: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar");
      }
      const data = await response.json();
      setToken(data.token);
      setUser(data.usuario);
      await AsyncStorage.setItem("authToken", data.token);
      console.log("✅ Registro exitoso:", data.usuario);
    } catch (error) {
      console.error("❌ Error en registro:", error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("authToken");
    console.log("✅ Sesión cerrada");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};