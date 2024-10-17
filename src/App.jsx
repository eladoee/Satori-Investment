import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import './App.css';
import houseInventory from './HouseInventory.json';  // Importing the JSON file
import houseTypes from './HouseTypes.json';

function App() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [calculatedData, setCalculatedData] = useState({});
  const [showAlternateResults, setShowAlternateResults] = useState(false);  // Track which screen to show
  const [isShortTerm, setIsShortTerm] = useState(true);  // Track if it's short-term or long-term calculation
  const [highSeasonOccupancy, setHighSeasonOccupancy] = useState(0.8);  // Default occupancy for high season
  const [lowSeasonOccupancy, setLowSeasonOccupancy] = useState(0.7);    // Default occupancy for low season

  // Function to calculate data for short-term and long-term
  const calculateData = (houseTypeData, highOccupancy, lowOccupancy) => {
    const shortTermMonthlyExpenses = houseTypeData.expenses.management + houseTypeData.expenses.water + houseTypeData.expenses.electricity + houseTypeData.expenses.internet + houseTypeData.expenses.wear_and_tear;
    const shortTermIncome = (houseTypeData.pricing.high_season_avg_night_price * 30 * 6 * highOccupancy) + (houseTypeData.pricing.low_season_avg_night_price * 30 * 6 * lowOccupancy);
    const shortTermProfit = shortTermIncome - (shortTermMonthlyExpenses * 12);
    const longTermProfit = (houseTypeData.pricing.high_season_monthly_price * 6) + (houseTypeData.pricing.low_season_monthly_price * 6) - (houseTypeData.expenses.long_term_management * 12);

    return {
      houseTypeData: houseTypeData,
      shortTermMonthlyExpenses: shortTermMonthlyExpenses,
      shortTermAnnualIncome: shortTermIncome,
      shortTermAnnualProfit: shortTermProfit,
      longTermAnnualProfit: longTermProfit
    };
  };

  // Handle location selection
  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
    setSelectedHouse(null);  // Reset house selection when location changes
    setCalculatedData({});   // Reset calculations
    setShowAlternateResults(false);  // Reset to main results screen
  };

  // Handle house selection and perform calculations
  const handleHouseChange = (event) => {
    const houseNumber = parseInt(event.target.value, 10);
    const selectedLocationData = houseInventory.locations.find(loc => loc.locationName === selectedLocation);
    const house = selectedLocationData?.houses.find(h => h.unitNumber === houseNumber);
  
    if (house) {
      setSelectedHouse(house);
  
      // Find house type data from HouseTypes.json
      const houseTypeData = houseTypes.houses.find(houseType => houseType.type === house.type);
  
      if (!houseTypeData) {
        console.error('House type not found for:', house.type);
        return;
      }
  
      // Calculate initial data based on default occupancy rates
      setCalculatedData(calculateData(houseTypeData, highSeasonOccupancy, lowSeasonOccupancy));
    }
  };

  // Update calculations when occupancy changes
  useEffect(() => {
    if (selectedHouse && calculatedData.houseTypeData) {
      const updatedData = calculateData(calculatedData.houseTypeData, highSeasonOccupancy, lowSeasonOccupancy);
      setCalculatedData(updatedData);
    }
  }, [highSeasonOccupancy, lowSeasonOccupancy, selectedHouse, calculatedData.houseTypeData]);  // Added necessary dependencies

  // Fetch the houses for the selected location
  const houses = selectedLocation
    ? houseInventory.locations.find(loc => loc.locationName === selectedLocation).houses
    : [];

  // Handle clicking on the calculated value labels to switch screens
  const handleSwitchScreen = (isShortTerm) => {
    setShowAlternateResults(true);  // Show the second set of results
    setIsShortTerm(isShortTerm);    // Determine whether it's short-term or long-term results
  };

  // Handle going back to the original results screen
  const handleGoBack = () => {
    setShowAlternateResults(false);  // Show the original results screen
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB' }).format(value);
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
          {houseInventory.locations.map(loc => (
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
            {houses.map(house => (
              <option key={house.unitNumber} value={house.unitNumber}>
                {`House ${house.unitNumber}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display the selected house data and calculations */}
      {selectedHouse && (
        <div>
          {showAlternateResults ? (
            <>
              <h2>{isShortTerm ? 'Short-Term ROI Calculation' : 'Long-Term ROI Calculation'} Details</h2>
              
              {isShortTerm ? (
                <div>
                  <h3>Short-Term Calculations</h3>
                  {/* Occupancy inputs for short-term */}
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

                  <p><strong>Income:</strong></p>
                  <ul>
                    <li>High Season Nightly Cost: {formatNumber(calculatedData.houseTypeData.pricing.high_season_avg_night_price)}</li>
                    <li>High Season Monthly Cost: {formatNumber(calculatedData.houseTypeData.pricing.high_season_avg_night_price * 30)}</li>
                    <li>Low Season Nightly Cost: {formatNumber(calculatedData.houseTypeData.pricing.low_season_avg_night_price)}</li>
                    <li>Low Season Monthly Cost: {formatNumber(calculatedData.houseTypeData.pricing.low_season_avg_night_price * 30)}</li>
                  </ul>

                  <p><strong>Monthly Expenses:</strong></p>
                  <ul>
                    <li>Management: {formatNumber(calculatedData.houseTypeData.expenses.management)}</li>
                    <li>Water: {formatNumber(calculatedData.houseTypeData.expenses.water)}</li>
                    <li>Electricity: {formatNumber(calculatedData.houseTypeData.expenses.electricity)}</li>
                    <li>Internet: {formatNumber(calculatedData.houseTypeData.expenses.internet)}</li>
                    <li>Wear and Tear: {formatNumber(calculatedData.houseTypeData.expenses.wear_and_tear)}</li>
                    <li>Total: {formatNumber(calculatedData.shortTermMonthlyExpenses)}</li>
                  </ul>
      
                  <p><strong>General:</strong></p>
                  <ul>
                    <li>Total Annual Income: {formatNumber(calculatedData.shortTermAnnualIncome)}</li>
                    <li>Total Annual Expenses: {formatNumber(calculatedData.shortTermMonthlyExpenses * 12)}</li>
                    <li>Total Annual Profit: {formatNumber(calculatedData.shortTermAnnualProfit)}</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h3>Long-Term Calculations</h3>
                  <ul>
                    <p><strong>Income:</strong></p>
                    <li>High Season Monthly Price: {formatNumber(calculatedData.houseTypeData.pricing.high_season_monthly_price)}</li>
                    <li>Low Season Monthly Price: {formatNumber(calculatedData.houseTypeData.pricing.low_season_monthly_price)}</li>
                    
                    <p><strong>Monthly Expenses:</strong></p>
                    <li>Management: {formatNumber(calculatedData.houseTypeData.expenses.long_term_management)}</li>

                    <p><strong>General:</strong></p>
                    <li>Total Annual Income: {formatNumber(calculatedData.houseTypeData.pricing.high_season_monthly_price * 6 + calculatedData.houseTypeData.pricing.low_season_monthly_price * 6)}</li>
                    <li>Total Annual Expenses: {formatNumber(calculatedData.shortTermMonthlyExpenses * 12)}</li>
                    <li>Total Annual Profit: {formatNumber(calculatedData.longTermAnnualProfit)}</li>
                  </ul>
                </div>
              )}

              <button onClick={handleGoBack}>Back</button>
            </>
          ) : (
            <>
              <h2>Selected House: {`Unit ${selectedHouse.unitNumber}`}</h2>
              <p>Type: {_.startCase(selectedHouse.type)}</p>
              <p>Plot Area: {selectedHouse.plotArea_sqm} sqm</p>
              <p>Usable Area: {selectedHouse.usableArea_gross_sqm} sqm</p>
              <p>Bedrooms: {selectedHouse.bedrooms}</p>
              <p>Floors: {selectedHouse.floors}</p>
              <p>Price: {selectedHouse.price.toLocaleString()} THB</p>

              <p className="clickable-value" onClick={() => handleSwitchScreen(true)}>
                Short Term ROI: {formatNumber(calculatedData.shortTermAnnualProfit)} or {formatPercentage(calculatedData.shortTermAnnualProfit / selectedHouse.price)}
              </p>
              <p className="clickable-value" onClick={() => handleSwitchScreen(false)}>
                Long Term ROI: {formatNumber(calculatedData.longTermAnnualProfit)} or {formatPercentage(calculatedData.longTermAnnualProfit / selectedHouse.price)}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;