export const calculatePercentage = (
  price: number,
  promotionPrice: number
): string => {
  let percentage: number;

  if (promotionPrice == undefined) return "0";

  percentage = ((price - promotionPrice) / price) * 100;

  return Math.floor(percentage).toFixed(0);
};
