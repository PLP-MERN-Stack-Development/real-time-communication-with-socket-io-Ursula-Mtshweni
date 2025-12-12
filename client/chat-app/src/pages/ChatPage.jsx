import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import RoomList from '../components/RoomList.jsx';
import ChatRoom from '../components/ChatRoom.jsx';
import './ChatPage.css';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState([
    { id: 'general', name: 'General Chat', memberCount: 15 },
    { id: 'random', name: 'Random', memberCount: 8 },
    { id: 'help', name: 'Help & Support', memberCount: 3 }
  ]);

  const handleCreateRoom = (roomName) => {
    const newRoom = {
      id: roomName.toLowerCase().replace(/\s+/g, '-'),
      name: roomName,
      memberCount: 1
    };
    setRooms(prev => [...prev, newRoom]);
    setCurrentRoom(newRoom.id);
  };

  const currentRoomData = rooms.find(room => room.id === currentRoom);

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Chat App</h2>
          <div className="user-info">
            <span>{user?.username}</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
        
        <RoomList
          rooms={rooms}
          currentRoom={currentRoom}
          onRoomSelect={setCurrentRoom}
          onCreateRoom={handleCreateRoom}
        />
      </div>

      <div className="chat-main">
        {currentRoomData ? (
          <ChatRoom
            roomId={currentRoom}
            roomName={currentRoomData.name}
          />
        ) : (
          <div className="no-room-selected">
            <h3>Select a room to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;