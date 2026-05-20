import { useMutation } from "@tanstack/react-query";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export const useLogin = () => {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post("/auth/login", data).then((res) => res.data),
    onSuccess: (data) => {
      login(data.user.email, data.user.password);
    },
  });
};
