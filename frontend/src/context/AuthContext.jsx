/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../services/authApi";
import { AUTH_STORAGE_KEY, normalizeAuthUser, USER_ROLES } from "../lib/auth";

const AuthContext = createContext(null);
const LEGACY_STORAGE_KEY = "evalsystem:user";

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    const auth = stored ? JSON.parse(stored) : null;
    const user = normalizeAuthUser(auth?.user);

    if (!auth?.token || !user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return { user: null, token: "" };
    }

    return { user, token: auth.token };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return { user: null, token: "" };
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth);
  const currentUser = authState.user;
  const token = authState.token;

  const login = async (values) => {
    const response = await authApi.login(values);
    const user = normalizeAuthUser(response.user);

    if (!user || !response.token) {
      throw new Error("Login succeeded, but this user role is not supported.");
    }

    setAuthState({ user, token: response.token });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: response.token, user }));
    return user;
  };

  const logout = () => {
    setAuthState({ user: null, token: "" });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      currentUser,
      token,
      login,
      logout,
      isAdmin: currentUser?.role === USER_ROLES.ADMIN,
      isHR: currentUser?.role === USER_ROLES.HR,
      isEmployee: currentUser?.role === USER_ROLES.EMPLOYEE,
    }),
    [currentUser, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
