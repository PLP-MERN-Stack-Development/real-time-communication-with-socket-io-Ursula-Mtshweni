import React, { useState } from 'react';

const RoomList = ({ rooms, currentRoom, onRoomSelect, onCreateRoom }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim());
      setNewRoomName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Chat Rooms</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-room-btn"
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="create-room-form">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name"
            required
          />
          <div className="form-actions">
            <button type="submit">Create</button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rooms">
        {rooms.map(room => (
          <div
            key={room.id}
            className={`room-item ${currentRoom === room.id ? 'active' : ''}`}
            onClick={() => onRoomSelect(room.id)}
          >
            <span className="room-name">{room.name}</span>
            <span className="room-members">{room.memberCount} members</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;