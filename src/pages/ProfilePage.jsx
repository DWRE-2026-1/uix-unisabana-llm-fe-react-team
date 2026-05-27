import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [password, setPassword] = useState("");

  function handleSave(event) {
    event.preventDefault();
    // This page is scaffold-only. Wiring to profile endpoint is pending.
    alert("Scaffolding: perfil listo para integrar endpoint de actualización.");
  }

  return (
    <main className="simple-page">
      <h1>Mi perfil</h1>
      <p>Gestiona tu información básica y credenciales.</p>
      <form onSubmit={handleSave} className="simple-form">
        <label>
          Nombre visible
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </label>
        <label>
          Nueva contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </label>
        <label>
          Rol actual
          <input value={user?.role || "user"} disabled />
        </label>
        <button type="submit">Guardar cambios</button>
      </form>
    </main>
  );
}
