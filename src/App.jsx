import React, { useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import "./App.css";
import houseInventory from "./data/houseInventory.json";
import houseTypeConfigs from "./data/houseTypeConfigs.json";
import AppHeader from "./components/AppHeader";
import SelectionToolbar from "./components/SelectionToolbar";

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
import LocationMapPanel from "./components/LocationMapPanel";
import PresentationModal from "./components/PresentationModal";
import { convertFromTHB } from "./utils/currency";
import { fetchExchangeRates } from "./utils/exchangeRates";
import { safePrice, safeOccupancy } from "./utils/inputGuards";
import {
  isConfigModeEnabled,
  loadConfigOverrides,
  saveConfigOverrides,
  clearConfigOverrides,
  buildHouseOverrideKey,
  buildTypeOverrideKey,
  buildLocationDefaultsKey,
  mergeHouseWithOverrides,
  mergeTypeWithOverrides,
  mergeLocationDefaultsWithOverrides,
} from "./utils/configMode";

import LocationSelector from "./components/LocationSelector";
import HouseSummaryView from "./components/HouseSummaryView";
import ShortTermView from "./components/ShortTermView";
import LongTermView from "./components/LongTermView";

function AppInner() {
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showAlternateResults, setShowAlternateResults] = useState(false);
  const [isShortTerm, setIsShortTerm] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("THB");
  const [configMode] = useState(isConfigModeEnabled());
  const [configOverrides, setConfigOverrides] = useState(loadConfigOverrides());
  const [exchangeRates, setExchangeRates] = useState({
    THB: 1,
    EUR: 0.026,
    USD: 0.029,
    ILS: 0.107,
  });
  const [highSeasonOccupancy, setHighSeasonOccupancy] = useState(
    DEFAULT_HIGH_OCCUPANCY
  );
  const [lowSeasonOccupancy, setLowSeasonOccupancy] = useState(
    DEFAULT_LOW_OCCUPANCY
  );
  const [houses, setHouses] = useState([]);
  const [customPrices, setCustomPrices] = useState({ ...EMPTY_CUSTOM_PRICES });
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  useEffect(() => {
    fetchExchangeRates().then(setExchangeRates);
  }, []);

  const selectedLocationData = useMemo(() => {
    const baseLocation = getSelectedLocationData(
      houseInventory,
      selectedLocationId
    );
    if (!baseLocation) return null;

    const locationOverride =
      configOverrides[buildLocationDefaultsKey(selectedLocationId)] || {};

    return mergeLocationDefaultsWithOverrides(baseLocation, locationOverride);
  }, [selectedLocationId, configOverrides]);

  const selectedHouseTypeData = useMemo(() => {
    const baseType = getSelectedHouseTypeData(
      houseTypeConfigs,
      selectedLocationId,
      selectedHouse
    );

    if (!baseType || !selectedHouse) return baseType;

    const typeOverride =
      configOverrides[
        buildTypeOverrideKey(selectedLocationId, selectedHouse.typeId)
      ] || {};

    return mergeTypeWithOverrides(baseType, typeOverride);
  }, [selectedLocationId, selectedHouse, configOverrides]);

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
    const baseHouses = selectedLocationData?.houses || [];
    const mergedHouses = baseHouses.map((house) => {
      const houseOverride =
        configOverrides[
          buildHouseOverrideKey(selectedLocationId, house.unitNumber)
        ] || {};
      return mergeHouseWithOverrides(house, houseOverride);
    });

    setHouses(mergedHouses);
    setHighSeasonOccupancy(
      selectedLocationData?.defaults?.highSeasonOccupancy ||
        DEFAULT_HIGH_OCCUPANCY
    );
    setLowSeasonOccupancy(
      selectedLocationData?.defaults?.lowSeasonOccupancy ||
        DEFAULT_LOW_OCCUPANCY
    );
  }, [selectedLocationData, selectedLocationId, configOverrides]);

  const persistOverrides = (next) => {
    setConfigOverrides(next);
    saveConfigOverrides(next);
  };

  const updateCustomPrice = (field, value) => {
    const safeValue = safePrice(value);

    setCustomPrices((prev) => ({
      ...prev,
      [field]: safeValue,
    }));
  };

  const convertMoney = (amount) => {
    return convertFromTHB(amount, selectedCurrency, exchangeRates);
  };

  const exitConfigMode = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("config");
    window.location.href = url.toString();
  };

  const resetSelectionState = () => {
    setSelectedHouse(null);
    setShowAlternateResults(false);
    setCustomPrices({ ...EMPTY_CUSTOM_PRICES });
    setIsPresentationOpen(false);
  };

  const handleLocationChange = (event) => {
    const locationId = event.target.value;
    setSelectedLocationId(locationId);
    resetSelectionState();
  };

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  const openPresentation = () => {
    setIsPresentationOpen(true);
  };

  const closePresentation = () => {
    setIsPresentationOpen(false);
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

    const typeOverride =
      configOverrides[
        buildTypeOverrideKey(selectedLocationId, house.typeId)
      ] || {};

    const mergedType = mergeTypeWithOverrides(houseTypeData, typeOverride);

    setSelectedHouse(house);
    setCustomPrices({
      housePrice: house.price,
      highSeasonNightlyPrice: mergedType.pricing.highSeasonAvgNightPrice,
      lowSeasonNightlyPrice: mergedType.pricing.lowSeasonAvgNightPrice,
      highSeasonMonthlyPrice: mergedType.pricing.highSeasonMonthlyPrice,
      lowSeasonMonthlyPrice: mergedType.pricing.lowSeasonMonthlyPrice,
    });
  };

  const handleSaveHousePrice = (value) => {
    updateCustomPrice("housePrice", value);

    if (!configMode || !selectedHouse) return;

    const key = buildHouseOverrideKey(
      selectedLocationId,
      selectedHouse.unitNumber
    );

    persistOverrides({
      ...configOverrides,
      [key]: {
        ...(configOverrides[key] || {}),
        price: value,
      },
    });
  };

  const handleSaveTypePricing = (field, value) => {
    updateCustomPrice(field, value);

    if (!configMode || !selectedHouse) return;

    const key = buildTypeOverrideKey(selectedLocationId, selectedHouse.typeId);

    const pricingFieldMap = {
      highSeasonNightlyPrice: "highSeasonAvgNightPrice",
      lowSeasonNightlyPrice: "lowSeasonAvgNightPrice",
      highSeasonMonthlyPrice: "highSeasonMonthlyPrice",
      lowSeasonMonthlyPrice: "lowSeasonMonthlyPrice",
    };

    persistOverrides({
      ...configOverrides,
      [key]: {
        ...(configOverrides[key] || {}),
        pricing: {
          ...(configOverrides[key]?.pricing || {}),
          [pricingFieldMap[field]]: safePrice(value),
        },
      },
    });
  };

  const handleSaveLocationOccupancy = (field, value) => {
    const safeValue = safeOccupancy(value);

    if (field === "highSeasonOccupancy") {
      setHighSeasonOccupancy(safeValue);
    } else {
      setLowSeasonOccupancy(safeValue);
    }

    if (!configMode || !selectedLocationId) return;

    const key = buildLocationDefaultsKey(selectedLocationId);

    persistOverrides({
      ...configOverrides,
      [key]: {
        ...(configOverrides[key] || {}),
        defaults: {
          ...(configOverrides[key]?.defaults || {}),
          [field]: value,
        },
      },
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

  const handleResetOverrides = () => {
    const confirmed = window.confirm(
      "Reset all local config overrides? This cannot be undone."
    );

    if (!confirmed) return;

    clearConfigOverrides();
    setConfigOverrides({});
    setSelectedHouse(null);
    setShowAlternateResults(false);
    setCustomPrices({ ...EMPTY_CUSTOM_PRICES });

    if (selectedLocationData?.defaults) {
      setHighSeasonOccupancy(
        selectedLocationData.defaults.highSeasonOccupancy ||
          DEFAULT_HIGH_OCCUPANCY
      );
      setLowSeasonOccupancy(
        selectedLocationData.defaults.lowSeasonOccupancy ||
          DEFAULT_LOW_OCCUPANCY
      );
    } else {
      setHighSeasonOccupancy(DEFAULT_HIGH_OCCUPANCY);
      setLowSeasonOccupancy(DEFAULT_LOW_OCCUPANCY);
    }
  };

  return (
    <div className="App app-shell-wide">
      {!selectedLocationId ? (
        <>
          <AppHeader />

          <div className="landing-selector-wrap">
            <div className="landing-selector-label">Choose a Project</div>

            <div className="landing-selector-control">
              <LocationSelector
                locations={houseInventory.locations}
                selectedLocation={selectedLocationId}
                onChange={handleLocationChange}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <SelectionToolbar
            selectedLocationId={selectedLocationId}
            selectedLocation={selectedLocationId}
            selectedCurrency={selectedCurrency}
            onLocationChange={handleLocationChange}
            onCurrencyChange={handleCurrencyChange}
            locations={houseInventory.locations}
            configMode={configMode}
            showCurrency={!!selectedHouse}
            showPresentation={
              !selectedHouse && !!selectedLocationData?.presentationUrl
            }
            onPresentationClick={openPresentation}
          />

          {configMode && (
            <div className="config-toolbar">
              <div className="config-actions">
                <button type="button" onClick={exitConfigMode}>
                  Exit Config Mode
                </button>

                <button type="button" onClick={handleResetOverrides}>
                  Reset Overrides
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedLocationId && !selectedHouse && (
        <LocationMapPanel
          locationId={selectedLocationId}
          houses={houses}
          onHouseClick={handleHouseClick}
          configMode={configMode}
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
                  handleSaveTypePricing("highSeasonNightlyPrice", value)
                }
                onLowSeasonNightlyPriceChange={(value) =>
                  handleSaveTypePricing("lowSeasonNightlyPrice", value)
                }
                onHighSeasonOccupancyChange={(value) =>
                  handleSaveLocationOccupancy("highSeasonOccupancy", value)
                }
                onLowSeasonOccupancyChange={(value) =>
                  handleSaveLocationOccupancy("lowSeasonOccupancy", value)
                }
                onBack={handleDetailsBack}
              />
            ) : (
              <LongTermView
                customPrices={customPrices}
                calculatedData={calculatedData}
                selectedCurrency={selectedCurrency}
                convertMoney={convertMoney}
                onHighSeasonMonthlyPriceChange={(value) =>
                  handleSaveTypePricing("highSeasonMonthlyPrice", value)
                }
                onLowSeasonMonthlyPriceChange={(value) =>
                  handleSaveTypePricing("lowSeasonMonthlyPrice", value)
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
              onHousePriceChange={handleSaveHousePrice}
              onOpenShortTerm={handleOpenShortTerm}
              onOpenLongTerm={handleOpenLongTerm}
              onBack={handleHouseBack}
            />
          )}
        </div>
      )}

      <PresentationModal
        isOpen={isPresentationOpen}
        cover={selectedLocationData?.presentationCoverImage}
        title={selectedLocationData?.displayName}
        presentationUrl={selectedLocationData?.presentationUrl}
        onClose={closePresentation}
      />
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