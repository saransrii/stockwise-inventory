const mongoose = require('mongoose');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let isConnected = false;

const startLocalMongodIfAvailable = async () => {
  const commonPaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
    'mongod'
  ];

  let mongodExe = null;
  for (const p of commonPaths) {
    if (p === 'mongod') {
      mongodExe = 'mongod';
      break;
    }
    if (fs.existsSync(p)) {
      mongodExe = p;
      break;
    }
  }

  if (!mongodExe) return false;

  const dataDir = path.join(__dirname, '..', 'data', 'db');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  try {
    console.log(`[Database] Attempting to launch local MongoDB instance (${mongodExe})...`);
    const proc = spawn(mongodExe, ['--dbpath', dataDir, '--port', '27017', '--bind_ip', '127.0.0.1'], {
      detached: true,
      stdio: 'ignore'
    });
    proc.unref();
    // Give it 2 seconds to bind
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return true;
  } catch (err) {
    console.warn('[Database] Could not spawn local mongod:', err.message);
    return false;
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockwise';

  const tryConnect = async (timeoutMs = 4000) => {
    return await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
    });
  };

  try {
    const conn = await tryConnect(3000);
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (initialErr) {
    console.warn(`[Database] Initial MongoDB connection to ${uri} failed: ${initialErr.message}`);

    // If local 127.0.0.1:27017, attempt to start local mongod automatically
    if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
      const spawned = await startLocalMongodIfAvailable();
      if (spawned) {
        try {
          const conn = await tryConnect(5000);
          isConnected = true;
          console.log(`[Database] MongoDB started and connected successfully: ${conn.connection.host}`);
          return conn;
        } catch (retryErr) {
          console.warn(`[Database] Retry connection failed: ${retryErr.message}`);
        }
      }
    }

    console.warn('[Database] Running with in-memory fallback state if MongoDB is not reachable.');
  }
};

const getStatus = () => ({
  connected: isConnected || mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || '127.0.0.1',
  name: mongoose.connection.name || 'stockwise'
});

module.exports = { connectDB, getStatus };
