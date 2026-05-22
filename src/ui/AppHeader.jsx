import shield from "../images/unisabana-shield.png";

export function AppHeader() {
  return (
    <header className="app-header">
      <img src={shield} alt="Escudo Unisabana" className="header-shield" />
      <div>
        <h1>Asistente Unisabana</h1>
        <p>Interfaz base institucional para conversaciones con modelos LLM.</p>
      </div>
    </header>
  );
}
