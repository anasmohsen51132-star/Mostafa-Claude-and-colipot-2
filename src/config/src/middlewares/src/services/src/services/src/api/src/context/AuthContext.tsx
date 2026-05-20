import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

interface User {
  id: string;
  email: string;
  role: "OWNER" | "ADMIN" | "STUDENT";
  name: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const restore = async () => {
    try {
      const { data } = await api.post("/auth/refresh");
      setAccessToken(data.accessToken);
      sessionStorage.setItem("accessToken", data.accessToken);
      const me = await api.get("/users/me");
      setUser(me.data);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    setAccessToken(data.accessToken);
    sessionStorage.setItem("accessToken", data.accessToken);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem("accessToken");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, restore }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
