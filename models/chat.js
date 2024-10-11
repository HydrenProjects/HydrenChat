// models/chat.js

const { Sequelize, DataTypes } = require('sequelize');

// Use dotenv to load environment variables (for MySQL)
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite:chat.db');

// Define the Chat model
const Chat = sequelize.define('Chat', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true, // Path to avatar image
  },
});

module.exports = { sequelize, Chat };
