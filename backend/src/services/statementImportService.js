const ExcelJS = require('exceljs');
const { Readable } = require('stream');
const path = require('path');
const AppError = require('../utils/appError');

const normalizeHeader = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]/g, '');

const HEADER_ALIASES = {
  externalTransactionId: ['transactionid', 'magiaodich', 'referenceno', 'reference', 'matransaction', 'idgiaodich'],
  amount: ['amount', 'sotien', 'credit', 'co', 'tienvao', 'transactionamount'],
  transferContent: ['transfercontent', 'noidung', 'description', 'remark', 'content', 'diengiai'],
  transactionTime: ['transactiontime', 'thoigian', 'date', 'datetime', 'ngaygiaodich', 'transactiondate']
};

const readCell = (cell) => {
  const value = cell?.value;
  if (value && typeof value === 'object') {
    if (value.result !== undefined) return value.result;
    if (value.text !== undefined) return value.text;
    if (Array.isArray(value.richText)) return value.richText.map((item) => item.text).join('');
  }
  return value;
};

const mapSheet = (sheet) => {
  const headerRow = sheet.getRow(1);
  const columns = {};
  headerRow.eachCell((cell, columnNumber) => {
    const header = normalizeHeader(readCell(cell));
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(header)) columns[field] = columnNumber;
    }
  });
  for (const required of ['externalTransactionId', 'amount', 'transferContent']) {
    if (!columns[required]) throw new AppError(`Sao kê thiếu cột ${required}.`, 422);
  }
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const externalTransactionId = String(readCell(row.getCell(columns.externalTransactionId)) || '').trim();
    const amountText = String(readCell(row.getCell(columns.amount)) || '').replace(/[^0-9.-]/g, '');
    const transferContent = String(readCell(row.getCell(columns.transferContent)) || '').trim();
    const transactionTimeValue = columns.transactionTime ? readCell(row.getCell(columns.transactionTime)) : null;
    if (!externalTransactionId && !amountText && !transferContent) return;
    rows.push({
      externalTransactionId,
      amount: Number(amountText),
      transferContent,
      transactionTime: transactionTimeValue ? new Date(transactionTimeValue) : null,
      rawData: { rowNumber }
    });
  });
  if (!rows.length) throw new AppError('Sao kê không có giao dịch để đối soát.', 422);
  if (rows.length > 5000) throw new AppError('Mỗi lần chỉ nhập tối đa 5.000 giao dịch.', 422);
  return rows;
};

const parseStatement = async (file) => {
  if (!file?.buffer) throw new AppError('Vui lòng tải lên tệp sao kê.', 422);
  const workbook = new ExcelJS.Workbook();
  if (path.extname(file.originalname).toLowerCase() === '.csv') {
    await workbook.csv.read(Readable.from(file.buffer.toString('utf8')));
  } else {
    await workbook.xlsx.load(file.buffer);
  }
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new AppError('Không đọc được sheet sao kê.', 422);
  return mapSheet(sheet);
};

module.exports = { parseStatement, normalizeHeader };
