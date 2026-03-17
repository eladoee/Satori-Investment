const STORAGE_KEY = "roi_config_overrides";

export function isConfigModeEnabled() {
  const params = new URLSearchParams(window.location.search);
  return params.get("config") === "1";
}

export function loadConfigOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveConfigOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function clearConfigOverrides() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportConfigOverrides(overrides) {
  const blob = new Blob([JSON.stringify(overrides, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  link.href = url;
  link.download = `roi-config-overrides-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function buildHouseOverrideKey(locationId, unitNumber) {
  return `${locationId}::house::${unitNumber}`;
}

export function buildTypeOverrideKey(locationId, typeId) {
  return `${locationId}::type::${typeId}`;
}

export function buildLocationDefaultsKey(locationId) {
  return `${locationId}::defaults`;
}

export function mergeHouseWithOverrides(house, override = {}) {
  return {
    ...house,
    ...override,
  };
}

export function mergeTypeWithOverrides(typeConfig, override = {}) {
  return {
    ...typeConfig,
    pricing: {
      ...typeConfig.pricing,
      ...(override.pricing || {}),
    },
  };
}

export function mergeLocationDefaultsWithOverrides(location, override = {}) {
  return {
    ...location,
    defaults: {
      ...location.defaults,
      ...(override.defaults || {}),
    },
  };
}