import axios from "axios";
import { AUTH_STORAGE_KEY } from "../lib/auth";
import { getApiBaseUrl } from "../lib/apiUrl";

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  try {
    const storedAuth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");

    if (storedAuth?.token) {
      config.headers.Authorization = `Bearer ${storedAuth.token}`;
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);

export default api;
