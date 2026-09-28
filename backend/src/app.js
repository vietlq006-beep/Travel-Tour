const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const ApiResponse = require('./utils/apiResponse');

const app = express();

// ==========================================
// 1. SECURITY & LOGGING MIDDLEWARES
// ==========================================
app.use(helmet({
  crossOriginResourcePolicy: false // Cho phép load ảnh tĩnh từ domain khác
}));

app.use(cors({
  origin: '*', // Trong môi trường dev cho phép mọi origin, production sẽ siết theo .env
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. STATIC FILES (UPLOAD IMAGES)
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// 3. HEALTH CHECK & WELCOME ROUTE
// ==========================================
app.get('/api/health', (req, res) => {
  return ApiResponse.success(res, 'Hệ thống LeViet Travel API hoạt động bình thường', {
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==========================================
// 4. API ROUTES (SẼ MOUNT TỪNG MODULE)
// ==========================================
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ==========================================
// 5. 404 NOT FOUND HANDLER
// ==========================================
app.use('*', (req, res) => {
  return ApiResponse.error(res, `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`, [], 404);
});

// ==========================================
// 6. GLOBAL ERROR HANDLER
// ==========================================
app.use(errorHandler);

module.exports = app;
