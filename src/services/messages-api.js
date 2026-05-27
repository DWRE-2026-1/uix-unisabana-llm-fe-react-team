const STORAGE_KEY = "uix_messages";

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function normalizeMessage(message) {
  return {
    id: String(message.id || crypto.randomUUID()),
    role: message.role,
    content: message.content || "",
    createdAt: message.createdAt || new Date().toISOString(),
    isError: Boolean(message.isError)
  };
}

export function loadMessages(conversationId) {
  const items = readStore()[conversationId];
  return Array.isArray(items) ? items.map(normalizeMessage) : [];
}

export function saveMessages(conversationId, messages) {
  const store = readStore();
  store[conversationId] = messages.map(normalizeMessage);
  writeStore(store);
}
