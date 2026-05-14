import { useState } from "react";
import { AppHeader } from "../ui/AppHeader";
import { ConversationSidebar } from "../ui/ConversationSidebar";
import { ProviderModelBar } from "../ui/ProviderModelBar";
import { ChatThread } from "../ui/ChatThread";
import { ChatComposer } from "../ui/ChatComposer";
import { sendChatMessage, streamChatMessage } from "../services/chat-api";

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

  try {
    if (streamMode) {
      await streamChatMessage({ prompt, provider }, (chunk) => {
        setAnswer(prev => prev + chunk);
      });
    } else {
      const data = await sendChatMessage({ prompt, provider });
      setAnswer(data.response);
    }
  } catch (error) {
    setAnswer(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
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
