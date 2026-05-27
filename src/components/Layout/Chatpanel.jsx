import React, { useEffect, useRef, useState } from 'react';

const ChatPanel = () => {
  // Simulamos algunos mensajes para que veas el diseño
  const [messages, setMessages] = useState([
    { id: 1, text: "Hola, soy UIX Unisabana LLM. ¿En qué te puedo ayudar hoy?", sender: "bot" }
  ]);
  
  // Referencia al final del contenedor de mensajes
  const messagesEndRef = useRef(null);

  // Función para hacer scroll hacia abajo automáticamente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cada vez que el array de 'messages' cambie, se ejecuta el scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulación de envío de mensaje (esto luego se conectará a tu backend)
  const handleSendMessage = (e) => {
    e.preventDefault();
    const input = e.target.elements.messageInput.value;
    if (!input.trim()) return;

    setMessages([...messages, { id: Date.now(), text: input, sender: "user" }]);
    e.target.reset();
  };

  return (
    <main className="chat-panel">
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {/* Este div invisible es el ancla para el scroll automático */}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <form onSubmit={handleSendMessage} className="message-form">
          <input 
            type="text" 
            name="messageInput"
            placeholder="Escribe tu mensaje a la IA..." 
            className="message-input"
            autoComplete="off"
          />
          <button type="submit" className="send-btn">Enviar</button>
        </form>
      </div>
    </main>
  );
};

export default ChatPanel;