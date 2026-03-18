export default function PresentationButton({
  presentationUrl,
  presentationLabel = "View Presentation",
}) {
  if (!presentationUrl) return null;

  return (
    <button
      type="button"
      className="presentation-button"
      onClick={() => openModal()}
    >
      {presentationLabel}
    </button>
  );
}