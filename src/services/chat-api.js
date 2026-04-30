import { notImplemented } from "../lib/not-implemented";

export async function sendChatMessage(_payload) {
  return notImplemented("chatApi", "sendChatMessage(payload)");
}

export async function streamChatMessage(_payload, _handlers) {
  return notImplemented("chatApi", "streamChatMessage(payload, handlers)");
}
