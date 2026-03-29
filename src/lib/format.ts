export const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);

/** Türkçe yerelde ondalık ayırıcı virgül; tam 2 basamak. */
export const formatTwoDecimals = (value: number) => formatNumber(value, 2);

export const formatConsumption = (value: number) => `${formatNumber(value, 1)} m3`;
