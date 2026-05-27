import { useCallback, useEffect, useMemo, useState } from "react";
import { sendChatMessage, streamChatMessage } from "../services/chat-api";
import { saveMessage, getMessages } from "../services/conversations-api";

function createMessage(role, content, id) {
  return {
    id: id || crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString()
  };
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

  useEffect(() => {
    if (!activeConversationId) return;

    async function loadMessages() {
      const loaded = await getMessages(activeConversationId);
      const normalized = loaded.map((m) => createMessage(m.role, m.content, m._id));
      setConversationMessages(activeConversationId, normalized);
    }

    loadMessages();
  }, [activeConversationId, setConversationMessages]);

  const sendMessage = useCallback(
    async ({ content, provider, streamMode, onConversationTouch }) => {
      const trimmed = content.trim();
      if (!trimmed || !activeConversationId || loading) return false;

      const assistantId = crypto.randomUUID();

      setConversationMessages(activeConversationId, (current) => [
        ...current,
        createMessage("user", trimmed),
        { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() }
      ]);

      setLoading(true);
      await onConversationTouch?.();

      
      await saveMessage({ conversationId: activeConversationId, role: "user", content: trimmed });

      try {
        let fullAnswer = "";

        if (streamMode) {
          await streamChatMessage({ prompt: trimmed, provider }, (chunk) => {
            fullAnswer += chunk;
            setConversationMessages(activeConversationId, (current) =>
              current.map((message) =>
                message.id === assistantId ? { ...message, content: fullAnswer } : message
              )
            );
          });
        } else {
          const data = await sendChatMessage({ prompt: trimmed, provider });
          fullAnswer = data.response;
          setConversationMessages(activeConversationId, (current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, content: fullAnswer } : message
            )
          );
        }

        
        await saveMessage({ conversationId: activeConversationId, role: "assistant", content: fullAnswer });

        return true;
      } catch (error) {
        setConversationMessages(activeConversationId, (current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: `Error: ${error.message}` } : message
          )
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [activeConversationId, loading, setConversationMessages]
  );

  return { messages, loading, sendMessage };
}