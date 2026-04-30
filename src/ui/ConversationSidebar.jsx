export function ConversationSidebar({ conversations }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2>Conversaciones</h2>
        <button type="button">Nuevo chat</button>
      </div>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <strong>{conversation.title}</strong>
            <span>{conversation.updatedAt}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
