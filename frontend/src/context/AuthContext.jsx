/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../services/authApi";
import { normalizeAuthUser, USER_ROLES } from "../lib/auth";

const AuthContext = createContext(null);
const STORAGE_KEY = "evalsystem:user";

function readStoredUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const user = stored ? normalizeAuthUser(JSON.parse(stored)) : null;
    if (stored && !user) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return user;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readStoredUser);

  const login = async ({ email }) => {
    const user = normalizeAuthUser(await authApi.login(email));

    if (!user) {
      throw new Error("Login succeeded, but this user role is not supported.");
    }

    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      isHR: currentUser?.role === USER_ROLES.HR,
      isEmployee: currentUser?.role === USER_ROLES.EMPLOYEE,
    }),
    [currentUser],
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
