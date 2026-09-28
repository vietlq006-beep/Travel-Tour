const crypto = require('crypto');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
const ApiResponse = require('./utils/apiResponse');

const app = express();
const configuredOrigins = [process.env.CLIENT_ADMIN_URL, process.env.CLIENT_CUSTOMER_URL].filter(Boolean);

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || process.env.NODE_ENV !== 'production' || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Nguồn gửi yêu cầu không được CORS cho phép.'));
  },
  credentials: true
}));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => ApiResponse.success(
  res,
  'Hệ thống LeViet Travel API hoạt động bình thường',
  { timestamp: new Date().toISOString(), uptime: process.uptime() }
));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/tour-guides', require('./routes/tourGuideRoutes'));
app.use('/api/tours/:tourId/itineraries', require('./routes/itineraryRoutes'));
app.use('/api/tours', require('./routes/tourRoutes'));
app.use('/api/departures', require('./routes/departureRoutes'));
app.use('/api/vouchers', require('./routes/voucherRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use('*', (req, res) => ApiResponse.error(
  res,
  `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`,
  [],
  404
));

app.use(errorHandler);

module.exports = app;
