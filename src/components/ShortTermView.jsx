import { formatCurrency } from "../utils/formatters";

export default function ShortTermView({
  customPrices,
  calculatedData,
  selectedCurrency,
  convertMoney,
  highSeasonOccupancy,
  lowSeasonOccupancy,
  onHighSeasonNightlyPriceChange,
  onLowSeasonNightlyPriceChange,
  onHighSeasonOccupancyChange,
  onLowSeasonOccupancyChange,
  onBack,
}) {
  const revenue = convertMoney(calculatedData.shortTermAnnualIncome);
  const expenses = convertMoney(calculatedData.shortTermMonthlyExpenses * 12);
  const profit = convertMoney(calculatedData.shortTermAnnualProfit);

  return (
    <>
      <div className="calc-hero">
        <div className="calc-hero-title">Short-Term Investment</div>
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
            <strong>High Season Nightly</strong>
            <input
              className="price-input"
              type="number"
              value={customPrices.highSeasonNightlyPrice}
              onChange={(e) =>
                onHighSeasonNightlyPriceChange(parseFloat(e.target.value) || 0)
              }
            />
          </div>

          <div className="details-box">
            <strong>Low Season Nightly</strong>
            <input
              className="price-input"
              type="number"
              value={customPrices.lowSeasonNightlyPrice}
              onChange={(e) =>
                onLowSeasonNightlyPriceChange(parseFloat(e.target.value) || 0)
              }
            />
          </div>

          <div className="occupancy-panel">
            <div className="occupancy-field">
              <label>High Season Occupancy</label>
              <input
                className="occupancy-input"
                type="number"
                value={highSeasonOccupancy}
                min="0"
                max="1"
                step="0.01"
                onChange={(e) =>
                  onHighSeasonOccupancyChange(parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div className="occupancy-field">
              <label>Low Season Occupancy</label>
              <input
                className="occupancy-input"
                type="number"
                value={lowSeasonOccupancy}
                min="0"
                max="1"
                step="0.01"
                onChange={(e) =>
                  onLowSeasonOccupancyChange(parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </div>

        <div className="calc-panel">
          <div className="calc-section-title">Expense Breakdown</div>

          <div className="details-box">
            <strong>Management Fee</strong>
            <span>
              {formatCurrency(
                convertMoney(calculatedData.shortTermManagementFee),
                selectedCurrency
              )}
            </span>
          </div>

          <div className="details-box">
            <strong>Water</strong>
            <span>
              {formatCurrency(
                convertMoney(calculatedData.houseTypeData.expenses.water),
                selectedCurrency
              )}
            </span>
          </div>

          <div className="details-box">
            <strong>Electricity</strong>
            <span>
              {formatCurrency(
                convertMoney(calculatedData.houseTypeData.expenses.electricity),
                selectedCurrency
              )}
            </span>
          </div>

          <div className="details-box">
            <strong>Internet</strong>
            <span>
              {formatCurrency(
                convertMoney(calculatedData.houseTypeData.expenses.internet),
                selectedCurrency
              )}
            </span>
          </div>

          <div className="details-box">
            <strong>Wear &amp; Tear</strong>
            <span>
              {formatCurrency(
                convertMoney(calculatedData.houseTypeData.expenses.wearAndTear),
                selectedCurrency
              )}
            </span>
          </div>
        </div>
      </div>

      <button onClick={onBack}>Back</button>
    </>
  );
}