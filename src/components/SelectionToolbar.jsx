import { getLocationBranding } from "../utils/locationBranding";

export default function SelectionToolbar({
  selectedLocationId,
  selectedLocation,
  selectedCurrency,
  onLocationChange,
  onCurrencyChange,
  locations,
  configMode,
  showCurrency = true,
  showPresentation = false,
  onPresentationClick,
}) {
  const branding = getLocationBranding(selectedLocationId);

  return (
    <div className="selection-toolbar">
      <div className="selection-toolbar-left">
        {branding?.logo && (
          <img
            src={branding.logo}
            alt={branding.alt}
            className="selection-toolbar-logo"
          />
        )}

        <div className="selection-toolbar-copy">
          <div className="selection-toolbar-title">Investment Options</div>
          <div className="selection-toolbar-subtitle">
            Explore villas, ROI and pricing
          </div>
        </div>
      </div>

      <div className="selection-toolbar-right">
        {configMode && <div className="inline-config-badge">Config</div>}

        <div className="toolbar-control">
          <label htmlFor="toolbar-location-select">Location</label>
          <select
            id="toolbar-location-select"
            value={selectedLocation}
            onChange={onLocationChange}
          >
            <option value="">Back to Home</option>
            {locations.map((loc) => (
              <option key={loc.locationId} value={loc.locationId}>
                {loc.displayName}
              </option>
            ))}
          </select>
        </div>

        {showCurrency && (
          <div className="toolbar-control">
            <label htmlFor="toolbar-currency-select">Currency</label>
            <select
              id="toolbar-currency-select"
              value={selectedCurrency}
              onChange={onCurrencyChange}
            >
              <option value="THB">THB ฿</option>
              <option value="EUR">EUR €</option>
              <option value="USD">USD $</option>
              <option value="ILS">ILS ₪</option>
            </select>
          </div>
        )}

        {showPresentation && (
          <button
            type="button"
            className="toolbar-presentation-button"
            onClick={onPresentationClick}
          >
            Presentation
          </button>
        )}
      </div>
    </div>
  );
}