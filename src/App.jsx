import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireAdmin } from "./guards/RequireAdmin";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminRolesPage } from "./pages/admin/AdminRolesPage";
import logoDark from "./images/logo-unisabana-dark.png";
import logoLight from "./images/logo-unisabana-light.png";

function TopNav({ theme, onToggleTheme }) {
  const { user, isAdmin, logout } = useAuth();
  const logo = theme === "dark" ? logoDark : logoLight;

  return (
    <nav className="top-nav">
      <div className="top-nav-left">
        <img className="brand-logo" src={logo} alt="Universidad de La Sabana" />
        <div className="top-nav-links">
          <Link to="/">Chat</Link>
          <Link to="/profile">Mi perfil</Link>
          {isAdmin ? <Link to="/admin/users">Admin usuarios</Link> : null}
          {isAdmin ? <Link to="/admin/roles">Admin roles</Link> : null}
        </div>
      </div>
      <div className="top-nav-right">
        <button type="button" className="secondary-button" onClick={onToggleTheme}>
          {theme === "light" ? "Dark" : "Light"}
        </button>
        <span>{user?.email || "Invitado"}</span>
        {user ? (
          <button type="button" onClick={logout}>
            Salir
          </button>
        ) : null}
      </div>
    </nav>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("uix-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("uix-theme", theme);
  }, [theme]);

  const toggleTheme = useMemo(
    () => () => setTheme((current) => (current === "light" ? "dark" : "light")),
    []
  );

  return (
    <>
      <TopNav theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<RequireAdmin />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/roles" element={<AdminRolesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
