const DEFAULT_BANK_ID = '970407';
const DEFAULT_BANK_NAME = 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)';
const DEFAULT_ACCOUNT_NO = '9330302005';
const DEFAULT_ACCOUNT_NAME = 'LE QUOC VIET';
const DEFAULT_ACCOUNT_DISPLAY_NAME = 'Lê Quốc Việt';

const compactTransferContent = (bookingCode) => {
  const normalizedCode = String(bookingCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `LVT ${normalizedCode}`.slice(0, 25);
};

const createVietQrData = (booking, payment) => {
  const bankId = process.env.VIETQR_BANK_ID || DEFAULT_BANK_ID;
  const bankName = process.env.VIETQR_BANK_NAME || DEFAULT_BANK_NAME;
  const accountNo = process.env.VIETQR_ACCOUNT_NO || DEFAULT_ACCOUNT_NO;
  const accountName = process.env.VIETQR_ACCOUNT_NAME || DEFAULT_ACCOUNT_NAME;
  const accountDisplayName = process.env.VIETQR_ACCOUNT_DISPLAY_NAME || DEFAULT_ACCOUNT_DISPLAY_NAME;
  const amount = Math.round(Number(payment.amount));
  const transferContent = compactTransferContent(booking.bookingCode);
  const query = new URLSearchParams({
    amount: String(amount),
    addInfo: transferContent,
    accountName
  });

  return {
    provider: 'VIETQR',
    bankId,
    bankName,
    accountNo,
    accountName: accountDisplayName,
    amount,
    transferContent,
    qrImageUrl: `https://img.vietqr.io/image/${encodeURIComponent(bankId)}-${encodeURIComponent(accountNo)}-print.png?${query.toString()}`
  };
};

module.exports = { createVietQrData, compactTransferContent };
