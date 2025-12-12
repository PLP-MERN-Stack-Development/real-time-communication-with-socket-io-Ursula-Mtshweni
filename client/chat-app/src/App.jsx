import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ChatRoom from './components/ChatRoom';
import OnlineUsers from './components/OnlineUsers';
import './App.css';

const AppContent = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [currentRoom, setCurrentRoom] = useState('general');

  if (!isAuthenticated) {
    return (
      <div className="app auth-page">
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="app chat-app">
      <header className="app-header">
        <h1>Socket.io Chat</h1>
        <div className="user-info">
          <span>Welcome, {user.username}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <div className="room-list">
            <h3>Chat Rooms</h3>
            <button 
              className={`room-btn ${currentRoom === 'general' ? 'active' : ''}`}
              onClick={() => setCurrentRoom('general')}
            >
              # General
            </button>
            <button 
              className={`room-btn ${currentRoom === 'random' ? 'active' : ''}`}
              onClick={() => setCurrentRoom('random')}
            >
              # Random
            </button>
            <button 
              className={`room-btn ${currentRoom === 'tech' ? 'active' : ''}`}
              onClick={() => setCurrentRoom('tech')}
            >
              # Tech Talk
            </button>
          </div>
          
          <OnlineUsers />
        </aside>

        <main className="chat-main">
          <ChatRoom 
            roomId={currentRoom} 
            roomName={currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1)}
          />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;