import React from "react";

export default function PresentationModal({
  isOpen,
  cover,
  title,
  presentationUrl,
  onClose,
}) {
  if (!isOpen) return null;

  const handleOpenPresentation = () => {
    if (!presentationUrl) return;
    window.open(presentationUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="presentation-modal-backdrop" onClick={onClose}>
      <div
        className="presentation-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="presentation-modal-close-x"
          onClick={onClose}
          aria-label="Close presentation"
        >
          ×
        </button>

        {cover && (
          <img
            src={cover}
            className="presentation-cover"
            alt={`${title} presentation cover`}
          />
        )}

        <div className="presentation-modal-content">
          <div className="presentation-modal-eyebrow">
            Property Presentation
          </div>

          <h2>{title}</h2>

          <p className="presentation-modal-copy">
            Preview the brochure cover, then open the full presentation.
          </p>

          <div className="presentation-modal-actions">
            <button
              type="button"
              className="presentation-open-button"
              onClick={handleOpenPresentation}
            >
              Open Presentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}