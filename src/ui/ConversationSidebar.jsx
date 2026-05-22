import { formatConversationDate } from "../lib/format-date";

export function ConversationSidebar({
  conversations,
  activeId,
  collapsed,
  mobileOpen,
  loading,
  onSelect,
  onNew,
  onDelete,
  onToggleCollapse,
  onCloseMobile
}) {
  return (
    <>
      <button
        type="button"
        className={`sidebar-overlay ${mobileOpen ? "is-visible" : ""}`}
        aria-label="Cerrar historial de conversaciones"
        onClick={onCloseMobile}
      />
      <aside
        className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobile-open" : ""}`}
        aria-label="Historial de conversaciones"
      >
        <div className="sidebar-head">
          <div className="sidebar-head-main">
            <button
              type="button"
              className="sidebar-icon-button sidebar-collapse-toggle"
              aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
              onClick={onToggleCollapse}
            >
              {collapsed ? "»" : "«"}
            </button>
            {!collapsed ? <h2>Conversaciones</h2> : null}
          </div>
          <button
            type="button"
            className="sidebar-new-button"
            onClick={onNew}
            title="Nuevo chat"
            aria-label="Crear nuevo chat"
          >
            {collapsed ? "+" : "Nuevo chat"}
          </button>
          {mobileOpen ? (
            <button
              type="button"
              className="sidebar-icon-button sidebar-mobile-close"
              aria-label="Cerrar historial"
              onClick={onCloseMobile}
            >
              ×
            </button>
          ) : null}
        </div>

        <div className="sidebar-list" role="list">
          {loading ? (
            <p className="sidebar-empty">Cargando historial...</p>
          ) : conversations.length === 0 ? (
            <div className="sidebar-empty">
              <p>No hay conversaciones.</p>
              <button type="button" onClick={onNew}>
                Crear primer chat
              </button>
            </div>
          ) : (
            <ul>
              {conversations.map((conversation) => {
                const isActive = conversation.id === activeId;
                const initial = (conversation.title || "?").trim().charAt(0).toUpperCase() || "?";

                return (
                  <li key={conversation.id} className={isActive ? "active" : ""} role="listitem">
                    <button
                      type="button"
                      className="sidebar-item-button"
                      title={conversation.title}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => onSelect(conversation.id)}
                    >
                      {collapsed ? (
                        <span className="sidebar-item-initial" aria-hidden="true">
                          {initial}
                        </span>
                      ) : (
                        <>
                          <strong>{conversation.title}</strong>
                          <span>{formatConversationDate(conversation.updatedAt)}</span>
                        </>
                      )}
                    </button>
                    {!collapsed ? (
                      <button
                        type="button"
                        className="sidebar-delete-button"
                        aria-label={`Eliminar ${conversation.title}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(conversation.id);
                        }}
                      >
                        ×
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
