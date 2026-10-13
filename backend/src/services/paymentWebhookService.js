const crypto = require('crypto');
const AppError = require('../utils/appError');

const verify = (req) => {
  const secret = process.env.BANK_WEBHOOK_SECRET;
  if (!secret) throw new AppError('Webhook ngân hàng chưa được cấu hình.', 503);
  const eventId = String(req.headers['x-webhook-id'] || '').trim();
  const timestamp = String(req.headers['x-webhook-timestamp'] || '').trim();
  const signature = String(req.headers['x-webhook-signature'] || '').replace(/^sha256=/i, '').trim().toLowerCase();
  if (!eventId || !timestamp || !signature) throw new AppError('Webhook thiếu header xác thực.', 401);
  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    throw new AppError('Webhook đã hết thời hạn xác thực.', 401);
  }
  const payload = `${timestamp}.${(req.rawBody || Buffer.from(JSON.stringify(req.body))).toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new AppError('Chữ ký webhook không hợp lệ.', 401);
  }
  return {
    source: String(req.body.source || 'BANK_WEBHOOK').slice(0, 40),
    externalTransactionId: String(req.body.externalTransactionId || eventId),
    amount: req.body.amount,
    transferContent: req.body.transferContent,
    transactionTime: req.body.transactionTime,
    rawData: req.body
  };
};

module.exports = { verify };
