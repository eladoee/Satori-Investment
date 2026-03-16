export function adjustCoordinates(path, imageDimensions) {
  if (!path || typeof path !== "string") return "";

  const { width, height } = imageDimensions;

  if (!width || !height) return path;

  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;

  const scaleX = containerWidth / width;
  const scaleY = containerHeight / height;
  const scale = Math.max(scaleX, scaleY);

  const cropOffsetX = (width * scale - containerWidth) / 2 / scale;
  const cropOffsetY = (height * scale - containerHeight) / 2 / scale;

  return path.replace(/([MC])([0-9.,\s]+)/g, (_, command, coords) => {
    const points = coords
      .trim()
      .split(/\s+/)
      .map((pair) => {
        const [x, y] = pair.split(",").map(parseFloat);

        const adjustedX = (x - cropOffsetX) * scale;
        const adjustedY = (y - cropOffsetY) * scale;

        return `${adjustedX},${adjustedY}`;
      });

    return `${command} ${points.join(" ")}`;
  });
}