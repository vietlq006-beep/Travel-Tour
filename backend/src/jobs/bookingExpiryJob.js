const bookingService = require('../services/bookingService');

const intervalMs = Math.max(15_000, Number(process.env.BOOKING_EXPIRY_JOB_INTERVAL_MS) || 60_000);

const startBookingExpiryJob = () => {
  let running = false;
  const execute = async () => {
    if (running) return;
    running = true;
    try {
      const expired = await bookingService.expirePendingBookings();
      if (expired > 0) console.log(`[BookingExpiry] Đã tự động hủy ${expired} đơn quá hạn.`);
    } catch (error) {
      console.error('[BookingExpiry] Không thể xử lý đơn quá hạn:', error.message);
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => void execute(), intervalMs);
  timer.unref();
  void execute();
  return () => clearInterval(timer);
};

module.exports = { startBookingExpiryJob };
