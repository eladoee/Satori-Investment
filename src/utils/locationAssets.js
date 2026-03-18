import HaadYaoBeachMap from "../assets/maps/haad-yao-beach.webp";
import ThongSalaUniMap from "../assets/maps/thong-sala-uni.jpg";
import HinKongVillasMap from "../assets/maps/hin-kong-villas.jpg";
import TierraBayMap from "../assets/maps/tierra-bay.jpg";

export const LOCATION_ASSETS = {
  "haad-yao": {
    image: HaadYaoBeachMap,
    alt: "Haad Yao Beach map",
  },
  "thong-sala-uni": {
    image: ThongSalaUniMap,
    alt: "Thong Sala Uni map",
  },
  "hin-kong-villas": {
    image: HinKongVillasMap,
    alt: "Hin Kong Villas map",
  },
  "tierra-bay": {
    image: TierraBayMap,
    alt: "Tierra Bay map",
  },
};

export function getLocationAsset(locationId) {
  return LOCATION_ASSETS[locationId] || null;
}