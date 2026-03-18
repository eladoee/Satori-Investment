import { formatCurrency, formatPercentage } from "../utils/formatters";

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
  const shortTermProfitConverted = convertMoney(calculatedData.shortTermAnnualProfit);
  const longTermProfitConverted = convertMoney(calculatedData.longTermAnnualProfit);

  const shortTermRoi = customPrices.housePrice
    ? formatPercentage(calculatedData.shortTermAnnualProfit / customPrices.housePrice)
    : "0.00%";

  const longTermRoi = customPrices.housePrice
    ? formatPercentage(calculatedData.longTermAnnualProfit / customPrices.housePrice)
    : "0.00%";

  return (
    <>
      <div className="villa-hero">
        <div className="villa-badge">{`Villa ${selectedHouse.unitNumber}`}</div>
        <h2 className="villa-title">
          {calculatedData.houseTypeData.displayName}
        </h2>
        <div className="villa-meta">
          <span>{selectedHouse.usableAreaGrossSqm} sqm</span>
          <span>•</span>
          <span>{selectedHouse.bedrooms} Bedrooms</span>
          <span>•</span>
          <span>{selectedHouse.floors} Floors</span>
        </div>
      </div>

      <div className="details-container">
        <div className="details-box">
          <strong>Plot Area</strong>
          <span>{selectedHouse.plotAreaSqm} sqm</span>
        </div>

        <div className="details-box">
          <strong>Usable Area</strong>
          <span>{selectedHouse.usableAreaGrossSqm} sqm</span>
        </div>

        <div className="details-box">
          <strong>Bedrooms</strong>
          <span>{selectedHouse.bedrooms}</span>
        </div>

        <div className="details-box">
          <strong>Floors</strong>
          <span>{selectedHouse.floors}</span>
        </div>

        <div className="details-box price-row">
          <strong>Price</strong>
          <input
            className="price-input"
            type="number"
            value={customPrices.housePrice}
            onChange={(e) => onHousePriceChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="roi-cards">
        <button type="button" className="roi-card" onClick={onOpenShortTerm}>
          <div className="roi-card-label">Short Term ROI</div>
          <div className="roi-card-value">
            {formatCurrency(shortTermProfitConverted, selectedCurrency)}
          </div>
          <div className="roi-card-subvalue">{shortTermRoi}</div>
        </button>

        <button type="button" className="roi-card" onClick={onOpenLongTerm}>
          <div className="roi-card-label">Long Term ROI</div>
          <div className="roi-card-value">
            {formatCurrency(longTermProfitConverted, selectedCurrency)}
          </div>
          <div className="roi-card-subvalue">{longTermRoi}</div>
        </button>
      </div>

      <button onClick={onBack}>Back</button>
    </>
  );
}