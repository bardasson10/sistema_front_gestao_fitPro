
export const parseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};