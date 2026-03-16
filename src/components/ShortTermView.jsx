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
  return (
    <>
      <div className="details-container">
        <h3>Short-Term Calculations</h3>

        <div className="details-box">
          <strong>High Season Nightly Price:</strong>
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
          <strong>Low Season Nightly Price:</strong>
          <input
            className="price-input"
            type="number"
            value={customPrices.lowSeasonNightlyPrice}
            onChange={(e) =>
              onLowSeasonNightlyPriceChange(parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <h4>Monthly Expenses</h4>

        <div className="details-box">
          <strong>Management Fee (Monthly):</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.shortTermManagementFee),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="details-box">
          <strong>Water:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.houseTypeData.expenses.water),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="details-box">
          <strong>Electricity:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.houseTypeData.expenses.electricity),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="details-box">
          <strong>Internet:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.houseTypeData.expenses.internet),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="details-box">
          <strong>Wear and Tear:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.houseTypeData.expenses.wearAndTear),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="occupancy-inputs">
          <label>
            High Season Occupancy:
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
          </label>

          <label>
            Low Season Occupancy:
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
          </label>
        </div>

        <h4>General</h4>

        <div className="details-box">
          <strong>Total Annual Income:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.shortTermAnnualIncome),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="details-box">
          <strong>Total Annual Expenses:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.shortTermMonthlyExpenses * 12),
              selectedCurrency
            )}
          </span>
        </div>

        <div className="details-box">
          <strong>Total Annual Profit:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.shortTermAnnualProfit),
              selectedCurrency
            )}
          </span>
        </div>
      </div>

      <button onClick={onBack}>Back</button>
    </>
  );
}