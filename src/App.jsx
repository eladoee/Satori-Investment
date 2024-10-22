import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import './App.css';
import houseInventory from './HouseInventory.json';
import houseTypes from './HouseTypes.json';
import SatoriHaadYaoAbove from './SatoriHaadYaoAbove.webp';
import SatoriThongSalaUniAbove from './SatoriThongSalaUniAbove.jpg';
import SatoriWabiSabi from './SatoriWabiSabi.jpg';

function App() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [calculatedData, setCalculatedData] = useState({});
  const [showAlternateResults, setShowAlternateResults] = useState(false);
  const [isShortTerm, setIsShortTerm] = useState(true);
  const [highSeasonOccupancy, setHighSeasonOccupancy] = useState(0.8);
  const [lowSeasonOccupancy, setLowSeasonOccupancy] = useState(0.7);

  // Update background based on the selected location
  useEffect(() => {
    switch (selectedLocation) {
      case 'Haad Yao':
        document.body.style.backgroundImage = `url(${SatoriHaadYaoAbove})`;
        break;
      case 'Thong Sala Uni':
        document.body.style.backgroundImage = `url(${SatoriThongSalaUniAbove})`;
        break;
      case 'Wabi Sabi':
        document.body.style.backgroundImage = `url(${SatoriWabiSabi})`;
        break;  
      default:
        document.body.style.backgroundImage = `url(${SatoriThongSalaUniAbove})`;
        break;
    }
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
  }, [selectedLocation]);

  const calculateData = (houseTypeData, highOccupancy, lowOccupancy) => {
    const shortTermMonthlyDryExpenses = houseTypeData.expenses.water + houseTypeData.expenses.electricity + houseTypeData.expenses.internet + houseTypeData.expenses.wear_and_tear;
    const shortTermIncome = (houseTypeData.pricing.high_season_avg_night_price * 30 * 6 * highOccupancy) + (houseTypeData.pricing.low_season_avg_night_price * 30 * 6 * lowOccupancy);
    const shortTermManagementFee = (shortTermIncome * 0.35) / 12
    const shortTermMonthlyExpenses = shortTermMonthlyDryExpenses + shortTermManagementFee;
    const shortTermProfit = shortTermIncome - (shortTermMonthlyExpenses * 12);
    const longTermIncome = (houseTypeData.pricing.high_season_monthly_price * 6) + (houseTypeData.pricing.low_season_monthly_price * 6)
    const longTermMonthlyExpenses = (longTermIncome * 0.25) / 12;
    const longTermProfit = longTermIncome - (longTermMonthlyExpenses * 12);

    return {
      houseTypeData: houseTypeData,
      shortTermManagementFee: shortTermManagementFee,
      shortTermMonthlyExpenses: shortTermMonthlyExpenses,
      shortTermAnnualIncome: shortTermIncome,
      shortTermAnnualProfit: shortTermProfit,
      longTermMonthlyExpenses: longTermMonthlyExpenses,
      longTermAnnualIncome: longTermIncome,
      longTermAnnualProfit: longTermProfit
    };
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
    setSelectedHouse(null);
    setCalculatedData({});
    setShowAlternateResults(false);
  };

  const handleHouseChange = (event) => {
    const houseNumber = parseInt(event.target.value, 10);
    const selectedLocationData = houseInventory.locations.find(location => location.locationName === selectedLocation);
    const house = selectedLocationData?.houses.find(h => h.unitNumber === houseNumber);

    if (house) {
      setSelectedHouse(house);

      const houseTypeData = houseTypes.locations.find(location => location.name === selectedLocation).houses.find(houseType => houseType.type === house.type);

      if (!houseTypeData) {
        console.error('House type not found for:', house.type);
        return;
      }

      setCalculatedData(calculateData(houseTypeData, highSeasonOccupancy, lowSeasonOccupancy));
    }
  };

  useEffect(() => {
    if (selectedHouse && calculatedData.houseTypeData) {
      const updatedData = calculateData(calculatedData.houseTypeData, highSeasonOccupancy, lowSeasonOccupancy);
      setCalculatedData(updatedData);
    }
  }, [highSeasonOccupancy, lowSeasonOccupancy, selectedHouse, calculatedData.houseTypeData]);

  const houses = selectedLocation
    ? houseInventory.locations.find(loc => loc.locationName === selectedLocation).houses
    : [];

  const handleSwitchScreen = (isShortTerm) => {
    setShowAlternateResults(true);
    setIsShortTerm(isShortTerm);
  };

  const handleGoBack = () => {
    setShowAlternateResults(false);
  };

  const formatNumber = (value) => {
    const formattedValue = new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format(value);
    return `${formattedValue} THB`;
  };

  const formatPercentage = (value) => {
    return (value * 100).toFixed(3) + '%';
  };

  return (
    <div className="App">
      <h1>Satori Investment Options</h1>

      <div className="location-selection">
        <label htmlFor="location-select">Location: </label>
        <select id="location-select" onChange={handleLocationChange} value={selectedLocation}>
          <option value="">--Select a location--</option>
          {houseInventory.locations.map((loc) => (
            <option key={loc.locationName} value={loc.locationName}>
              {loc.locationName}
            </option>
          ))}
        </select>
      </div>

      {selectedLocation && (
        <div className="house-selection">
          <label htmlFor="house-select">House: </label>
          <select id="house-select" onChange={handleHouseChange} value={selectedHouse?.unitNumber || ''}>
            <option value="">--Select a house--</option>
            {houses.map((house) => (
              <option key={house.unitNumber} value={house.unitNumber}>
                {`House ${house.unitNumber}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedHouse && (
        <div>
          {showAlternateResults ? (
            <>
              <h2>{isShortTerm ? 'Short-Term ROI Calculation' : 'Long-Term ROI Calculation'} Details</h2>

              {isShortTerm ? (
                <div className="details-container">
                  <h3>Short-Term Calculations</h3>

                  <div className="details-box">
                    <strong>High Season Nightly Cost:</strong>
                    <span>{formatNumber(calculatedData.houseTypeData.pricing.high_season_avg_night_price)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Low Season Nightly Cost:</strong>
                    <span>{formatNumber(calculatedData.houseTypeData.pricing.low_season_avg_night_price)}</span>
                  </div>

                  <h4>Monthly Expenses</h4>
                  <div className="details-box">
                    <strong>Management:</strong>
                    <span>{formatNumber(calculatedData.shortTermManagementFee)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Water:</strong>
                    <span>{formatNumber(calculatedData.houseTypeData.expenses.water)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Electricity:</strong>
                    <span>{formatNumber(calculatedData.houseTypeData.expenses.electricity)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Internet:</strong>
                    <span>{formatNumber(calculatedData.houseTypeData.expenses.internet)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Wear and Tear:</strong>
                    <span>{formatNumber(calculatedData.houseTypeData.expenses.wear_and_tear)}</span>
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
                        onChange={(e) => setHighSeasonOccupancy(parseFloat(e.target.value))}
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
                        onChange={(e) => setLowSeasonOccupancy(parseFloat(e.target.value))}
                      />
                    </label>
                  </div>

                  <h4>General</h4>
                  <div className="details-box">
                    <strong>Total Annual Income:</strong>
                    <span>{formatNumber(calculatedData.shortTermAnnualIncome)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Expenses:</strong>
                    <span>{formatNumber(calculatedData.shortTermMonthlyExpenses * 12)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Profit:</strong>
                    <span>{formatNumber(calculatedData.shortTermAnnualProfit)}</span>
                  </div>
                </div>
              ) : (
                <div className="details-container">
                  <h3>Long-Term Calculations</h3>

                  <div className="details-box">
                    <strong>High Season Monthly Price:</strong>
                    <span>{formatNumber(calculatedData.houseTypeData.pricing.high_season_monthly_price)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Low Season Monthly Price:</strong>
                    <span>{formatNumber(calculatedData.houseTypeData.pricing.low_season_monthly_price)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Monthly Management Expenses:</strong>
                    <span>{formatNumber(calculatedData.longTermMonthlyExpenses)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Income:</strong>
                    <span>{formatNumber(calculatedData.longTermAnnualIncome)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Expenses:</strong>
                    <span>{formatNumber(calculatedData.longTermMonthlyExpenses * 12)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Profit:</strong>
                    <span>{formatNumber(calculatedData.longTermAnnualProfit)}</span>
                  </div>
                </div>
              )}

              <button onClick={handleGoBack}>Back</button>
            </>
          ) : (
            <>
              <h2>Selected House: {`Unit ${selectedHouse.unitNumber}`}</h2>

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
                <div className="details-box clickable-value" onClick={() => handleSwitchScreen(true)}>
                  <strong>Short Term Annual ROI:</strong>
                  <span>{formatNumber(calculatedData.shortTermAnnualProfit)} or {formatPercentage(calculatedData.shortTermAnnualProfit / selectedHouse.price)}</span>
                </div>
                <div className="details-box clickable-value" onClick={() => handleSwitchScreen(false)}>
                  <strong>Long Term Annual ROI:</strong>
                  <span>{formatNumber(calculatedData.longTermAnnualProfit)} or {formatPercentage(calculatedData.longTermAnnualProfit / selectedHouse.price)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;