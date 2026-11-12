import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const Toast = ({ message, type = "info", duration = 4000, onClose }) => {
  useEffect(() => {
    if (!duration || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const renderIcon = () => {
    switch (type) {
      case "success":
        return (
          <CheckCircle2 size={18} className="toast-icon toast-icon-success" />
        );
      case "error":
        return (
          <AlertCircle size={18} className="toast-icon toast-icon-error" />
        );
      default:
        return <Info size={18} className="toast-icon toast-icon-info" />;
    }
  };

  return (
    <div className={`toast-container toast-${type}`}>
      <div className="toast-body">
        {renderIcon()}
        <span className="toast-text">{message}</span>
      </div>
      {onClose && (
        <button type="button" className="toast-close-btn" onClick={onClose}>
          <X size={15} />
        </button>
      )}
    </div>
  );
};
