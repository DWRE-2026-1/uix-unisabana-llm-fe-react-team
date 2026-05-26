import { useState } from "react";
import { useChatMessages } from "../hooks/useChatMessages";
import { useConversations } from "../hooks/useConversations";
import { AppHeader } from "../ui/AppHeader";
import { ConversationSidebar } from "../ui/ConversationSidebar";
import { ProviderModelBar } from "../ui/ProviderModelBar";
import { ChatThread } from "../ui/ChatThread";
import { ChatComposer } from "../ui/ChatComposer";

export function ChatPage() {
  const [prompt, setPrompt] = useState("");
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

  const { messages, loading, sendMessage } = useChatMessages(activeId);

  async function sendPrompt(event) {
    event.preventDefault();
    const content = prompt.trim();
    if (!content || loading) return;

    setPrompt("");
    await sendMessage({
      content,
      provider,
      model,
      streamMode,
      onConversationTouch: bumpActiveConversation
    });
  }

  async function handleNewChat() {
    await createConversation();
    setPrompt("");
  }

  function handleSelectConversation(conversationId) {
    if (conversationId === activeId) {
      setMobileOpen(false);
      return;
    }

    selectConversation(conversationId);
    setPrompt("");
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
            <ChatThread messages={messages} loading={loading} />
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
