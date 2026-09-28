const ROLES = require('../constants/roles');
const validateAdminUpdateUser = (req) => {
  const errors = [];
  if (req.body.role !== undefined && !Object.values(ROLES).includes(req.body.role)) errors.push({ field: 'role', message: 'Vai trò không hợp lệ' });
  if (req.body.isActive !== undefined && typeof req.body.isActive !== 'boolean') errors.push({ field: 'isActive', message: 'isActive phải là boolean' });
  if (req.body.role === undefined && req.body.isActive === undefined) errors.push({ field: 'body', message: 'Cần cung cấp role hoặc isActive' });
  return errors;
};
module.exports = { validateAdminUpdateUser };
