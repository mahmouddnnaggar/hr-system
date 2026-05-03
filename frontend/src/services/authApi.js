import api from "./api";

export const authApi = {
  login(payload) {
    return api.post("/auth/login", payload);
  },
  register(payload) {
    return api.post("/auth/register", payload);
  },
  verifyOtp(payload) {
    return api.post("/auth/verify-otp", payload);
  },
  resendOtp(email) {
    return api.post("/auth/resend-otp", { email });
  },
};
