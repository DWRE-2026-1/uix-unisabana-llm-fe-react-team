import React from 'react';

const Sidebar = () => {
  return (
    <aside className="app-sidebar">
      <button className="new-chat-btn">+ Nueva Conversación</button>
      
      <div className="chat-history-list">
        <p className="history-title">Historial de Chats</p>
        {/* Aquí luego mapearás las conversaciones de la base de datos */}
        <ul className="history-items">
          <li className="history-item active">Chat de prueba Ollama</li>
          <li className="history-item">Proyecto de Grado TI</li>
          <li className="history-item">Análisis de vulnerabilidades</li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;