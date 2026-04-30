export function ProviderModelBar({ title, provider, model, onProviderChange, onModelChange }) {
  return (
    <section className="toolbar">
      <div>
        <h2>{title}</h2>
        <p>Selecciona proveedor y modelo por conversación.</p>
      </div>
      <div className="toolbar-controls">
        <label>
          Proveedor
          <select value={provider} onChange={(event) => onProviderChange(event.target.value)}>
            <option value="ollama">Ollama</option>
            <option value="openai">OpenAI-compatible</option>
          </select>
        </label>
        <label>
          Modelo
          <input value={model} onChange={(event) => onModelChange(event.target.value)} />
        </label>
      </div>
    </section>
  );
}
