import api from "./api";

export const authApi = {
  login(payload) {
    return api.post("/auth/login", payload);
  },
  register(payload) {
    return api.post("/auth/register", payload);
  },
};
