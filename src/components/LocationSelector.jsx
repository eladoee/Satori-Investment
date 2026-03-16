export default function LocationSelector({
  locations,
  selectedLocation,
  onChange,
}) {
  return (
    <div className="location-selection">
      <label htmlFor="location-select">Location: </label>
      <select
        id="location-select"
        onChange={onChange}
        value={selectedLocation}
      >
        <option value="">--Select a location--</option>
        {locations.map((loc) => (
          <option key={loc.locationId} value={loc.locationId}>
            {loc.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}