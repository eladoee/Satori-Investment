const fs = require("fs");
const path = require("path");

const oldInventory = require("../src/HouseInventory.json");
const oldTypes = require("../src/HouseTypes.json");

const LOCATION_ID_MAP = {
  "Haad Yao": "haad-yao",
  "Thong Sala Uni": "thong-sala-uni",
  "Hin Kong Villas": "hin-kong-villas",
};

const TYPE_ID_MAP = {
  "Haad Yao": {
    beachfront: "beachfront",
    beachfront_small: "beachfront-small",
    back: "back",
  },
  "Thong Sala Uni": {
    studio: "studio",
    one_bedroom: "one-bedroom",
    two_bedroom: "two-bedroom",
  },
  "Hin Kong Villas": {
    "1st Line": "first-line",
    "2nd Line": "second-line",
    "3rd Line": "third-line",
  },
};

function toDisplayType(locationName, rawType) {
  const displayMap = {
    beachfront: "Beachfront",
    beachfront_small: "Beachfront Small",
    back: "Back",
    studio: "Studio",
    one_bedroom: "One Bedroom",
    two_bedroom: "Two Bedroom",
    "1st Line": "1st Line",
    "2nd Line": "2nd Line",
    "3rd Line": "3rd Line",
  };

  return displayMap[rawType] || rawType;
}

function mapInventory() {
  return {
    locations: oldInventory.locations.map((location) => ({
      locationId: LOCATION_ID_MAP[location.locationName],
      displayName: location.locationName,
      defaults: {
        highSeasonOccupancy: location.highSeasonOccupancy,
        lowSeasonOccupancy: location.lowSeasonOccupancy,
        shortTermManagementFee: location.shortTermManagementFee,
        longTermManagementFee: location.longTermManagementFee,
      },
      houses: location.houses.map((house) => ({
        unitNumber: house.unitNumber,
        typeId: TYPE_ID_MAP[location.locationName][house.type],
        plotAreaSqm: house.plotArea_sqm,
        bedrooms: house.bedrooms,
        usableAreaGrossSqm: house.usableArea_gross_sqm,
        floors: house.floors,
        price: house.price,
        imageCoordinates: house.image_coordinates,
      })),
    })),
  };
}

function mapTypes() {
  return {
    locations: oldTypes.locations.map((location) => ({
      locationId: LOCATION_ID_MAP[location.name],
      types: location.houses.map((typeConfig) => {
        const isHinKongThirdLine =
          location.name === "Hin Kong Villas" &&
          typeConfig.type === "3rd Line";

        return {
          typeId: TYPE_ID_MAP[location.name][typeConfig.type],
          displayName: toDisplayType(location.name, typeConfig.type),
          pricing: {
            highSeasonAvgNightPrice:
              typeConfig.pricing.high_season_avg_night_price,
            lowSeasonAvgNightPrice:
              typeConfig.pricing.low_season_avg_night_price,
            highSeasonMonthlyPrice: isHinKongThirdLine
              ? 380000
              : typeConfig.pricing.high_season_monthly_price,
            lowSeasonMonthlyPrice: isHinKongThirdLine
              ? 380000
              : typeConfig.pricing.low_season_monthly_price,
          },
          expenses: {
            water: typeConfig.expenses.water,
            electricity: typeConfig.expenses.electricity,
            internet: typeConfig.expenses.internet,
            wearAndTear: typeConfig.expenses.wear_and_tear,
            longTermTotal: typeConfig.expenses.long_term_total,
          },
        };
      }),
    })),
  };
}

function writeJson(targetPath, data) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

const newInventory = mapInventory();
const newTypeConfigs = mapTypes();

writeJson(path.join(__dirname, "../src/data/houseInventory.json"), newInventory);
writeJson(
  path.join(__dirname, "../src/data/houseTypeConfigs.json"),
  newTypeConfigs
);

console.log("Done:");
console.log("- src/data/houseInventory.json");
console.log("- src/data/houseTypeConfigs.json");