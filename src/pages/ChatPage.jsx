import { useState } from "react";
import { AppHeader } from "../ui/AppHeader";
import { ConversationSidebar } from "../ui/ConversationSidebar";
import { ProviderModelBar } from "../ui/ProviderModelBar";
import { ChatThread } from "../ui/ChatThread";
import { ChatComposer } from "../ui/ChatComposer";

export function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamMode, setStreamMode] = useState(true);
  const [provider, setProvider] = useState("ollama");
  const [model, setModel] = useState("llama3.1");

  const conversations = [
    { id: "c-1", title: "Conversación de ejemplo", updatedAt: "Reciente" },
    { id: "c-2", title: "Notas de clase", updatedAt: "Ayer" }
  ];

  async function sendPrompt(event) {
    event.preventDefault();
    setLoading(true);
    setAnswer("");

    // Scaffolding behavior: local simulated response.
    setTimeout(() => {
      if (streamMode) {
        setAnswer(`[SSE scaffold] Provider: ${provider}, model: ${model}. Prompt: ${prompt}`);
      } else {
        setAnswer(`[Scaffold] Provider: ${provider}, model: ${model}. Prompt: ${prompt}`);
      }
      setLoading(false);
    }, 500);
  }

  return (
    <main className="shell">
      <section className="app-scaffold">
        <AppHeader />
        <div className="app-body">
          <ConversationSidebar conversations={conversations} />
          <section className="chat-area">
            <ProviderModelBar
              title="Nueva conversación"
              provider={provider}
              model={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
            />
            <ChatThread prompt={prompt} answer={answer} loading={loading} />
            <ChatComposer
              prompt={prompt}
              loading={loading}
              streamMode={streamMode}
              onPromptChange={setPrompt}
              onStreamChange={setStreamMode}
              onSubmit={sendPrompt}
            />
          </section>
        </div>
      </section>
    </main>
  );
}
