import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../socket/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const socketInstance = socketService.connect();
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
        socketInstance.emit('user_joined', { userId: user.id, username: user.username });
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      socketInstance.on('user_online', (userData) => {
        setOnlineUsers(prev => [...prev, userData]);
      });

      socketInstance.on('user_offline', (data) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      return () => {
        socketInstance.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated, user]);

  const value = {
    socket,
    isConnected,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};