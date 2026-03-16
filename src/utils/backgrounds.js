import SatoriHaadYaoAbove from "../SatoriHaadYaoAbove.webp";
import SatoriThongSalaUniAbove from "../SatoriThongSalaUniAbove.jpg";
import SatoriHinKongVillas from "../SatoriHinKongVillas.jpg";

export function getLocationBackground(locationName) {
  switch (locationName) {
    case "Haad Yao":
      return SatoriHaadYaoAbove;
    case "Thong Sala Uni":
      return SatoriThongSalaUniAbove;
    case "Hin Kong Villas":
      return SatoriHinKongVillas;
    default:
      return SatoriThongSalaUniAbove;
  }
}