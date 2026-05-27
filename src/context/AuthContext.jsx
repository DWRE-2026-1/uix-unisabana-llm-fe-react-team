import { createContext, useContext, useMemo, useState } from "react";
import { login as loginApi, logout as logoutApi } from "../services/auth-api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("uix_user");
    return raw ? JSON.parse(raw) : null;
  });

  async function login(credentials) {
    const response = await loginApi(credentials);
    const { token, user: userData } = response.data;
    localStorage.setItem("uix_token", token);
    localStorage.setItem("uix_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }

  async function logout() {
    try {
      await logoutApi();
    } catch {
    }
    localStorage.removeItem("uix_token");
    localStorage.removeItem("uix_user");
    setUser(null);
  }

  const isAdmin = user?.role === "admin";
  const value = useMemo(() => ({ user, isAdmin, login, logout }), [user, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}