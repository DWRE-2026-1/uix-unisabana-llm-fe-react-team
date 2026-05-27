import { useCallback, useEffect, useMemo, useState } from "react";
import { extractReplyContent, sendChatMessage, streamChatMessage } from "../services/chat-api";
import { loadMessages, normalizeMessage, saveMessages } from "../services/messages-api";

function createMessage(role, content, extra = {}) {
  return normalizeMessage({
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extra
  });
}

export function useChatMessages(activeConversationId) {
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messages = useMemo(() => {
    if (!activeConversationId) return [];
    return messagesByConversation[activeConversationId] || [];
  }, [activeConversationId, messagesByConversation]);

  const setConversationMessages = useCallback((conversationId, updater) => {
    setMessagesByConversation((current) => {
      const previous = current[conversationId] || [];
      const next = typeof updater === "function" ? updater(previous) : updater;
      const normalized = next.map((message) => normalizeMessage(message));
      saveMessages(conversationId, normalized);
      return { ...current, [conversationId]: normalized };
    });
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    const stored = loadMessages(activeConversationId);
    if (!stored.length) return;

    setMessagesByConversation((current) => {
      if (current[activeConversationId]?.length) return current;
      return { ...current, [activeConversationId]: stored };
    });
  }, [activeConversationId]);

  const clearError = useCallback(() => setError(""), []);

  const sendMessage = useCallback(
    async ({ content, provider, model, streamMode, onConversationTouch }) => {
      const trimmed = content.trim();
      if (!trimmed || !activeConversationId || loading) return false;

      const userMessage = createMessage("user", trimmed);
      const assistantId = crypto.randomUUID();
      const assistantPlaceholder = createMessage("assistant", "", { id: assistantId });

      setError("");
      setConversationMessages(activeConversationId, (current) => [
        ...current,
        userMessage,
        assistantPlaceholder
      ]);
      setLoading(true);
      await onConversationTouch?.();

      const payload = {
        prompt: trimmed,
        provider,
        model,
        conversationId: activeConversationId
      };

      try {
        if (streamMode) {
          let accumulated = "";
          await streamChatMessage(payload, (chunk) => {
            accumulated += chunk;
            setConversationMessages(activeConversationId, (current) =>
              current.map((message) =>
                message.id === assistantId ? { ...message, content: accumulated } : message
              )
            );
          });

          if (!accumulated.trim()) {
            throw new Error("La IA no devolvió contenido en la respuesta.");
          }
        } else {
          const body = await sendChatMessage(payload);
          const reply = extractReplyContent(body).trim();
          if (!reply) {
            throw new Error("La IA no devolvió contenido en la respuesta.");
          }

          setConversationMessages(activeConversationId, (current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, content: reply } : message
            )
          );
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo obtener respuesta del asistente.";
        setError(message);
        setConversationMessages(activeConversationId, (current) =>
          current.map((item) =>
            item.id === assistantId ? { ...item, content: message, isError: true } : item
          )
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [activeConversationId, loading, setConversationMessages]
  );

  return { messages, loading, error, clearError, sendMessage };
}
