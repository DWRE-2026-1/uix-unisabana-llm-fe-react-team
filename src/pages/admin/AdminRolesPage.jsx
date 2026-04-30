import { useEffect, useState } from "react";

export function AdminRolesPage() {
  const [roles, setRoles] = useState([
    { id: "r-1", name: "Administrator", slug: "admin", description: "Full access" },
    { id: "r-2", name: "User", slug: "user", description: "Standard access" }
  ]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {}, []);

  function handleCreate(event) {
    event.preventDefault();
    setRoles((current) => [...current, { id: `r-${Date.now()}`, name, slug, description }]);
    setName("");
    setSlug("");
    setDescription("");
  }

  return (
    <main className="simple-page">
      <h1>Administración de roles</h1>
      <form onSubmit={handleCreate} className="simple-form">
        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Slug
          <input value={slug} onChange={(event) => setSlug(event.target.value)} required />
        </label>
        <label>
          Descripción
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <button type="submit">Crear rol</button>
      </form>

      <section className="simple-table">
        <h2>Roles disponibles</h2>
        {roles.map((role) => (
          <article key={role.id}>
            <div>
              <strong>{role.name}</strong>
              <p>{role.slug}</p>
              <small>{role.description || "Sin descripción"}</small>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
