import React, { useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import "./App.css";
import houseInventory from "./data/houseInventory.json";
import houseTypeConfigs from "./data/houseTypeConfigs.json";

import useAuth, { AUTH_ALLOWED_HD } from "./hooks/useAuth";
import { calculateROI } from "./utils/calculations";
import {
  DEFAULT_HIGH_OCCUPANCY,
  DEFAULT_LOW_OCCUPANCY,
  DEFAULT_SHORT_TERM_FEE,
  DEFAULT_LONG_TERM_FEE,
  EMPTY_CUSTOM_PRICES,
} from "./utils/appConfig";
import {
  getSelectedLocationData,
  getSelectedHouseTypeData,
  getHouseByUnitNumber,
} from "./utils/houseData";
import { getLocationBackground } from "./utils/backgrounds";
import { convertFromTHB } from "./utils/currency";
import { fetchExchangeRates } from "./utils/exchangeRates";

import LocationSelector from "./components/LocationSelector";
import CurrencySelector from "./components/CurrencySelector";
import HouseOverlayMap from "./components/HouseOverlayMap";
import HouseSummaryView from "./components/HouseSummaryView";
import ShortTermView from "./components/ShortTermView";
import LongTermView from "./components/LongTermView";

function AppInner() {
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showAlternateResults, setShowAlternateResults] = useState(false);
  const [isShortTerm, setIsShortTerm] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("THB");
  const [highSeasonOccupancy, setHighSeasonOccupancy] = useState(
    DEFAULT_HIGH_OCCUPANCY
  );
  const [lowSeasonOccupancy, setLowSeasonOccupancy] = useState(
    DEFAULT_LOW_OCCUPANCY
  );
  const [houses, setHouses] = useState([]);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [customPrices, setCustomPrices] = useState({ ...EMPTY_CUSTOM_PRICES });
  const [exchangeRates, setExchangeRates] = useState({
  THB: 1,
  EUR: 0.026,
  USD: 0.029,
  ILS: 0.107,
});

  const selectedLocationData = useMemo(() => {
    return getSelectedLocationData(houseInventory, selectedLocationId);
  }, [selectedLocationId]);

  const selectedHouseTypeData = useMemo(() => {
    return getSelectedHouseTypeData(
      houseTypeConfigs,
      selectedLocationId,
      selectedHouse
    );
  }, [selectedLocationId, selectedHouse]);

  const calculatedData = useMemo(() => {
    if (!selectedHouse || !selectedHouseTypeData) return null;

    return calculateROI({
      houseTypeData: selectedHouseTypeData,
      highOccupancy: highSeasonOccupancy,
      lowOccupancy: lowSeasonOccupancy,
      nightlyHigh: customPrices.highSeasonNightlyPrice,
      nightlyLow: customPrices.lowSeasonNightlyPrice,
      monthlyHigh: customPrices.highSeasonMonthlyPrice,
      monthlyLow: customPrices.lowSeasonMonthlyPrice,
      housePrice: customPrices.housePrice,
      shortTermFeeRate:
        selectedLocationData?.defaults?.shortTermManagementFee ||
        DEFAULT_SHORT_TERM_FEE,
      longTermFeeRate:
        selectedLocationData?.defaults?.longTermManagementFee ||
        DEFAULT_LONG_TERM_FEE,
    });
  }, [
    selectedHouse,
    selectedHouseTypeData,
    highSeasonOccupancy,
    lowSeasonOccupancy,
    customPrices,
    selectedLocationData,
  ]);

  useEffect(() => {
    const backgroundImage = getLocationBackground(
      selectedLocationData?.displayName
    );
  

    document.body.style.backgroundImage = `url(${backgroundImage})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    setHouses(selectedLocationData?.houses || []);
    setHighSeasonOccupancy(
      selectedLocationData?.defaults?.highSeasonOccupancy ||
        DEFAULT_HIGH_OCCUPANCY
    );
    setLowSeasonOccupancy(
      selectedLocationData?.defaults?.lowSeasonOccupancy ||
        DEFAULT_LOW_OCCUPANCY
    );
  }, [selectedLocationData]);

  useEffect(() => {
    fetchExchangeRates().then(setExchangeRates);
  }, []);

  const updateCustomPrice = (field, value) => {
    setCustomPrices((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const convertMoney = (amount) => {
    return convertFromTHB(amount, selectedCurrency, exchangeRates);
  };

  const resetSelectionState = () => {
    setSelectedHouse(null);
    setShowAlternateResults(false);
    setCustomPrices({ ...EMPTY_CUSTOM_PRICES });
  };

  const handleLocationChange = (event) => {
    const locationId = event.target.value;
    setSelectedLocationId(locationId);
    resetSelectionState();
  };

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  const handleHouseClick = (houseId) => {
    const house = getHouseByUnitNumber(houses, houseId);
    if (!house) return;

    const houseTypeData = getSelectedHouseTypeData(
      houseTypeConfigs,
      selectedLocationId,
      house
    );

    if (!houseTypeData) {
      console.error("House type not found for:", house.typeId);
      return;
    }

    setSelectedHouse(house);

    setCustomPrices({
      housePrice: house.price,
      highSeasonNightlyPrice: houseTypeData.pricing.highSeasonAvgNightPrice,
      lowSeasonNightlyPrice: houseTypeData.pricing.lowSeasonAvgNightPrice,
      highSeasonMonthlyPrice: houseTypeData.pricing.highSeasonMonthlyPrice,
      lowSeasonMonthlyPrice: houseTypeData.pricing.lowSeasonMonthlyPrice,
    });
  };

  const handleOpenShortTerm = () => {
    setShowAlternateResults(true);
    setIsShortTerm(true);
  };

  const handleOpenLongTerm = () => {
    setShowAlternateResults(true);
    setIsShortTerm(false);
  };

  const handleDetailsBack = () => {
    setShowAlternateResults(false);
  };

  const handleHouseBack = () => {
    setSelectedHouse(null);
    setShowAlternateResults(false);
  };

  return (
    <div className="App">
      <h1>Satori Investment Options</h1>

      <LocationSelector
        locations={houseInventory.locations}
        selectedLocation={selectedLocationId}
        onChange={handleLocationChange}
      />

      <CurrencySelector
        selectedCurrency={selectedCurrency}
        onChange={handleCurrencyChange}
      />

      {selectedLocationId && !selectedHouse && (
        <HouseOverlayMap
          houses={houses}
          imageDimensions={imageDimensions}
          onHouseClick={handleHouseClick}
        />
      )}

      {selectedHouse && calculatedData && (
        <div>
          {showAlternateResults ? (
            isShortTerm ? (
              <ShortTermView
                customPrices={customPrices}
                calculatedData={calculatedData}
                selectedCurrency={selectedCurrency}
                convertMoney={convertMoney}
                highSeasonOccupancy={highSeasonOccupancy}
                lowSeasonOccupancy={lowSeasonOccupancy}
                onHighSeasonNightlyPriceChange={(value) =>
                  updateCustomPrice("highSeasonNightlyPrice", value)
                }
                onLowSeasonNightlyPriceChange={(value) =>
                  updateCustomPrice("lowSeasonNightlyPrice", value)
                }
                onHighSeasonOccupancyChange={setHighSeasonOccupancy}
                onLowSeasonOccupancyChange={setLowSeasonOccupancy}
                onBack={handleDetailsBack}
              />
            ) : (
              <LongTermView
                customPrices={customPrices}
                calculatedData={calculatedData}
                selectedCurrency={selectedCurrency}
                convertMoney={convertMoney}
                onHighSeasonMonthlyPriceChange={(value) =>
                  updateCustomPrice("highSeasonMonthlyPrice", value)
                }
                onLowSeasonMonthlyPriceChange={(value) =>
                  updateCustomPrice("lowSeasonMonthlyPrice", value)
                }
                onBack={handleDetailsBack}
              />
            )
          ) : (
            <HouseSummaryView
              selectedHouse={selectedHouse}
              customPrices={customPrices}
              calculatedData={calculatedData}
              selectedCurrency={selectedCurrency}
              convertMoney={convertMoney}
              onHousePriceChange={(value) =>
                updateCustomPrice("housePrice", value)
              }
              onOpenShortTerm={handleOpenShortTerm}
              onOpenLongTerm={handleOpenLongTerm}
              onBack={handleHouseBack}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
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
            Sign in with your <b>@{AUTH_ALLOWED_HD}</b> Google account to
            continue.
          </p>

          <div className="auth-actions">
            <GoogleLogin
              onSuccess={(res) => {
                const idToken = res?.credential;

                if (!idToken) {
                  alert("No credential received from Google.");
                  return;
                }

                signIn(idToken).catch((e) =>
                  alert(e.message || "Login failed")
                );
              }}
              onError={() => alert("Google sign-in failed")}
              useOneTap
            />
          </div>

          <div className="auth-sep" />

          <div className="auth-footer">
            <span>Protected access</span>
            <span className="auth-dot">•</span>
            <span>{AUTH_ALLOWED_HD}</span>
          </div>
        </div>
      </div>
    );
  }

  return <AppInner />;
}