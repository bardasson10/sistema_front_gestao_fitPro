
export const parseNumber = (value: any): number => {
  if (value === "" || value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  
  const normalized = String(value).replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};