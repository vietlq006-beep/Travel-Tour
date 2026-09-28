const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getPagination = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );

  return { page, limit, offset: (page - 1) * limit };
};

const toPaginatedResult = ({ rows, count }, page, limit) => ({
  items: rows,
  pagination: {
    page,
    limit,
    totalItems: count,
    totalPages: Math.ceil(count / limit)
  }
});

module.exports = { getPagination, toPaginatedResult };
