export const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);

export const formatConsumption = (value: number) => `${formatNumber(value, 1)} m3`;
