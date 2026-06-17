export function getPagination(query, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, Number.parseInt(query._page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, defaultLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function setTotalCountHeader(res, total) {
  res.setHeader("X-Total-Count", total);
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");
}
