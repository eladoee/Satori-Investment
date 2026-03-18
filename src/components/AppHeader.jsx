import { GROUP_BRANDING } from "../utils/locationBranding";

export default function AppHeader() {
  return (
    <div className="landing-hero">
      <div className="landing-hero-glow" />

      <img
        src={GROUP_BRANDING.logo}
        alt={GROUP_BRANDING.alt}
        className="group-logo landing-group-logo"
      />

      <p className="landing-subtitle landing-subtitle-compact">
        Explore curated Satori developments and review villa investment opportunities.
      </p>
    </div>
  );
}