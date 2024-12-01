import React, { useState, useEffect } from "react";
import _ from "lodash";
import "./App.css";
import houseInventory from "./HouseInventory.json";
import houseTypes from "./HouseTypes.json";
import SatoriHaadYaoAbove from "./SatoriHaadYaoAbove.webp";
import SatoriThongSalaUniAbove from "./SatoriThongSalaUniAbove.jpg";
import SatoriWabiSabi from "./SatoriWabiSabi.jpg";

function App() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [calculatedData, setCalculatedData] = useState({});
  const [showAlternateResults, setShowAlternateResults] = useState(false);
  const [isShortTerm, setIsShortTerm] = useState(true);
  const [highSeasonOccupancy, setHighSeasonOccupancy] = useState(0.8);
  const [lowSeasonOccupancy, setLowSeasonOccupancy] = useState(0.7);
  const [houses, setHouses] = useState([]);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const loadImage = (imageUrl) => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
    };

    switch (selectedLocation) {
      case "Haad Yao":
        document.body.style.backgroundImage = `url(${SatoriHaadYaoAbove})`;
        loadImage(SatoriHaadYaoAbove);
        break;
      case "Thong Sala Uni":
        document.body.style.backgroundImage = `url(${SatoriThongSalaUniAbove})`;
        loadImage(SatoriThongSalaUniAbove);
        break;
      case "Hin Kong Beach":
        document.body.style.backgroundImage = `url(${SatoriWabiSabi})`;
        loadImage(SatoriWabiSabi);
        break;
      default:
        document.body.style.backgroundImage = `url(${SatoriThongSalaUniAbove})`;
        loadImage(SatoriThongSalaUniAbove);
        break;
    }
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    const locationData = houseInventory.locations.find(
      (loc) => loc.locationName === selectedLocation
    );
    setHouses(locationData ? locationData.houses : []);
    setHighSeasonOccupancy(locationData?.highSeasonOccupancy || 0.8);
    setLowSeasonOccupancy(locationData?.lowSeasonOccupancy || 0.7);
  }, [selectedLocation]);

  const calculateData = (houseTypeData, highOccupancy, lowOccupancy) => {
    const shortTermMonthlyDryExpenses =
      houseTypeData.expenses.water +
      houseTypeData.expenses.electricity +
      houseTypeData.expenses.internet +
      houseTypeData.expenses.wear_and_tear;

    const shortTermIncome =
      houseTypeData.pricing.high_season_avg_night_price *
        30 *
        6 *
        highOccupancy +
      houseTypeData.pricing.low_season_avg_night_price * 30 * 6 * lowOccupancy;

    const shortTermManagementFee = (shortTermIncome * 0.35) / 12;
    const shortTermMonthlyExpenses = shortTermMonthlyDryExpenses + shortTermManagementFee;
    const shortTermProfit = shortTermIncome - shortTermMonthlyExpenses * 12;

    const longTermIncome =
      houseTypeData.pricing.high_season_monthly_price * 6 +
      houseTypeData.pricing.low_season_monthly_price * 6;

    const longTermMonthlyExpenses = (longTermIncome * 0.25) / 12;
    const longTermProfit = longTermIncome - longTermMonthlyExpenses * 12;

    return {
      houseTypeData: houseTypeData,
      shortTermManagementFee: shortTermManagementFee,
      shortTermMonthlyExpenses: shortTermMonthlyExpenses,
      shortTermAnnualIncome: shortTermIncome,
      shortTermAnnualProfit: shortTermProfit,
      longTermMonthlyExpenses: longTermMonthlyExpenses,
      longTermAnnualIncome: longTermIncome,
      longTermAnnualProfit: longTermProfit,
    };
  };

  const handleLocationChange = (event) => {
    const locationName = event.target.value;
    setSelectedLocation(locationName);
    setSelectedHouse(null);
    setCalculatedData({});
    setShowAlternateResults(false);
  };

  const handleHouseClick = (houseId) => {
    const house = houses.find((h) => h.unitNumber === houseId);
    if (house) {
      const houseTypeData = houseTypes.locations
        .find((location) => location.name === selectedLocation)
        .houses.find((houseType) => houseType.type === house.type);

      if (!houseTypeData) {
        console.error("House type not found for:", house.type);
        return;
      }

      setSelectedHouse(house);
      setCalculatedData(
        calculateData(houseTypeData, highSeasonOccupancy, lowSeasonOccupancy)
      );
    }
  };

  const adjustCoordinates = (path) => {
    const { width, height } = imageDimensions;
    if (!width || !height) return path; // Don't adjust until image is loaded

    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const scale = Math.max(scaleX, scaleY);

    const cropOffsetX = (width * scale - containerWidth) / 2 / scale;
    const cropOffsetY = (height * scale - containerHeight) / 2 / scale;

    // Adjust the coordinates in the SVG path
    const adjustedPath = path.replace(
      /([MC])([0-9.,\s]+)/g,
      (_, command, coords) => {
        const points = coords.trim().split(/\s+/).map((pair) => {
          const [x, y] = pair.split(",").map(parseFloat);
          const adjustedX = (x - cropOffsetX) * scale;
          const adjustedY = (y - cropOffsetY) * scale;
          return `${adjustedX},${adjustedY}`;
        });

        return `${command} ${points.join(" ")}`;
      }
    );

    return adjustedPath;
  };

  useEffect(() => {
    if (selectedHouse) {
      const houseTypeData = houseTypes.locations
        .find((location) => location.name === selectedLocation)
        .houses.find((houseType) => houseType.type === selectedHouse.type);

      if (houseTypeData) {
        const updatedData = calculateData(houseTypeData, highSeasonOccupancy, lowSeasonOccupancy);
        setCalculatedData(updatedData);
      }
    }
  }, [highSeasonOccupancy, lowSeasonOccupancy, selectedHouse,selectedLocation]);

  const handleSwitchScreen = (isShortTerm) => {
    setShowAlternateResults(true);
    setIsShortTerm(isShortTerm);
  };

  const handleGoBack = () => {
    setShowAlternateResults(false);
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: 2,
    }).format(value);

  const formatPercentage = (value) => (value * 100).toFixed(3) + "%";

  return (
    <div className="App">
      <h1>Satori Investment Options</h1>

      <div className="location-selection">
        <label htmlFor="location-select">Location: </label>
        <select
          id="location-select"
          onChange={handleLocationChange}
          value={selectedLocation}
        >
          <option value="">--Select a location--</option>
          {houseInventory.locations.map((loc) => (
            <option key={loc.locationName} value={loc.locationName}>
              {loc.locationName}
            </option>
          ))}
        </select>
      </div>

      {selectedLocation && !selectedHouse && (
        <svg
          className="svg-overlay"
          xmlns="http://www.w3.org/2000/svg"
        >
          {houses.map((house) => (
            <path
              key={house.unitNumber}
              d={adjustCoordinates(house.image_coordinates)}
              fill="rgba(255, 255, 255, 0.3)"
              stroke="black"
              strokeWidth="1"
              className="clickable-area"
              onClick={() => handleHouseClick(house.unitNumber)}
            />
          ))}
        </svg>
      )}

      {selectedHouse && (
        <div>
          {showAlternateResults ? (
            <>
              {isShortTerm ? (
                <div className="details-container">
                  <h3>Short-Term Calculations</h3>
                  <div className="details-box">
                    <strong>High Season Nightly Price:</strong>
                    <span>
                      {formatNumber(
                        calculatedData.houseTypeData.pricing
                          .high_season_avg_night_price
                      )}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Low Season Nightly Price:</strong>
                    <span>
                      {formatNumber(
                        calculatedData.houseTypeData.pricing
                          .low_season_avg_night_price
                      )}
                    </span>
                  </div>
                  <h4>Monthly Expenses</h4>
                  <div className="details-box">
                    <strong>Management Fee:</strong>
                    <span>
                      {formatNumber(calculatedData.shortTermManagementFee)}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Water:</strong>
                    <span>
                      {formatNumber(calculatedData.houseTypeData.expenses.water)}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Electricity:</strong>
                    <span>
                      {formatNumber(
                        calculatedData.houseTypeData.expenses.electricity
                      )}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Internet:</strong>
                    <span>
                      {formatNumber(
                        calculatedData.houseTypeData.expenses.internet
                      )}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Wear and Tear:</strong>
                    <span>
                      {formatNumber(
                        calculatedData.houseTypeData.expenses.wear_and_tear
                      )}
                    </span>
                  </div>
                  <div className="occupancy-inputs">
                    <label>
                      High Season Occupancy:
                      <input
                        type="number"
                        value={highSeasonOccupancy}
                        min="0"
                        max="1"
                        step="0.01"
                        onChange={(e) =>
                          setHighSeasonOccupancy(parseFloat(e.target.value))
                        }
                      />
                    </label>
                    <label>
                      Low Season Occupancy:
                      <input
                        type="number"
                        value={lowSeasonOccupancy}
                        min="0"
                        max="1"
                        step="0.01"
                        onChange={(e) =>
                          setLowSeasonOccupancy(parseFloat(e.target.value))
                        }
                      />
                    </label>
                  </div>
                  <h4>General</h4>
                  <div className="details-box">
                    <strong>Total Annual Income:</strong>
                    <span>
                      {formatNumber(calculatedData.shortTermAnnualIncome)}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Expenses:</strong>
                    <span>
                      {formatNumber(
                        calculatedData.shortTermMonthlyExpenses * 12
                      )}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Profit:</strong>
                    <span>
                      {formatNumber(calculatedData.shortTermAnnualProfit)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="details-container">
                  <h3>Long-Term Calculations</h3>
                  <div className="details-box">
                    <strong>High Season Monthly Price:</strong>
                    <span>
                      {formatNumber(
                        calculatedData.houseTypeData.pricing
                          .high_season_monthly_price
                      )}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Low Season Monthly Price:</strong>
                    <span>
                      {formatNumber(
                        calculatedData.houseTypeData.pricing
                          .low_season_monthly_price
                      )}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Income:</strong>
                    <span>
                      {formatNumber(calculatedData.longTermAnnualIncome)}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Expenses:</strong>
                    <span>
                      {formatNumber(
                        calculatedData.longTermMonthlyExpenses * 12
                      )}
                    </span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Profit:</strong>
                    <span>
                      {formatNumber(calculatedData.longTermAnnualProfit)}
                    </span>
                  </div>
                </div>
              )}
              <button onClick={handleGoBack}>Back</button>
            </>
          ) : (
            <>
              <h2>{`Selected House: Unit ${selectedHouse.unitNumber}`}</h2>
              <div className="details-container">
                <div className="details-box">
                  <strong>Type:</strong>
                  <span>{_.startCase(selectedHouse.type)}</span>
                </div>
                <div className="details-box">
                  <strong>Plot Area:</strong>
                  <span>{selectedHouse.plotArea_sqm} sqm</span>
                </div>
                <div className="details-box">
                  <strong>Usable Area:</strong>
                  <span>{selectedHouse.usableArea_gross_sqm} sqm</span>
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
                  <span>{selectedHouse.price.toLocaleString()} THB</span>
                </div>
                <div
                  className="details-box clickable-value"
                  onClick={() => handleSwitchScreen(true)}
                >
                  <strong>Short Term Annual ROI:</strong>
                  <span>
                    {formatNumber(calculatedData.shortTermAnnualProfit)} or{" "}
                    {formatPercentage(
                      calculatedData.shortTermAnnualProfit /
                        selectedHouse.price
                    )}
                  </span>
                </div>
                <div
                  className="details-box clickable-value"
                  onClick={() => handleSwitchScreen(false)}
                >
                  <strong>Long Term Annual ROI:</strong>
                  <span>
                    {formatNumber(calculatedData.longTermAnnualProfit)} or{" "}
                    {formatPercentage(
                      calculatedData.longTermAnnualProfit /
                        selectedHouse.price
                    )}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedHouse(null)}>Back</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;