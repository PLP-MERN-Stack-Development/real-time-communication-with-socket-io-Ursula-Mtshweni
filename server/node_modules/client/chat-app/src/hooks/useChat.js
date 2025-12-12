import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export const useChat = (roomId) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room
    socket.emit('join_room', { roomId });

    // Listen for messages
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for room messages
    socket.on('room_messages', (roomMessages) => {
      setMessages(roomMessages);
    });

    // Listen for typing indicators
    socket.on('user_typing', (data) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return [...prev.filter(u => u.userId !== data.userId), data];
        } else {
          return prev.filter(u => u.userId !== data.userId);
        }
      });
    });

    // Listen for notifications
    socket.on('new_message_notification', (notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('receive_message');
      socket.off('room_messages');
      socket.off('user_typing');
      socket.off('new_message_notification');
    };
  }, [socket, roomId]);

  const sendMessage = (content, senderId, messageType = 'text') => {
    if (!socket || !content.trim()) return;

    socket.emit('send_message', {
      roomId,
      senderId,
      content: content.trim(),
      messageType
    });
  };

  const startTyping = (userId, username) => {
    if (!socket) return;

    socket.emit('typing_start', { roomId, userId, username });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(userId);
    }, 3000);
  };

  const stopTyping = (userId) => {
    if (!socket) return;

    socket.emit('typing_stop', { roomId, userId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const markAsRead = (messageId, userId) => {
    if (!socket) return;

    socket.emit('message_read', { messageId, userId });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    messages,
    typingUsers,
    notifications,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    clearNotifications,
    isConnected
  };
};