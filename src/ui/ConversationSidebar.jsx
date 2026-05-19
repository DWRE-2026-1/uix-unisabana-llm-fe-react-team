export function ConversationSidebar({ conversations }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2>Conversaciones</h2>
        <button type="button">Nuevo</button>
      </div>
      <ul>
        {conversations.map((conversation, index) => (
          <li key={conversation.id} className={index === 0 ? "active" : ""}>
            <strong>{conversation.title}</strong>
            <span>{conversation.updatedAt}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
