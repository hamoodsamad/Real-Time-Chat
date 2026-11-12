import React from "react";

export const Avatar = ({ src, name, isOnline, size = "medium" }) => {
  const getInitials = (n) => {
    if (!n) return "?";
    const parts = n.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <div className={`avatar-container avatar-${size}`}>
      {src ? (
        <img src={src} alt={name || "Avatar"} className="avatar-image" />
      ) : (
        <div className="avatar-fallback">{getInitials(name)}</div>
      )}
      {typeof isOnline === "boolean" && (
        <span
          className={`status-badge ${isOnline ? "status-online" : "status-offline"}`}
        />
      )}
    </div>
  );
};
