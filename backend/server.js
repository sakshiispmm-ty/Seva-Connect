const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are reliably loaded from backend/.env regardless of CWD
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { initDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const donationRoutes = require('./routes/donationRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const assistanceRequestRoutes = require('./routes/assistanceRequestRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const donorRoutes = require('./routes/donorRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

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
    version: '2.2.0',
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/assistance-requests', assistanceRequestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/reports', reportRoutes);

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
