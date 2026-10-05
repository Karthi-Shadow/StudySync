const mongoose = require('mongoose');

// In-Memory Storage Fallback if MongoDB daemon is not running
const inMemoryStore = {
  users: [],
  subjects: [],
  tasks: [],
  sessions: []
};

let isConnectedToMongo = false;

const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Study_Planner';
  try {
    // Attempt Mongoose connection with short timeout so it doesn't block startup
    mongoose.set('strictQuery', false);
    await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 2500
    });
    isConnectedToMongo = true;
    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host}`);
  } catch (error) {
    isConnectedToMongo = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB (${error.message}).`);
    console.log(`[Fallback DB] Operating in high-speed In-Memory Mode. All API features active!`);
  }
};

const getDBState = () => ({
  isConnectedToMongo,
  inMemoryStore
});

module.exports = { connectDB, getDBState, inMemoryStore };
