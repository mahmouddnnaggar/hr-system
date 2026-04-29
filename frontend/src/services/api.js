import axios from "axios";
import { getApiBaseUrl } from "../lib/apiUrl";

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);

export default api;
