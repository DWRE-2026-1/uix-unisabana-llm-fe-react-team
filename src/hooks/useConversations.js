import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createConversation,
  deleteConversation,
  listConversations,
  touchConversation
} from "../services/conversations-api";

const COLLAPSED_STORAGE_KEY = "uix_sidebar_collapsed";

function readCollapsedPreference() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "1";
}

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [collapsed, setCollapsed] = useState(readCollapsedPreference);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const items = await listConversations();
    setConversations(items);
    return items;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      let items = await listConversations();

      if (!items.length) {
        const created = await createConversation({ title: "Nueva conversación" });
        items = [created];
      }

      if (!cancelled) {
        setConversations(items);
        setActiveId((current) => current || items[0]?.id || "");
        setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) || null,
    [conversations, activeId]
  );

  const selectConversation = useCallback((conversationId) => {
    setActiveId(conversationId);
    setMobileOpen(false);
  }, []);

  const handleNewConversation = useCallback(async () => {
    const created = await createConversation({ title: "Nueva conversación" });
    setConversations((current) => [created, ...current.filter((item) => item.id !== created.id)]);
    setActiveId(created.id);
    setMobileOpen(false);
    return created;
  }, []);

  const handleDeleteConversation = useCallback(
    async (conversationId) => {
      const target = conversations.find((item) => item.id === conversationId);
      if (!target) return false;

      const confirmed = window.confirm(`¿Eliminar "${target.title}" del historial?`);
      if (!confirmed) return false;

      await deleteConversation(conversationId);

      const remaining = conversations.filter((item) => item.id !== conversationId);
      if (!remaining.length) {
        const created = await createConversation({ title: "Nueva conversación" });
        setConversations([created]);
        setActiveId(created.id);
        return true;
      }

      setConversations(remaining);
      if (activeId === conversationId) {
        setActiveId(remaining[0].id);
      }
      return true;
    },
    [conversations, activeId]
  );

  const bumpActiveConversation = useCallback(async () => {
    if (!activeId) return;
    const updated = await touchConversation(activeId, { updatedAt: new Date().toISOString() });
    if (!updated) return;
    setConversations((current) =>
      [updated, ...current.filter((item) => item.id !== updated.id)].sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      )
    );
  }, [activeId]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => !current);
  }, []);

  return {
    conversations,
    activeConversation,
    activeId,
    collapsed,
    mobileOpen,
    loading,
    selectConversation,
    createConversation: handleNewConversation,
    deleteConversation: handleDeleteConversation,
    bumpActiveConversation,
    toggleCollapsed,
    setMobileOpen,
    refresh
  };
}
