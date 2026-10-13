const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const AppError = require('../utils/appError');

const uploadDirectory = path.join(__dirname, '../../uploads');
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  }
});

const fileFilter = (_req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(new AppError('Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP.', 422));
  }
  callback(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const statementMimeTypes = new Set([
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const uploadStatement = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!statementMimeTypes.has(file.mimetype) && !['.csv', '.xlsx'].includes(extension)) {
      return callback(new AppError('Chỉ chấp nhận sao kê CSV hoặc XLSX.', 422));
    }
    callback(null, true);
  }
}).single('statement');

const toUploadUrl = (file) => (file ? `/uploads/${file.filename}` : null);

module.exports = { uploadImage, uploadStatement, toUploadUrl };
