import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários de demonstração
const demoUsers: User[] = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Usuário Comum",
    email: "user@example.com",
    role: "user",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se há um usuário logado no localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Para fins de demonstração, aceitar qualquer senha para os usuários demo
    const foundUser = demoUsers.find((u) => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(foundUser));
      return true;
    }

    return false;
  };

  // Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  // Registro (simulado)
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verificar se o email já está em uso
    const emailExists = demoUsers.some((u) => u.email === email);
    if (emailExists) {
      return false;
    }

    // Em um app real, enviaríamos esses dados para um servidor
    // Para este demo, apenas simulamos sucesso
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
