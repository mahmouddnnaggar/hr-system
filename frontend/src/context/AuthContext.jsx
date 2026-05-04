/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
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
      return { user: null, token: "", refreshToken: "" };
    }

    return { user, token: auth.token, refreshToken: auth.refreshToken || "" };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return { user: null, token: "", refreshToken: "" };
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth);
  const currentUser = authState.user;
  const token = authState.token;
  const refreshToken = authState.refreshToken;

  const login = useCallback(async (values) => {
    const response = await authApi.login(values);
    const user = normalizeAuthUser(response.user);

    if (!user || !response.token || !response.refreshToken) {
      throw new Error("Login succeeded, but this user role is not supported.");
    }

    setAuthState({ user, token: response.token, refreshToken: response.refreshToken });
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: response.token, refreshToken: response.refreshToken, user }),
    );
    return user;
  }, []);

  const logout = useCallback(() => {
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }

    setAuthState({ user: null, token: "", refreshToken: "" });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [refreshToken]);

  const value = useMemo(
    () => ({
      currentUser,
      token,
      refreshToken,
      login,
      logout,
      isAdmin: currentUser?.role === USER_ROLES.ADMIN,
      isHR: currentUser?.role === USER_ROLES.HR,
      isEmployee: currentUser?.role === USER_ROLES.EMPLOYEE,
    }),
    [currentUser, token, refreshToken, login, logout],
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
