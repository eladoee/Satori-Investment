export default function HouseOverlayMap({
  houses,
  imageDimensions,
  onHouseClick,
  onHouseHover,
}) {
  if (!houses.length) return null;
  if (!imageDimensions.width || !imageDimensions.height) return null;

  return (
    <svg
      className="svg-overlay"
      viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {houses.map((house) => {
        if (!house.imageCoordinates) return null;

        return (
          <path
            key={house.unitNumber}
            d={house.imageCoordinates}
            className="clickable-area"
            onClick={() => onHouseClick(house.unitNumber)}
            onMouseEnter={() => onHouseHover?.(house)}
            onMouseLeave={() => onHouseHover?.(null)}
          />
        );
      })}
    </svg>
  );
}