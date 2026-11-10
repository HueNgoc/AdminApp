require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDatabase = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : true;

function isPrivateNetworkHost(hostname) {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) return true;
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return parts[0] === 10
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168);
}

function allowOrigin(origin, callback) {
  if (!origin || allowedOrigins === true || allowedOrigins.includes(origin)) return callback(null, true);
  if (process.env.NODE_ENV !== 'production') {
    try {
      const parsedOrigin = new URL(origin);
      if (parsedOrigin.protocol === 'http:' && parsedOrigin.port === '8081' && isPrivateNetworkHost(parsedOrigin.hostname)) {
        return callback(null, true);
      }
    } catch {}
  }
  return callback(null, false);
}

app.use(cors({ origin: allowOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((error, _req, res, _next) => {
  if (error.name === 'MulterError') {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : error.message;
    return res.status(400).json({ message });
  }
  if (error.code === 'INVALID_IMAGE_TYPE') {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) return res.status(409).json({ message: 'That email is already registered.' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid user ID.' });
  console.error(error);
  return res.status(500).json({ message: 'Internal server error.' });
});

async function start() {
  await connectDatabase();
  app.listen(port, '0.0.0.0', () => console.log(`API listening on port ${port}.`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Could not start backend:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
