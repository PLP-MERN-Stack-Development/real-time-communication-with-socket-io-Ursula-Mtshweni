import React from 'react';
import { useSocket } from '../context/SocketContext';

const OnlineUsers = () => {
  const { onlineUsers } = useSocket();

  return (
    <div className="online-users">
      <h4>Online Users ({onlineUsers.length})</h4>
      <div className="users-list">
        {onlineUsers.map(user => (
          <div key={user.userId} className="user-item">
            <span className="online-dot"></span>
            {user.username}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;