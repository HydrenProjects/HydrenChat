// index.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const { sequelize, Chat } = require('./models/chat');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: 'public/avatars/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Sync the database
sequelize
  .sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

// Serve static files from the public directory
app.use(express.static('public'));

// Render the EJS template on root route
app.get('/', (req, res) => {
  res.render('index');
});

// Endpoint to handle avatar uploads
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  res.json({ avatarUrl: `/avatars/${req.file.filename}` });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected');

  // Load previous chat messages and send to the connected client
  Chat.findAll().then((messages) => {
    socket.emit('load_messages', messages);
  });

  // Listen for chat messages
  socket.on('chat_message', async (data) => {
    // Save the message to the database
    const newMessage = await Chat.create({
      username: data.username,
      message: data.message,
      avatar: data.avatar,
    });

    // Broadcast the message to all connected clients
    io.emit('chat_message', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
