export const formatNumberToBRL = (value: number | string) => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}