const crypto = require('crypto');

class NotificationService {
  async dispatch(message) {
    const url = process.env.NOTIFICATION_WEBHOOK_URL;
    if (!url) return { delivered: false, provider: 'development' };
    const body = JSON.stringify(message);
    const secret = process.env.NOTIFICATION_WEBHOOK_SECRET || '';
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-leviet-signature': `sha256=${signature}` },
      body,
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`Notification webhook trả HTTP ${response.status}`);
    return { delivered: true, provider: 'webhook' };
  }
}

module.exports = new NotificationService();
