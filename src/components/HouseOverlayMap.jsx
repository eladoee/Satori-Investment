import { adjustCoordinates } from "../utils/imageMap";

export default function HouseOverlayMap({
  houses,
  imageDimensions,
  onHouseClick,
}) {
  if (!houses.length) return null;

  return (
    <svg className="svg-overlay" xmlns="http://www.w3.org/2000/svg">
      {houses.map((house) => (
        <path
          key={house.unitNumber}
          d={adjustCoordinates(house.imageCoordinates, imageDimensions)}
          fill="rgba(255, 255, 255, 0.3)"
          stroke="black"
          strokeWidth="1"
          className="clickable-area"
          onClick={() => onHouseClick(house.unitNumber)}
        />
      ))}
    </svg>
  );
}