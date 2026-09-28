const crypto = require('crypto');
const AppError = require('../utils/appError');

const formatVnPayDate = (date) => {
  const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vn.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
};

const sortedQuery = (params) => new URLSearchParams(
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => [key, String(value)])
).toString();

const sign = (query) => crypto
  .createHmac('sha512', process.env.VNP_HASH_SECRET || '')
  .update(query, 'utf8')
  .digest('hex');

const assertConfigured = () => {
  if (!process.env.VNP_TMN_CODE || !process.env.VNP_HASH_SECRET || !process.env.VNP_URL || !process.env.VNP_RETURN_URL) {
    throw new AppError('Cổng VNPAY chưa được cấu hình đầy đủ.', 503);
  }
};

const createPaymentUrl = ({ paymentId, amount, ipAddress, locale = 'vn', bankCode }) => {
  assertConfigured();
  const now = new Date();
  const expire = new Date(now.getTime() + 15 * 60 * 1000);
  const params = {
    vnp_Version: '2.1.0', vnp_Command: 'pay', vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_Amount: Math.round(Number(amount) * 100), vnp_CreateDate: formatVnPayDate(now),
    vnp_CurrCode: 'VND', vnp_IpAddr: ipAddress || '127.0.0.1', vnp_Locale: locale,
    vnp_OrderInfo: `Thanh toan don LeViet Travel ${paymentId}`, vnp_OrderType: 'other',
    vnp_ReturnUrl: process.env.VNP_RETURN_URL, vnp_ExpireDate: formatVnPayDate(expire),
    vnp_TxnRef: String(paymentId), ...(bankCode && { vnp_BankCode: bankCode })
  };
  const query = sortedQuery(params);
  return `${process.env.VNP_URL}?${query}&vnp_SecureHash=${sign(query)}`;
};

const verifyCallback = (rawParams) => {
  assertConfigured();
  const params = { ...rawParams };
  const received = String(params.vnp_SecureHash || '').toLowerCase();
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;
  const expected = sign(sortedQuery(params));
  const valid = received.length === expected.length
    && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  return { valid, params };
};

module.exports = { createPaymentUrl, verifyCallback, formatVnPayDate, sortedQuery };
