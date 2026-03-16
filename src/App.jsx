import React, { useState, useEffect } from "react";
import _ from "lodash";
import "./App.css";
import houseInventory from "./HouseInventory.json";
import houseTypes from "./HouseTypes.json";
import SatoriHaadYaoAbove from "./SatoriHaadYaoAbove.webp";
import SatoriThongSalaUniAbove from "./SatoriThongSalaUniAbove.jpg";
import SatoriHinKongVillas from "./SatoriHinKongVillas.jpg";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { GoogleLogin } from "@react-oauth/google";
// ====== AUTH CONFIG (CRA) ======
const ALLOWED_HD = "oee.ltd";
const AUDIENCE = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
const JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");

function useAuth() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const JWKS = React.useMemo(() => createRemoteJWKSet(JWKS_URL), []);

  React.useEffect(() => {
    const raw = sessionStorage.getItem("satori_session");
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { sessionStorage.removeItem("satori_session"); }
    }
    setLoading(false);
  }, []);

  async function verifyIdToken(idToken) {
    if (!AUDIENCE) throw new Error("Missing Google Client ID.");
    const { payload } = await jwtVerify(idToken, JWKS, {
      audience: AUDIENCE,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });
    if (payload.hd !== ALLOWED_HD) throw new Error(`Please use your @${ALLOWED_HD} account.`);
    if (!payload.email_verified) throw new Error("Email not verified.");
    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name || "",
      picture: payload.picture || "",
    };
  }

  async function signIn(credential) {
    const profile = await verifyIdToken(credential);
    setUser(profile);
    sessionStorage.setItem("satori_session", JSON.stringify(profile));
  }

  return { user, signIn, loading };
}


