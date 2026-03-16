import { formatCurrency } from "../utils/formatters";

export default function LongTermView({
  customPrices,
  calculatedData,
  selectedCurrency,
  convertMoney,
  onHighSeasonMonthlyPriceChange,
  onLowSeasonMonthlyPriceChange,
  onBack,
}) {
  return (
    <>
      <div className="details-container">
        <h3>Long-Term Calculations</h3>

        <div className="details-box">
          <strong>High Season Monthly Price:</strong>
          <input
            className="price-input"
            type="number"
            value={customPrices.highSeasonMonthlyPrice}
            onChange={(e) =>
              onHighSeasonMonthlyPriceChange(parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="details-box">
          <strong>Low Season Monthly Price:</strong>
          <input
            className="price-input"
            type="number"
            value={customPrices.lowSeasonMonthlyPrice}
            onChange={(e) =>
              onLowSeasonMonthlyPriceChange(parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="details-box">
          <strong>Monthly Management Fee:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.longTermMonthlyExpenses),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="details-box">
          <strong>Total Annual Income:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.longTermAnnualIncome),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="details-box">
          <strong>Total Annual Expenses:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.longTermMonthlyExpenses * 12),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="details-box">
          <strong>Total Annual Profit:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.longTermAnnualProfit),
              selectedCurrency
            )}
          </span>
        </div>
      </div>

      <button onClick={onBack}>Back</button>
    </>
  );
}