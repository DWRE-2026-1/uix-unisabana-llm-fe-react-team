import { apiRequest } from "../lib/api-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function buildPayload(payload) {
  return {
    prompt: payload.prompt,
    provider: payload.provider,
    model: payload.model,
    conversationId: payload.conversationId
  };
}

function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("uix_token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Backend expone POST /api/chat (equivalente funcional al ticket /api/prompts). */
export async function sendChatMessage(payload) {
  return apiRequest("/api/chat", {
    method: "POST",
    body: JSON.stringify(buildPayload(payload))
  });
}

/** Backend expone POST /api/chat/stream. */
export async function streamChatMessage(payload, onChunk) {
  const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(buildPayload(payload))
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    let message = `No se pudo procesar el mensaje (${response.status})`;
    try {
      if (contentType.includes("application/json")) {
        const body = await response.json();
        message = body?.message || message;
      } else {
        const text = await response.text();
        if (text) message = text;
      }
    } catch {
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("El servidor no devolvió una respuesta en streaming.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(":")) continue;

      if (line.startsWith("event:")) {
        currentEvent = line.slice(6).trim();
        continue;
      }

      if (!line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (!data) continue;

      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = { content: data };
      }

      if (currentEvent === "error") {
        throw new Error(parsed.message || "Error en el streaming del asistente.");
      }

      if (currentEvent === "done") return;

      const chunk =
        parsed.content ?? parsed.delta ?? parsed.text ?? parsed.message ?? "";
      if (chunk) onChunk(String(chunk));
    }
  }
}

export function extractReplyContent(body) {
  if (!body) return "";
  if (typeof body === "string") return body;

  const data = body.data ?? body;
  if (typeof data === "string") return data;

  return (
    data.content ??
    data.response ??
    data.reply ??
    data.answer ??
    data.message ??
    data.text ??
    ""
  );
}
