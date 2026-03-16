export const BASE_CURRENCY = "THB";

export const CURRENCY_OPTIONS = [
  { code: "THB", label: "THB ฿" },
  { code: "EUR", label: "EUR €" },
  { code: "USD", label: "USD $" },
  { code: "ILS", label: "ILS ₪" },
];

export function convertFromTHB(amount, currency, rates) {
  if (!amount) return 0;

  const rate = rates?.[currency] || 1;
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