import React, { useState, useEffect } from "react";
import { X, Send, Image as ImageIcon } from "lucide-react";

export const ImageCaptionModal = ({
  file,
  isOpen,
  onClose,
  onSend,
  uploading,
}) => {
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCaption("");
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (uploading) return;
    onSend(file, caption.trim());
  };

  return (
    <div className="modal-backdrop image-caption-backdrop">
      <div className="image-caption-modal-container">
        <div className="image-caption-header">
          <div className="image-caption-title">
            <ImageIcon size={18} />
            <span>Send Photo</span>
          </div>
          <button
            type="button"
            className="icon-close-button"
            onClick={onClose}
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="image-caption-preview-box">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Selected Preview"
              className="image-caption-img"
            />
          )}
        </div>

        <form onSubmit={handleSubmit} className="image-caption-form">
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={uploading}
            autoFocus
          />
          <button
            type="submit"
            className="image-caption-send-btn"
            disabled={uploading}
            title="Send Photo"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
