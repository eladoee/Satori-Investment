export function getSelectedLocationData(houseInventory, selectedLocationId) {
  return (
    houseInventory.locations.find(
      (location) => location.locationId === selectedLocationId
    ) || null
  );
}

export function getSelectedHouseTypeData(
  houseTypeConfigs,
  selectedLocationId,
  selectedHouse
) {
  if (!selectedLocationId || !selectedHouse) return null;

  const locationConfig = houseTypeConfigs.locations.find(
    (location) => location.locationId === selectedLocationId
  );

  return (
    locationConfig?.types.find(
      (typeConfig) => typeConfig.typeId === selectedHouse.typeId
    ) || null
  );
}

export function getHouseByUnitNumber(houses, houseId) {
  return houses.find((house) => house.unitNumber === houseId) || null;
}