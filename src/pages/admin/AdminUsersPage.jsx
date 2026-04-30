import { useEffect, useState } from "react";

export function AdminUsersPage() {
  const [users, setUsers] = useState([
    { id: "u-1", name: "Admin", email: "admin@example.com", role: { slug: "admin" } }
  ]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Secret123!");

  useEffect(() => {}, []);

  function handleCreate(event) {
    event.preventDefault();
    setUsers((current) => [
      ...current,
      { id: `u-${Date.now()}`, name, email, role: { slug: "user" } }
    ]);
    setName("");
    setEmail("");
  }

  function handleDelete(userId) {
    setUsers((current) => current.filter((user) => user.id !== userId));
  }

  return (
    <main className="simple-page">
      <h1>Administración de usuarios</h1>
      <form onSubmit={handleCreate} className="simple-form">
        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Contraseña
          <input value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button type="submit">Crear usuario</button>
      </form>

      <section className="simple-table">
        <h2>Usuarios registrados</h2>
        {users.map((user) => (
          <article key={user.id}>
            <div>
              <strong>{user.name}</strong>
              <p>{user.email}</p>
              <small>Rol: {user.role?.slug || "user"}</small>
            </div>
            <button type="button" onClick={() => handleDelete(user.id)}>
              Desactivar
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
