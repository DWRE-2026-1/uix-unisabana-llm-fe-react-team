import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireAdmin } from "./guards/RequireAdmin";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminRolesPage } from "./pages/admin/AdminRolesPage";

function TopNav() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="top-nav">
      <div>
        <Link to="/">Chat</Link>
        <Link to="/profile">Mi perfil</Link>
        {isAdmin ? <Link to="/admin/users">Admin usuarios</Link> : null}
        {isAdmin ? <Link to="/admin/roles">Admin roles</Link> : null}
      </div>
      <div>
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
  return (
    <>
      <TopNav />
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
