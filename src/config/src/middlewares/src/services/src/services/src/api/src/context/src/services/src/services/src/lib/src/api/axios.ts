import axios from "axios";
import { v4 as uuid } from "uuid";

let isRefreshing = false;
let refreshQueue: ((token: string | null) => void)[] = [];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  config.headers["X-Correlation-ID"] = uuid();
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              resolve(Promise.reject(error));
            }
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data.accessToken;
        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        return api(originalRequest);
      } catch (err) {
        refreshQueue.forEach((cb) => cb(null));
        refreshQueue = [];
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
