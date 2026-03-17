export function clamp(value, min, max) {
  if (value === null || value === undefined || Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function safeNumber(value, fallback = 0) {
  const n = parseFloat(value);
  return Number.isNaN(n) ? fallback : n;
}

export function safePrice(value) {
  return clamp(safeNumber(value, 0), 0, 100000000);
}

export function safeOccupancy(value) {
  return clamp(safeNumber(value, 0), 0, 1);
}