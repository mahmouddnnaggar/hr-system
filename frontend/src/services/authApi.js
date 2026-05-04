import api from "./api";

export const authApi = {
  login(payload) {
    return api.post("/auth/login", payload);
  },
  register(payload) {
    return api.post("/auth/register", payload);
  },
  forgotPassword(email) {
    return api.post("/auth/forgot-password", { email });
  },
  resetPassword(payload) {
    return api.post("/auth/reset-password", payload);
  },
  logout(refreshToken) {
    return api.post("/auth/logout", { refreshToken });
  },
};
