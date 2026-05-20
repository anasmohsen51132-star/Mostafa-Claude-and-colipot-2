import { useEffect } from "react";
import api from "../api/axios";
import { useAuthStore } from "../store/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const restore = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        const me = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        setAuth(me.data, data.accessToken);
      } catch {
        clearAuth();
      }
    };
    restore();
  }, [setAuth, clearAuth]);

  return <>{children}</>;
};
