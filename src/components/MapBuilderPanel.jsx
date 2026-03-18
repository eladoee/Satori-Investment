import { useMemo, useState } from "react";

function pointsToPath(points) {
  if (!points.length) return "";
  const [first, ...rest] = points;
  const commands = [`M${first.x},${first.y}`];

  rest.forEach((point) => {
    commands.push(`L${point.x},${point.y}`);
  });

  commands.push("Z");
  return commands.join(" ");
}

export default function MapBuilderPanel({
  imageDimensions,
  imageRef,
}) {
  const [points, setPoints] = useState([]);
  const [copied, setCopied] = useState(false);

  const pathValue = useMemo(() => pointsToPath(points), [points]);

  const handleOverlayClick = (event) => {
    if (!imageRef?.current || !imageDimensions.width || !imageDimensions.height) {
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();

    const x = Math.round(
      ((event.clientX - rect.left) / rect.width) * imageDimensions.width
    );
    const y = Math.round(
      ((event.clientY - rect.top) / rect.height) * imageDimensions.height
    );

    setPoints((prev) => [...prev, { x, y }]);
    setCopied(false);
  };

  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1));
    setCopied(false);
  };

  const handleClear = () => {
    setPoints([]);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!pathValue) return;

    try {
      await navigator.clipboard.writeText(pathValue);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy path:", error);
      setCopied(false);
    }
  };

  return (
    <>
      <div className="map-builder-toolbar">
        <button type="button" onClick={handleUndo} disabled={!points.length}>
          Undo Last Point
        </button>
        <button type="button" onClick={handleClear} disabled={!points.length}>
          Clear Points
        </button>
        <button type="button" onClick={handleCopy} disabled={!pathValue}>
          {copied ? "Copied" : "Copy SVG Path"}
        </button>
      </div>

      <svg
        className="map-builder-overlay"
        viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleOverlayClick}
      >
        {points.length > 0 && (
          <>
            <path
              d={pathValue}
              className="map-builder-preview-path"
            />
            {points.map((point, index) => (
              <g key={`${point.x}-${point.y}-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="14"
                  className="map-builder-point"
                />
                <text
                  x={point.x + 18}
                  y={point.y - 18}
                  className="map-builder-label"
                >
                  {index + 1}
                </text>
              </g>
            ))}
          </>
        )}
      </svg>

      <div className="map-builder-output">
        <div className="map-builder-output-title">SVG Path</div>
        <textarea
          readOnly
          value={pathValue}
          className="map-builder-textarea"
          placeholder="Click points on the image to generate a path"
        />
      </div>
    </>
  );
}