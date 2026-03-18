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
  const revenue = convertMoney(calculatedData.longTermAnnualIncome);
  const expenses = convertMoney(calculatedData.longTermMonthlyExpenses * 12);
  const profit = convertMoney(calculatedData.longTermAnnualProfit);
  const monthlyManagement = convertMoney(calculatedData.longTermMonthlyExpenses);

  return (
    <>
      <div className="calc-hero">
        <div className="calc-hero-title">Long-Term Investment</div>
        <div className="calc-metric-grid">
          <div className="calc-metric-card">
            <div className="calc-metric-label">Revenue</div>
            <div className="calc-metric-value">
              {formatCurrency(revenue, selectedCurrency)}
            </div>
          </div>

          <div className="calc-metric-card">
            <div className="calc-metric-label">Expenses</div>
            <div className="calc-metric-value">
              {formatCurrency(expenses, selectedCurrency)}
            </div>
          </div>

          <div className="calc-metric-card calc-metric-card-primary">
            <div className="calc-metric-label">Net Profit</div>
            <div className="calc-metric-value">
              {formatCurrency(profit, selectedCurrency)}
            </div>
          </div>
        </div>
      </div>

      <div className="calc-grid">
        <div className="calc-panel">
          <div className="calc-section-title">Revenue Inputs</div>

          <div className="details-box">
            <strong>High Season Monthly</strong>
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
            <strong>Low Season Monthly</strong>
            <input
              className="price-input"
              type="number"
              value={customPrices.lowSeasonMonthlyPrice}
              onChange={(e) =>
                onLowSeasonMonthlyPriceChange(parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>

        <div className="calc-panel">
          <div className="calc-section-title">Expense Summary</div>

          <div className="details-box">
            <strong>Monthly Management Fee</strong>
            <span>{formatCurrency(monthlyManagement, selectedCurrency)}</span>
          </div>

          <div className="details-box">
            <strong>Total Annual Expenses</strong>
            <span>{formatCurrency(expenses, selectedCurrency)}</span>
          </div>
        </div>
      </div>

      <button onClick={onBack}>Back</button>
    </>
  );
}