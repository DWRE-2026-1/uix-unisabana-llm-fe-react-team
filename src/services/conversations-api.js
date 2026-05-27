import { apiRequest } from "../lib/api-client";

const STORAGE_KEY = "uix_conversations";

function readLocalConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalConversations(conversations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function normalizeConversation(conversation) {
  return {
    id: String(conversation._id || conversation.id),
    title: conversation.title || "Sin título",
    updatedAt: conversation.updatedAt || new Date().toISOString()
  };
}

function sortConversations(conversations) {
  return [...conversations].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

function unwrapList(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data?.items)) return body.data.items;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.conversations)) return body.conversations;
  return [];
}

function unwrapItem(body) {
  if (body?.data && typeof body.data === "object" && !Array.isArray(body.data)) return body.data;
  if (body?.conversation && typeof body.conversation === "object") return body.conversation;
  if (body && typeof body === "object" && (body._id || body.id)) return body;
  return null;
}

async function withLocalFallback(action, fallback) {
  try {
    return await action();
  } catch (error) {
    console.error("API error, usando fallback local:", error.message);
    return fallback();
  }
}

export async function listConversations() {
  return withLocalFallback(
    async () => {
      const body = await apiRequest("/api/conversations");
      return sortConversations(unwrapList(body).map(normalizeConversation));
    },
    () => sortConversations(readLocalConversations().map(normalizeConversation))
  );
}

export async function createConversation(payload = {}) {
  const draft = {
    id: `local-${crypto.randomUUID()}`,
    title: payload.title || "Nueva conversación",
    updatedAt: new Date().toISOString()
  };

  return withLocalFallback(
    async () => {
      const body = await apiRequest("/api/conversations", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const created = unwrapItem(body);
      return normalizeConversation(created || draft);
    },
    () => {
      const created = normalizeConversation(draft);
      const next = sortConversations([created, ...readLocalConversations()]);
      writeLocalConversations(next);
      return created;
    }
  );
}

export async function deleteConversation(conversationId) {
  return withLocalFallback(
    async () => {
      await apiRequest(`/api/conversations/${conversationId}`, { method: "DELETE" });
      return true;
    },
    () => {
      const next = readLocalConversations().filter((item) => item.id !== conversationId);
      writeLocalConversations(next);
      return true;
    }
  );
}

export async function touchConversation(conversationId, patch = {}) {
  const conversations = readLocalConversations();
  const index = conversations.findIndex((item) => item.id === conversationId);
  if (index === -1) return null;

  const updated = normalizeConversation({
    ...conversations[index],
    ...patch,
    updatedAt: patch.updatedAt || new Date().toISOString()
  });

  conversations[index] = updated;
  writeLocalConversations(conversations);
  return updated;
}

export async function saveMessage(payload) {
  return withLocalFallback(
    async () => {
      const body = await apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      return body.data;
    },
    () => null
  );
}

export async function getMessages(conversationId) {
  return withLocalFallback(
    async () => {
      const body = await apiRequest(`/api/messages?conversationId=${conversationId}`);
      return Array.isArray(body?.data) ? body.data : [];
    },
    () => []
  );
}