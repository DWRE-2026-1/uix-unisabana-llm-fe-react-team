import { useCallback, useMemo, useState } from "react";

function createMessage(role, content) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function buildMockReply({ prompt, provider, model, streamMode }) {
  const mode = streamMode ? "SSE (simulado)" : "respuesta completa";
  return `[${mode}] Proveedor: ${provider}, modelo: ${model}.\n\nRecibí tu mensaje: «${prompt}»`;
}

async function simulateReply(text, streamMode, onChunk) {
  if (!streamMode) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    onChunk(text);
    return;
  }

  let index = 0;
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      index = Math.min(index + 3, text.length);
      onChunk(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, 24);
  });
}

export function useChatMessages(activeConversationId) {
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [loading, setLoading] = useState(false);

  const messages = useMemo(() => {
    if (!activeConversationId) return [];
    return messagesByConversation[activeConversationId] || [];
  }, [activeConversationId, messagesByConversation]);

  const setConversationMessages = useCallback((conversationId, updater) => {
    setMessagesByConversation((current) => {
      const previous = current[conversationId] || [];
      const next = typeof updater === "function" ? updater(previous) : updater;
      return { ...current, [conversationId]: next };
    });
  }, []);

  const sendMessage = useCallback(
    async ({ content, provider, model, streamMode, onConversationTouch }) => {
      const trimmed = content.trim();
      if (!trimmed || !activeConversationId || loading) return false;

      const userMessage = createMessage("user", trimmed);
      const assistantId = crypto.randomUUID();
      const assistantPlaceholder = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString()
      };

      setConversationMessages(activeConversationId, (current) => [
        ...current,
        userMessage,
        assistantPlaceholder
      ]);
      setLoading(true);

      await onConversationTouch?.();

      const reply = buildMockReply({ prompt: trimmed, provider, model, streamMode });

      try {
        await simulateReply(reply, streamMode, (partial) => {
          setConversationMessages(activeConversationId, (current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, content: partial } : message
            )
          );
        });
        return true;
      } finally {
        setLoading(false);
      }
    },
    [activeConversationId, loading, setConversationMessages]
  );

  return {
    messages,
    loading,
    sendMessage
  };
}
