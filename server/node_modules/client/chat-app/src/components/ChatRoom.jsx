import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';

const ChatRoom = ({ roomId, roomName }) => {
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const {
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping
  } = useChat(roomId);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim()) {
      sendMessage(message, user.id);
      setMessage('');
      stopTyping(user.id);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    if (e.target.value.trim()) {
      startTyping(user.id, user.username);
    } else {
      stopTyping(user.id);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>{roomName}</h3>
        <div className="online-indicator">● Live</div>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${msg.sender._id === user.id ? 'own-message' : 'other-message'}`}
          >
            <div className="message-header">
              <span className="sender-name">
                {msg.sender._id === user.id ? 'You' : msg.sender.username}
              </span>
              <span className="message-time">
                {formatTime(msg.createdAt)}
              </span>
            </div>
            <div className="message-content">
              {msg.content}
            </div>
            {msg.isEdited && (
              <div className="message-edited">(edited)</div>
            )}
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.map(user => user.username).join(', ')} 
            {typingUsers.length === 1 ? ' is' : ' are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" disabled={!message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;