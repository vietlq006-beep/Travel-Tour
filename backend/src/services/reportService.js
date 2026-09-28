const ExcelJS = require('exceljs');
const { Op } = require('sequelize');
const { Booking, User, TourDeparture, Tour } = require('../models');

const safeCell = (value) => {
  const text = String(value ?? '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
};

class ReportService {
  async bookingWorkbook(query) {
    const where = {};
    if (query.fromDate || query.toDate) where.bookingDate = {
      ...(query.fromDate && { [Op.gte]: new Date(`${query.fromDate}T00:00:00`) }),
      ...(query.toDate && { [Op.lte]: new Date(`${query.toDate}T23:59:59`) })
    };
    if (query.status) where.status = query.status;
    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['fullName', 'email', 'phoneNumber'] },
        { model: TourDeparture, as: 'departure', attributes: ['startDate'], include: [{ model: Tour, as: 'tour', attributes: ['code', 'name'] }] }
      ],
      order: [['bookingDate', 'DESC']]
    });
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LeViet Travel API';
    const sheet = workbook.addWorksheet('Đơn đặt tour', { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = [
      ['Mã đơn', 22], ['Khách hàng', 24], ['Email', 28], ['Điện thoại', 16], ['Mã tour', 14],
      ['Tên tour', 34], ['Khởi hành', 14], ['Người lớn', 12], ['Trẻ em', 10],
      ['Tổng tiền', 16], ['Giảm giá', 16], ['Thành tiền', 16], ['Trạng thái', 20], ['Ngày đặt', 20]
    ].map(([header, width]) => ({ header, key: header, width }));
    bookings.forEach((booking) => sheet.addRow({
      'Mã đơn': safeCell(booking.bookingCode), 'Khách hàng': safeCell(booking.user.fullName), Email: safeCell(booking.user.email),
      'Điện thoại': safeCell(booking.user.phoneNumber), 'Mã tour': safeCell(booking.departure.tour.code), 'Tên tour': safeCell(booking.departure.tour.name),
      'Khởi hành': booking.departure.startDate, 'Người lớn': booking.numAdults, 'Trẻ em': booking.numChildren,
      'Tổng tiền': Number(booking.totalAmount), 'Giảm giá': Number(booking.discountAmount), 'Thành tiền': Number(booking.finalAmount),
      'Trạng thái': booking.status, 'Ngày đặt': booking.bookingDate
    }));
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    ['J', 'K', 'L'].forEach((column) => { sheet.getColumn(column).numFmt = '#,##0 [$₫-vi-VN]'; });
    sheet.autoFilter = { from: 'A1', to: 'N1' };
    return workbook.xlsx.writeBuffer();
  }
}
module.exports = new ReportService();
