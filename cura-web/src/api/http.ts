import axios from "axios";
import { clearAuth, getAuth } from "../auth/auth";

export const http = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

// Request interceptor: attach token
http.interceptors.request.use((config) => {
  const { token } = getAuth();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 globally
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      // token invalid/expired OR not logged in
      clearAuth();
      // Hard redirect is simplest and reliable
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);
