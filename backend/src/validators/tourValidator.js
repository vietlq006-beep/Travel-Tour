const { isBlank, isPositiveInteger, isNonNegativeInteger } = require('./commonValidator');

const parseDestinationIds = (value) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value === 'string') {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(Number) : null; } catch { return value.split(',').map(Number); }
  }
  return null;
};

const isSupportedVideoUrl = (value) => {
  if (isBlank(value)) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return url.protocol === 'https:' && [
      'youtube.com',
      'm.youtube.com',
      'youtu.be',
      'youtube-nocookie.com'
    ].includes(host);
  } catch {
    return false;
  }
};

const validateTour = (req) => {
  const errors = [];
  const { code, name, categoryId, durationDays, durationNights, thumbnail, videoUrl, depositPercent } = req.body;
  if (req.method === 'POST' && isBlank(code)) errors.push({ field: 'code', message: 'Mã tour là bắt buộc' });
  if (code !== undefined && !/^[A-Za-z0-9_-]{3,30}$/.test(code)) errors.push({ field: 'code', message: 'Mã tour gồm 3-30 chữ, số, gạch ngang hoặc gạch dưới' });
  if (req.method === 'POST' && isBlank(name)) errors.push({ field: 'name', message: 'Tên tour là bắt buộc' });
  if (req.method === 'POST' && !isPositiveInteger(categoryId)) errors.push({ field: 'categoryId', message: 'Danh mục hợp lệ là bắt buộc' });
  if ((req.method === 'POST' || durationDays !== undefined) && !isPositiveInteger(durationDays)) errors.push({ field: 'durationDays', message: 'Số ngày phải là số nguyên dương' });
  if ((req.method === 'POST' || durationNights !== undefined) && !isNonNegativeInteger(durationNights)) errors.push({ field: 'durationNights', message: 'Số đêm phải là số nguyên không âm' });
  if (req.method === 'POST' && !req.files?.thumbnail?.[0] && isBlank(thumbnail)) errors.push({ field: 'thumbnail', message: 'Ảnh đại diện tour là bắt buộc' });
  if (videoUrl !== undefined && !isSupportedVideoUrl(videoUrl)) {
    errors.push({ field: 'videoUrl', message: 'Video phải là URL HTTPS hợp lệ từ YouTube' });
  }
  if (depositPercent !== undefined && (!Number.isFinite(Number(depositPercent)) || Number(depositPercent) < 0 || Number(depositPercent) > 100)) {
    errors.push({ field: 'depositPercent', message: 'Tỷ lệ đặt cọc phải từ 0 đến 100' });
  }
  if (req.body.pickupPoints !== undefined && typeof req.body.pickupPoints === 'string') {
    try {
      const parsed = JSON.parse(req.body.pickupPoints);
      req.body.pickupPoints = Array.isArray(parsed) ? parsed : req.body.pickupPoints.split('\n').map((item) => item.trim()).filter(Boolean);
    } catch {
      req.body.pickupPoints = req.body.pickupPoints.split('\n').map((item) => item.trim()).filter(Boolean);
    }
  }
  const destinationIds = parseDestinationIds(req.body.destinationIds);
  if (destinationIds !== undefined && (!destinationIds || destinationIds.some((id) => !isPositiveInteger(id)))) {
    errors.push({ field: 'destinationIds', message: 'Danh sách điểm đến không hợp lệ' });
  } else if (destinationIds !== undefined) {
    req.body.destinationIds = [...new Set(destinationIds)];
  }
  return errors;
};

module.exports = { validateTour, parseDestinationIds, isSupportedVideoUrl };
