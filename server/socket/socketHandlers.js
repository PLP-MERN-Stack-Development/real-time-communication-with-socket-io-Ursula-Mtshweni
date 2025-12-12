const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

const connectedUsers = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins the application
    socket.on('user_joined', async (userData) => {
      try {
        const user = await User.findById(userData.userId);
        if (user) {
          connectedUsers.set(socket.id, {
            userId: user._id,
            username: user.username,
            socketId: socket.id
          });

          // Update user online status
          await User.findByIdAndUpdate(user._id, { 
            isOnline: true,
            lastSeen: new Date()
          });

          // Join user to their personal room for notifications
          socket.join(`user_${user._id}`);

          // Broadcast user online status
          socket.broadcast.emit('user_online', {
            userId: user._id,
            username: user.username
          });

          // Send current online users to the connected user
          const onlineUsers = Array.from(connectedUsers.values());
          socket.emit('online_users', onlineUsers);
        }
      } catch (error) {
        console.error('Error in user_joined:', error);
      }
    });

    // Join a chat room
    socket.on('join_room', async (roomData) => {
      try {
        const { roomId, userId } = roomData;
        socket.join(roomId);
        
        // Notify others in the room
        socket.to(roomId).emit('user_joined_room', {
          userId,
          roomId,
          timestamp: new Date()
        });

        // Load room messages
        const messages = await Message.find({ room: roomId })
          .populate('sender', 'username')
          .sort({ createdAt: 1 })
          .limit(50);

        socket.emit('room_messages', messages);
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });

    // Leave a chat room
    socket.on('leave_room', (roomData) => {
      const { roomId, userId } = roomData;
      socket.leave(roomId);
      
      socket.to(roomId).emit('user_left_room', {
        userId,
        roomId,
        timestamp: new Date()
      });
    });

    // Send message
    socket.on('send_message', async (messageData) => {
      try {
        const { roomId, senderId, content, messageType = 'text' } = messageData;
        
        // Save message to database
        const message = new Message({
          room: roomId,
          sender: senderId,
          content,
          messageType
        });

        await message.save();
        await message.populate('sender', 'username');

        // Send message to all users in the room
        io.to(roomId).emit('receive_message', message);

        // Send notification to users in the room who are not focused on the chat
        socket.to(roomId).emit('new_message_notification', {
          roomId,
          message: content,
          sender: message.sender.username,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Typing indicator
    socket.on('typing_start', (data) => {
      const { roomId, userId, username } = data;
      socket.to(roomId).emit('user_typing', {
        userId,
        username,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit('user_typing', {
        userId,
        isTyping: false
      });
    });

    // Message read receipt
    socket.on('message_read', async (data) => {
      try {
        const { messageId, userId } = data;
        
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          }
        });

        // Notify sender that message was read
        const message = await Message.findById(messageId).populate('sender');
        if (message) {
          io.to(`user_${message.sender._id}`).emit('message_read_receipt', {
            messageId,
            readBy: userId,
            readAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error updating read receipt:', error);
      }
    });

    // Create new room
    socket.on('create_room', async (roomData) => {
      try {
        const { name, description, isPrivate, createdBy } = roomData;
        
        const room = new Room({
          name,
          description,
          isPrivate,
          createdBy,
          members: [createdBy]
        });

        await room.save();
        io.emit('room_created', room);
      } catch (error) {
        console.error('Error creating room:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        const userData = connectedUsers.get(socket.id);
        if (userData) {
          // Update user offline status
          await User.findByIdAndUpdate(userData.userId, { 
            isOnline: false,
            lastSeen: new Date()
          });

          // Broadcast user offline status
          socket.broadcast.emit('user_offline', {
            userId: userData.userId
          });

          connectedUsers.delete(socket.id);
        }
        console.log('User disconnected:', socket.id);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};

module.exports = { setupSocketHandlers, connectedUsers };