/**
 * Standard Currency Formatter for Nicaragua Córdoba (C$)
 */
export const formatCurrency = (amount: number): string => {
  const formatted = amount.toLocaleString('es-NI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `C$ ${formatted}`;
};
