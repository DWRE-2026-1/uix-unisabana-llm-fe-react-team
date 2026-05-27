export function ChatComposer({ prompt, loading, streamMode, onPromptChange, onStreamChange, onSubmit }) {
  function handleKeyDown(event) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form onSubmit={onSubmit} className="composer">
      <textarea
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Pregunta algo al asistente"
        rows={4}
        disabled={loading}
        aria-label="Mensaje para el asistente"
      />
      <div className="composer-actions">
        <label className="toggle">
          <input
            type="checkbox"
            checked={streamMode}
            onChange={(event) => onStreamChange(event.target.checked)}
            disabled={loading}
          />
          Streaming SSE
        </label>
        <button type="submit" disabled={loading || !prompt.trim()}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
