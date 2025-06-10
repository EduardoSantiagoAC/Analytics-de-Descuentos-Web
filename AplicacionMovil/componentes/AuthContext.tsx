import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  foto: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (token: string, usuario: Usuario) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUsuario = await AsyncStorage.getItem("usuario");
        if (storedToken && storedUsuario) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUsuario));
          console.log("🔍 Datos cargados desde AsyncStorage - usuario:", JSON.parse(storedUsuario));
        }
      } catch (error) {
        console.error("Error cargando datos de autenticación:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("https://analytics-de-descuentos-web.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar sesión");
      }

      const data = await response.json();
      console.log("📥 Respuesta del backend (login):", data);
      setToken(data.token);
      setUsuario(data.usuario);
      console.log("🔄 Estado actualizado - usuario:", data.usuario);
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("usuario", JSON.stringify(data.usuario));
    } catch (error) {
      throw error;
    }
  };

  const register = async (token: string, usuario: Usuario) => {
    try {
      setToken(token);
      setUsuario(usuario);
      console.log("🔄 Estado actualizado - usuario:", usuario);
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("usuario", JSON.stringify(usuario));
    } catch (error) {
      console.error("Error guardando datos de registro:", error);
      throw new Error("Error al registrar en el contexto");
    }
  };

  const logout = async () => {
    setToken(null);
    setUsuario(null);
    console.log("🔄 Estado actualizado - usuario:", null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};