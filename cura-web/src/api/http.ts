import axios from "axios";
import { clearAuth, getAuth } from "../auth/auth";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
});

http.interceptors.request.use((config) => {
  const { token } = getAuth();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      clearAuth();
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);


export async function apiGet<T>(path: string): Promise<T> {
  const res = await http.get<T>(path);
  return res.data;
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await http.post<T>(path, body);
  return res.data;
}

export async function apiPut<T>(path: string, body?: any): Promise<T> {
  const res = await http.put<T>(path, body);
  return res.data;
}

export async function apiPatch<T>(path: string, body?: any): Promise<T> {
  const res = await http.patch<T>(path, body);
  return res.data;
}