import axios from "axios";
import { AUTH_STORAGE_KEY } from "../lib/auth";
import { getApiBaseUrl } from "../lib/apiUrl";

const apiBaseUrl = getApiBaseUrl();

const api = axios.create({
  baseURL: apiBaseUrl,
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
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
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    try {
      const storedAuth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");

      if (!storedAuth?.refreshToken) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const response = await refreshClient.post("/auth/refresh-token", {
        refreshToken: storedAuth.refreshToken,
      });
      const nextAuth = {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
      originalRequest.headers.Authorization = `Bearer ${nextAuth.token}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return Promise.reject(refreshError);
    }
  },
);

export default api;
