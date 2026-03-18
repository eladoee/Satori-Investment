import GroupLogoWhite from "../assets/logos/group/logo-white-h.png";
import HaadYaoLogoWhite from "../assets/logos/haad-yao/logo-white-h.png";
import HinKongLogoWhite from "../assets/logos/hin-kong/logo-white-h.png";
import TierraBayLogoWhite from "../assets/logos/tierra-bay/logo-white-h.png";

export const GROUP_BRANDING = {
  logo: GroupLogoWhite,
  alt: "Satori Group",
};

export const LOCATION_BRANDING = {
  "haad-yao": {
    logo: HaadYaoLogoWhite,
    alt: "Satori Haad Yao",
  },
  "hin-kong-villas": {
    logo: HinKongLogoWhite,
    alt: "Satori Hin Kong Villas",
  },
  "tierra-bay": {
    logo: TierraBayLogoWhite,
    alt: "Satori Tierra Bay",
  },
};

export function getLocationBranding(locationId) {
  return LOCATION_BRANDING[locationId] || null;
}