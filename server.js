require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db/database');

const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 6687;
app.use(morgan('combined'));

// Security Middlewares
app.set('trust proxy', 1); // Fix for Express 5 + express-rate-limit 8 behind proxy
app.use(helmet({ contentSecurityPolicy: false })); // Disabled CSP to prevent breaking inline styles/scripts
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: { error: '请求过于频繁，请稍后再试' },
  validate: false // Disable all validations to prevent startup crashes
});



app.use(cors());
app.use(express.json({ limit: '100kb' })); // Q1: JSON Size Limit
app.use(express.static(path.join(__dirname, 'public')));

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const diaryRoutes = require('./routes/diary');
const storiesRoutes = require('./routes/stories');
const activitiesRoutes = require('./routes/activities');
const communityRoutes = require('./routes/community');
const gameRoutes = require('./routes/game');
const telemetryRoutes = require('./routes/telemetry');
const socialRoutes = require('./routes/social');
const toolsRoutes = require('./routes/tools');
const adminRoutes = require('./routes/admin'); // V3.0 Admin

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/admin', adminRoutes); // V3.0 Admin

// Fallback for SPA/static routing if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// B3: Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: '服务器内部错误' });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


// Start server
app.listen(PORT, () => {
  console.log(`Landing-C V3.0 Production Server running on port ${PORT}`);
});
