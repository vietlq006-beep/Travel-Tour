const service = require('../services/reportService');
module.exports = {
  exportBookings: async (req, res) => {
    const buffer = await service.bookingWorkbook(req.query);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bao-cao-dat-tour-${date}.xlsx"`);
    return res.send(buffer);
  }
};
