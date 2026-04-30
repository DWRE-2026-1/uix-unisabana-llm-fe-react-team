export function ChatThread({ prompt, answer, loading }) {
  return (
    <section className="chat-thread" aria-live="polite">
      {prompt.trim() && (
        <article className="message message-user">
          <h3>Usuario</h3>
          <p>{prompt}</p>
        </article>
      )}
      <article className="message message-assistant">
        <h3>Asistente</h3>
        <p>{answer || (loading ? "Generando respuesta..." : "Sin respuesta aún")}</p>
      </article>
    </section>
  );
}
