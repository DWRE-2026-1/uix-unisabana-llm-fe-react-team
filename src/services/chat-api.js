import { apiRequest } from "../lib/api-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function sendChatMessage(payload) {
  const response = await apiRequest("/api/prompts", {
    method: "POST",
    body: JSON.stringify({ prompt: payload.prompt, provider: payload.provider })
  });
  return response.data;
}

export async function streamChatMessage(payload, onChunk) {
  const response = await fetch(`${API_BASE_URL}/api/prompts/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: payload.prompt, provider: payload.provider })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.replace("data: ", "").trim();
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.content) onChunk(parsed.content);
      } catch {}
    }
  }
}