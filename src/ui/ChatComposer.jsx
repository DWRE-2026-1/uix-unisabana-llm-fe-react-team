export function ChatComposer({ prompt, loading, streamMode, onPromptChange, onStreamChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="composer">
      <textarea
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Pregunta algo al asistente"
        rows={4}
      />
      <div className="composer-actions">
        <label className="toggle">
          <input
            type="checkbox"
            checked={streamMode}
            onChange={(event) => onStreamChange(event.target.checked)}
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
