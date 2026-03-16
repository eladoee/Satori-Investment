import { CURRENCY_OPTIONS } from "../utils/currency";

export default function CurrencySelector({
  selectedCurrency,
  onChange,
}) {
  return (
    <div className="location-selection">
      <label htmlFor="currency-select">Currency: </label>
      <select
        id="currency-select"
        value={selectedCurrency}
        onChange={onChange}
      >
        {CURRENCY_OPTIONS.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.label}
          </option>
        ))}
      </select>
    </div>
  );
}