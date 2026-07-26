const sanitizeValue = (value) => {
  if (typeof value === 'string') return value.replace(/<[^>]*>/g, '').trim();
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((safe, [key, child]) => {
      if (!key.startsWith('$') && !key.includes('.')) safe[key] = sanitizeValue(child);
      return safe;
    }, {});
  }
  return value;
};

export const sanitizeRequest = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') req.body = sanitizeValue(req.body);
  next();
};
