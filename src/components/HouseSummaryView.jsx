import startCase from "lodash/startCase";
import {
  formatCurrency,
  formatPercentage,
} from "../utils/formatters";

export default function HouseSummaryView({
  selectedHouse,
  customPrices,
  calculatedData,
  selectedCurrency,
  convertMoney,
  onHousePriceChange,
  onOpenShortTerm,
  onOpenLongTerm,
  onBack,
}) {
  return (
    <>
      <h2>{`Selected House: Unit ${selectedHouse.unitNumber}`}</h2>

      <div className="details-container">
        <div className="details-box">
          <strong>Type:</strong>
          <span>
            {calculatedData.houseTypeData.displayName ||
              startCase(selectedHouse.typeId)}
          </span>
        </div>

        <div className="details-box">
          <strong>Plot Area:</strong>
          <span>{selectedHouse.plotAreaSqm} sqm</span>
        </div>

        <div className="details-box">
          <strong>Usable Area:</strong>
          <span>{selectedHouse.usableAreaGrossSqm} sqm</span>
        </div>

        <div className="details-box">
          <strong>Bedrooms:</strong>
          <span>{selectedHouse.bedrooms}</span>
        </div>

        <div className="details-box">
          <strong>Floors:</strong>
          <span>{selectedHouse.floors}</span>
        </div>

        <div className="details-box">
          <strong>Price:</strong>
          <input
            className="price-input"
            type="number"
            value={customPrices.housePrice}
            onChange={(e) => onHousePriceChange(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="details-box clickable-value" onClick={onOpenShortTerm}>
          <strong>Short Term Annual ROI:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.shortTermAnnualProfit),
              selectedCurrency
            )}{" "}
            or{" "}
            {customPrices.housePrice
              ? formatPercentage(
                  calculatedData.shortTermAnnualProfit / customPrices.housePrice
                )
              : "0.00%"}
          </span>
        </div>

        <div className="details-box clickable-value" onClick={onOpenLongTerm}>
          <strong>Long Term Annual ROI:</strong>
          <span>
            {formatCurrency(
              convertMoney(calculatedData.longTermAnnualProfit),
              selectedCurrency
            )}{" "}
            or{" "}
            {customPrices.housePrice
              ? formatPercentage(
                  calculatedData.longTermAnnualProfit / customPrices.housePrice
                )
              : "0.00%"}
          </span>
        </div>
      </div>

      <button onClick={onBack}>Back</button>
    </>
  );
}