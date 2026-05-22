import shield from "../images/unisabana-shield.png";

export function AppHeader({ onOpenHistory }) {
  return (
    <header className="app-header">
      {onOpenHistory ? (
        <button
          type="button"
          className="sidebar-mobile-trigger"
          aria-label="Abrir historial de conversaciones"
          onClick={onOpenHistory}
        >
          ☰
        </button>
      ) : null}
      <img src={shield} alt="Escudo Unisabana" className="header-shield" />
      <div>
        <h1>Asistente Unisabana</h1>
        <p>Interfaz base institucional para conversaciones con modelos LLM.</p>
      </div>
    </header>
  );
}
