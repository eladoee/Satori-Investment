import { useEffect, useRef, useState } from "react";
import { getLocationAsset } from "../utils/locationAssets";
import HouseOverlayMap from "./HouseOverlayMap";
import MapBuilderPanel from "./MapBuilderPanel";

function formatTHB(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

export default function LocationMapPanel({
  locationId,
  houses,
  onHouseClick,
  configMode = false,
}) {
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [mapBuilderEnabled, setMapBuilderEnabled] = useState(false);
  const [hoveredHouse, setHoveredHouse] = useState(null);
  const imageRef = useRef(null);

  const asset = getLocationAsset(locationId);

  useEffect(() => {
    if (!asset?.image) {
      setImageDimensions({ width: 0, height: 0 });
      return;
    }

    const img = new Image();
    img.src = asset.image;
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
  }, [asset]);

  const getBadgePosition = (path) => {
    if (!path) return { left: "50%", top: "50%" };

    const points = [...path.matchAll(/(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g)].map(
      (match) => ({
        x: parseFloat(match[1]),
        y: parseFloat(match[2]),
      })
    );

    if (!points.length || !imageDimensions.width || !imageDimensions.height) {
      return { left: "50%", top: "50%" };
    }

    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));

    return {
      left: `${(((minX + maxX) / 2) / imageDimensions.width) * 100}%`,
      top: `${(minY / imageDimensions.height) * 100}%`,
    };
  };

  if (!asset) return null;

  return (
    <div className="map-panel">
      {configMode && (
        <div className="map-builder-toggle-row">
          <button
            type="button"
            onClick={() => setMapBuilderEnabled((prev) => !prev)}
          >
            {mapBuilderEnabled ? "Close Mapping Mode" : "Open Mapping Mode"}
          </button>
        </div>
      )}

      <div className="map-image-wrapper">
        <img
          ref={imageRef}
          src={asset.image}
          alt={asset.alt}
          className="map-image"
        />

        {!mapBuilderEnabled && (
          <HouseOverlayMap
            houses={houses}
            imageDimensions={imageDimensions}
            onHouseClick={onHouseClick}
            onHouseHover={setHoveredHouse}
          />
        )}

        {mapBuilderEnabled && (
          <MapBuilderPanel
            imageDimensions={imageDimensions}
            imageRef={imageRef}
          />
        )}

        {!mapBuilderEnabled && hoveredHouse && (
          <div
            className="villa-hover-badge"
            style={getBadgePosition(hoveredHouse.imageCoordinates)}
          >
            <div className="villa-hover-badge-title">
              Villa {hoveredHouse.unitNumber}
            </div>
            <div className="villa-hover-badge-subtitle">
              {hoveredHouse.bedrooms} Bedrooms
            </div>
            <div className="villa-hover-badge-price">
              ฿{formatTHB(hoveredHouse.price)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}