// Responsive SVG map that scales with viewBox and preserves original coordinates
function ResponsiveImageMap({ imageSrc, originalWidth, originalHeight, houses, onHotspotClick }) {
  if (!originalWidth || !originalHeight) return null;
  return (
    <div className="map-wrap">
      <svg
        className="svg-map"
        viewBox={`0 0 ${originalWidth} ${originalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <image
          href={imageSrc}
          x="0"
          y="0"
          width={originalWidth}
          height={originalHeight}
          preserveAspectRatio="xMidYMid meet"
        />
        <g aria-label="hotspots">
          {houses.map((house) => (
            <g key={house.unitNumber}>
              {/* visible path (subtle highlight) */}
              <path
                d={house.image_coordinates}
                className="hotspot-outline"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
              {/* large invisible hit area for easy tapping */}
              <path
                d={house.image_coordinates}
                className="hotspot-hit"
                onClick={() => onHotspotClick(house.unitNumber)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onHotspotClick(house.unitNumber)}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

function AppInner() {
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

  const getLocationImage = (name) => {
    switch (name) {
      case "Haad Yao":
        return SatoriHaadYaoAbove;
      case "Thong Sala Uni":
        return SatoriThongSalaUniAbove;
      case "Hin Kong Villas":
        return SatoriHinKongVillas;
      default:
        return SatoriThongSalaUniAbove;
    }
  };


  // This state will store the dynamic prices:
  const [customPrices, setCustomPrices] = useState({
    housePrice: 0,
    highSeasonNightlyPrice: 0,
    lowSeasonNightlyPrice: 0,
    highSeasonMonthlyPrice: 0,
    lowSeasonMonthlyPrice: 0,
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
      case "Hin Kong Villas":
        document.body.style.backgroundImage = `url(${SatoriHinKongVillas})`;
        loadImage(SatoriHinKongVillas);
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

  // Updated calculateData function to accept dynamic pricing
  const calculateData = (
    houseTypeData,
    highOccupancy,
    lowOccupancy,
    dynamicNightlyHigh,
    dynamicNightlyLow,
    dynamicMonthlyHigh,
    dynamicMonthlyLow,
    dynamicHousePrice,
    shortTermManagementFeeRate,
    longTermManagementFeeRate
  ) => {
    // Monthly expenses that don't change even if nightly prices do
    const shortTermMonthlyDryExpenses =
      houseTypeData.expenses.water +
      houseTypeData.expenses.electricity +
      houseTypeData.expenses.internet +
      houseTypeData.expenses.wear_and_tear;
    const commonAreaManagementFee = 60000;

    // Short term income (using dynamic nightly prices)
    const shortTermIncome =
      dynamicNightlyHigh * 30 * 7 * highOccupancy +
      dynamicNightlyLow * 30 * 5 * lowOccupancy;

    const shortTermManagementFee = ((shortTermIncome * shortTermManagementFeeRate) / 12) + commonAreaManagementFee;
    const shortTermMonthlyExpenses =
      shortTermMonthlyDryExpenses + shortTermManagementFee;
    const shortTermProfit = shortTermIncome - shortTermMonthlyExpenses * 12;

    // Long term income (using dynamic monthly prices)
    const longTermIncome = dynamicMonthlyHigh * 7 + dynamicMonthlyLow * 5;
    const longTermMonthlyExpenses = ((longTermIncome * longTermManagementFeeRate) / 12) + commonAreaManagementFee;
    const longTermProfit = longTermIncome - longTermMonthlyExpenses * 12;

    // Return all relevant calculations
    return {
      houseTypeData: houseTypeData,
      shortTermManagementFee,
      shortTermMonthlyExpenses,
      shortTermAnnualIncome: shortTermIncome,
      shortTermAnnualProfit: shortTermProfit,
      longTermMonthlyExpenses,
      longTermAnnualIncome: longTermIncome,
      longTermAnnualProfit: longTermProfit,
      dynamicHousePrice
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
    const locationData = houseInventory.locations.find(
      (loc) => loc.locationName === selectedLocation
    );
    const house = houses.find((h) => h.unitNumber === houseId);
    if (house) {
      const houseTypeData = houseTypes.locations
        .find((location) => location.name === selectedLocation)
        ?.houses.find((houseType) => houseType.type === house.type);

      if (!houseTypeData) {
        console.error("House type not found for:", house.type);
        return;
      }

      setSelectedHouse(house);

      // Initialize customPrices with the house's base price and the relevant defaults
      setCustomPrices({
        housePrice: house.price,
        highSeasonNightlyPrice: houseTypeData.pricing.high_season_avg_night_price,
        lowSeasonNightlyPrice: houseTypeData.pricing.low_season_avg_night_price,
        highSeasonMonthlyPrice: houseTypeData.pricing.high_season_monthly_price,
        lowSeasonMonthlyPrice: houseTypeData.pricing.low_season_monthly_price,
      });

      // Immediately calculate with those defaults
      const initialCalculated = calculateData(
        houseTypeData,
        highSeasonOccupancy,
        lowSeasonOccupancy,
        houseTypeData.pricing.high_season_avg_night_price,
        houseTypeData.pricing.low_season_avg_night_price,
        houseTypeData.pricing.high_season_monthly_price,
        houseTypeData.pricing.low_season_monthly_price,
        house.price,
        locationData?.shortTermManagementFee || 0.2, // fallback default
        locationData?.longTermManagementFee || 0.1
      );

      setCalculatedData(initialCalculated);
    }
  };

  /* adjustCoordinates no longer needed (replaced by viewBox scaling) */

  // Whenever user changes occupancy or any custom price, recalculate
  useEffect(() => {
    if (selectedHouse) {
      const locationData = houseInventory.locations.find(
  (loc) => loc.locationName === selectedLocation
);
      const houseTypeData = houseTypes.locations
        .find((location) => location.name === selectedLocation)
        ?.houses.find((houseType) => houseType.type === selectedHouse.type);

      if (houseTypeData) {
        const updatedData = calculateData(
          houseTypeData,
          highSeasonOccupancy,
          lowSeasonOccupancy,
          customPrices.highSeasonNightlyPrice,
          customPrices.lowSeasonNightlyPrice,
          customPrices.highSeasonMonthlyPrice,
          customPrices.lowSeasonMonthlyPrice,
          customPrices.housePrice,
          locationData?.shortTermManagementFee || 0.2, // fallback default
          locationData?.longTermManagementFee || 0.1
        );
        setCalculatedData(updatedData);
      }
    }
    // eslint-disable-next-line
  }, [
    highSeasonOccupancy,
    lowSeasonOccupancy,
    selectedHouse,
    selectedLocation,
    customPrices,
  ]);

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

  const formatPercentage = (value) =>
    (value * 100).toFixed(2) + "%"; // Slightly simplified for display

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
        <ResponsiveImageMap
          imageSrc={getLocationImage(selectedLocation)}
          originalWidth={imageDimensions.width}
          originalHeight={imageDimensions.height}
          houses={houses}
          onHotspotClick={handleHouseClick}
        />
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
                    <input
                      className="price-input"
                      type="number"
                      value={customPrices.highSeasonNightlyPrice}
                      onChange={(e) =>
                        setCustomPrices((prev) => ({
                          ...prev,
                          highSeasonNightlyPrice: parseFloat(e.target.value) || 0,
                        }))
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
                        setCustomPrices((prev) => ({
                          ...prev,
                          lowSeasonNightlyPrice: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <h4>Monthly Expenses</h4>
                  <div className="details-box">
                    <strong>Management Fee (Monthly):</strong>
                    <span>{formatNumber(calculatedData.shortTermManagementFee)}</span>
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
                        class="occupancy-input"
                        type="number"
                        value={highSeasonOccupancy}
                        min="0"
                        max="1"
                        step="0.01"
                        onChange={(e) =>
                          setHighSeasonOccupancy(parseFloat(e.target.value) || 0)
                        }
                      />
                    </label>
                    <label>
                      Low Season Occupancy:
                      <input
                        class="occupancy-input"
                        type="number"
                        value={lowSeasonOccupancy}
                        min="0"
                        max="1"
                        step="0.01"
                        onChange={(e) =>
                          setLowSeasonOccupancy(parseFloat(e.target.value) || 0)
                        }
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
                    <span>
                      {formatNumber(calculatedData.shortTermMonthlyExpenses * 12)}
                    </span>
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
                    <input
                      className="price-input"
                      type="number"
                      value={customPrices.highSeasonMonthlyPrice}
                      onChange={(e) =>
                        setCustomPrices((prev) => ({
                          ...prev,
                          highSeasonMonthlyPrice: parseFloat(e.target.value) || 0,
                        }))
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
                        setCustomPrices((prev) => ({
                          ...prev,
                          lowSeasonMonthlyPrice: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="details-box">
                    <strong>Monthly Management Fee:</strong>
                    <span>{formatNumber(calculatedData.longTermMonthlyExpenses)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Income:</strong>
                    <span>{formatNumber(calculatedData.longTermAnnualIncome)}</span>
                  </div>
                  <div className="details-box">
                    <strong>Total Annual Expenses:</strong>
                    <span>
                      {formatNumber(calculatedData.longTermMonthlyExpenses * 12)}
                    </span>
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
                {/* Main Price (dynamic) */}
                <div className="details-box">
                  <strong>Price:</strong>
                  <input
                    className="price-input"
                    type="number"
                    value={customPrices.housePrice}
                    onChange={(e) =>
                      setCustomPrices((prev) => ({
                        ...prev,
                        housePrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                {/* Short Term ROI and Long Term ROI */}
                <div
                  className="details-box clickable-value"
                  onClick={() => handleSwitchScreen(true)}
                >
                  <strong>Short Term Annual ROI:</strong>
                  <span>
                    {/* shortTermAnnualProfit */}
                    {formatNumber(calculatedData.shortTermAnnualProfit)} or{" "}
                    {customPrices.housePrice
                      ? formatPercentage(
                          calculatedData.shortTermAnnualProfit /
                            customPrices.housePrice
                        )
                      : "0.00%"}
                  </span>
                </div>
                <div
                  className="details-box clickable-value"
                  onClick={() => handleSwitchScreen(false)}
                >
                  <strong>Long Term Annual ROI:</strong>
                  <span>
                    {formatNumber(calculatedData.longTermAnnualProfit)} or{" "}
                    {customPrices.housePrice
                      ? formatPercentage(
                          calculatedData.longTermAnnualProfit /
                            customPrices.housePrice
                        )
                      : "0.00%"}
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


function App() {
  const { user, signIn, loading } = useAuth();

  if (loading) {
  return (
    <div className="auth-loading">
      <div className="spinner" />
      <div className="loading-text">Loading…</div>
    </div>
  );
}

  if (!user) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Satori ROI</h1>
        <p className="auth-subtitle">
          Sign in with your <b>@{ALLOWED_HD}</b> Google account to continue.
        </p>
        <div className="auth-actions">
          <GoogleLogin
            onSuccess={(res) => {
              const idToken = res?.credential;
              if (!idToken) { alert("No credential received from Google."); return; }
              signIn(idToken).catch((e) => alert(e.message || "Login failed"));
            }}
            onError={() => alert("Google sign-in failed")}
            useOneTap
          />
        </div>
        {/* Optional separator + footer (you already have styles for these) */}
        <div className="auth-sep" />
        <div className="auth-footer">
          <span>Protected access</span>
          <span className="auth-dot">•</span>
          <span>oee.ltd</span>
        </div>
      </div>
    </div>
  );
}

  return <AppInner />;
}

export default App;