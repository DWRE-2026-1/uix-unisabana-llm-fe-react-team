export function ChatComposer({ prompt, loading, streamMode, onPromptChange, onStreamChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="composer">
      <label className="toggle">
        <input
          type="checkbox"
          checked={streamMode}
          onChange={(event) => onStreamChange(event.target.checked)}
        />
        Streaming SSE
      </label>
      <textarea
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Escribe un mensaje"
        rows={4}
      />
      <button type="submit" disabled={loading || !prompt.trim()}>
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
