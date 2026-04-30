import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("uix_user");
    return raw ? JSON.parse(raw) : null;
  });

  async function login(credentials) {
    // Scaffolding login: mocked local session for UI flow.
    const role = credentials.email === "admin@example.com" ? "admin" : "user";
    const fakeUser = {
      id: "scaffold-user-id",
      name: credentials.email === "admin@example.com" ? "Admin" : "User",
      email: credentials.email,
      role
    };
    localStorage.setItem("uix_token", "scaffold-token");
    localStorage.setItem("uix_user", JSON.stringify(fakeUser));
    setUser(fakeUser);
    return fakeUser;
  }

  function logout() {
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
