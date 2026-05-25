import { useState } from "react";
import { useConversations } from "../hooks/useConversations";
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

  const {
    conversations,
    activeConversation,
    activeId,
    collapsed,
    mobileOpen,
    loading: conversationsLoading,
    selectConversation,
    createConversation,
    deleteConversation,
    bumpActiveConversation,
    toggleCollapsed,
    setMobileOpen
  } = useConversations();

  async function sendPrompt(event) {
    event.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setAnswer("");

    await bumpActiveConversation();

    setTimeout(() => {
      if (streamMode) {
        setAnswer(`[SSE scaffold] Provider: ${provider}, model: ${model}. Prompt: ${prompt}`);
      } else {
        setAnswer(`[Scaffold] Provider: ${provider}, model: ${model}. Prompt: ${prompt}`);
      }
      setLoading(false);
    }, 500);
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

  async function handleNewChat() {
    await createConversation();
    setPrompt("");
    setAnswer("");
    setLoading(false);
  }

  async function handleSelectConversation(conversationId) {
    if (conversationId === activeId) {
      setMobileOpen(false);
      return;
    }

    selectConversation(conversationId);
    setPrompt("");
    setAnswer("");
    setLoading(false);
  }

  const conversationTitle = activeConversation?.title || "Nueva conversación";

  return (
    <main className="shell">
      <section className="app-scaffold">
        <AppHeader onOpenHistory={() => setMobileOpen(true)} />
        <div className={`app-body ${collapsed ? "app-body--sidebar-collapsed" : ""}`}>
          <ConversationSidebar
            conversations={conversations}
            activeId={activeId}
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            loading={conversationsLoading}
            onSelect={handleSelectConversation}
            onNew={handleNewChat}
            onDelete={deleteConversation}
            onToggleCollapse={toggleCollapsed}
            onCloseMobile={() => setMobileOpen(false)}
          />
          <section className="chat-area">
            <ProviderModelBar
              title={conversationTitle}
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
