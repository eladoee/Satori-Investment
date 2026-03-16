import { getCurrencySymbol } from "./currency";

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value) {
  return (value * 100).toFixed(2) + "%";
}

export function formatCurrency(value, currency = "THB") {
  return `${getCurrencySymbol(currency)}${formatNumber(value)}`;
}