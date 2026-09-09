const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'SevaConnect Backend API',
    version: '1.1.0',
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await initDb();
  } catch (error) {
    console.warn('[Server Warning] MySQL initialization warning:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  SevaConnect Backend API (V1.1 Foundation)`);
    console.log(`  Server running on: http://localhost:${PORT}`);
    console.log(`  REST APIs: /api/auth, /api/users, /api/admin`);
    console.log(`==================================================`);
  });
}

startServer();
