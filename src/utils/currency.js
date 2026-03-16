export const BASE_CURRENCY = "THB";

export const CURRENCY_OPTIONS = [
  { code: "THB", label: "THB ฿" },
  { code: "EUR", label: "EUR €" },
  { code: "USD", label: "USD $" },
  { code: "ILS", label: "ILS ₪" },
];

export const EXCHANGE_RATES = {
  THB: 1,
  EUR: 0.026,
  USD: 0.029,
  ILS: 0.107,
};

export function convertFromTHB(amount, targetCurrency) {
  if (amount == null || Number.isNaN(amount)) return 0;

  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return amount * rate;
}

export function getCurrencySymbol(currency) {
  switch (currency) {
    case "THB":
      return "฿";
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "ILS":
      return "₪";
    default:
      return "";
  }
}