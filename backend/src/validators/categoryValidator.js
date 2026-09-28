const { isBlank } = require('./commonValidator');

const validateCategory = (req) => {
  const errors = [];
  const { name, description } = req.body;
  if (req.method === 'POST' && isBlank(name)) {
    errors.push({ field: 'name', message: 'Tên danh mục không được để trống' });
  }
  if (name !== undefined && (isBlank(name) || name.trim().length > 100)) {
    errors.push({ field: 'name', message: 'Tên danh mục phải có từ 1 đến 100 ký tự' });
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Mô tả phải là chuỗi' });
  }
  return errors;
};

module.exports = { validateCategory };
