import { useEffect, useRef } from "react";

const ROLE_LABELS = {
  user: "Usuario",
  assistant: "Asistente"
};

export function ChatThread({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    const node = bottomRef.current;
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const hasMessages = messages.length > 0;

  return (
    <section
      className="chat-thread"
      aria-live="polite"
      aria-label="Historial de mensajes"
    >
      {!hasMessages && !loading && (
        <p className="chat-thread-empty">Escribe un mensaje para comenzar la conversación.</p>
      )}

      {messages.map((message) => {
        const isUser = message.role === "user";
        const isTyping =
          message.role === "assistant" && loading && !message.content && !message.isError;
        const isError = Boolean(message.isError);

        return (
          <article
            key={message.id}
            className={`message ${isUser ? "message-user" : "message-assistant"}${
              isTyping ? " message-loading" : ""
            }${isError ? " message-error" : ""}`}
          >
            <h3>{isError ? "Error" : ROLE_LABELS[message.role] || message.role}</h3>
            <p>
              {isTyping ? (
                <>
                  Generando respuesta
                  <span className="typing-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </>
              ) : (
                message.content
              )}
            </p>
          </article>
        );
      })}

      <div ref={bottomRef} className="chat-thread-anchor" aria-hidden="true" />
    </section>
  );
}
