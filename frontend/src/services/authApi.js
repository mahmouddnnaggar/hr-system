import api from "./api";

export const authApi = {
  login(email) {
    return api.post("/auth/login", { email });
  },
};
