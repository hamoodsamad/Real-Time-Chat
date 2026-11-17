import React from "react";
import { X, Phone, Video, ShieldCheck, Mail, Smartphone, Info } from "lucide-react";
import { Avatar } from "../common/Avatar";

export const ContactInfoModal = ({
  isOpen,
  onClose,
  targetUser,
  onStartCall,
}) => {
  if (!isOpen || !targetUser) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container contact-info-container">
        <div className="modal-header">
          <h3>Contact Info</h3>
          <button className="icon-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="contact-info-profile-hero">
          <Avatar
            src={targetUser.photoURL}
            name={targetUser.displayName}
            size="large"
            isOnline={targetUser.isOnline}
          />
          <h4>{targetUser.displayName || targetUser.username || "User"}</h4>
          <span className="contact-info-username">@{targetUser.username || "user"}</span>
          <span
            className={`contact-online-badge ${targetUser.isOnline ? "online" : "offline"}`}
          >
            {targetUser.isOnline ? "Online" : "Offline"}
          </span>
        </div>

        <div className="contact-info-call-actions">
          <button
            type="button"
            className="contact-call-action-btn"
            onClick={() => {
              onClose();
              onStartCall(targetUser, "audio");
            }}
          >
            <Phone size={18} />
            <span>Audio</span>
          </button>
          <button
            type="button"
            className="contact-call-action-btn"
            onClick={() => {
              onClose();
              onStartCall(targetUser, "video");
            }}
          >
            <Video size={18} />
            <span>Video</span>
          </button>
        </div>

        <div className="contact-info-section">
          <label>About / Status</label>
          <div className="contact-about-box">
            <Info size={16} className="contact-section-icon" />
            <p>{targetUser.bio || "Hey there! I am using StreamLine"}</p>
          </div>
        </div>

        <div className="contact-info-section">
          <label>Contact Details</label>
          {targetUser.phoneNumber && (
            <div className="contact-detail-row">
              <Smartphone size={16} className="contact-section-icon" />
              <span>{targetUser.phoneNumber}</span>
            </div>
          )}
          {targetUser.email && !targetUser.email.includes("@streamline.app") && (
            <div className="contact-detail-row">
              <Mail size={16} className="contact-section-icon" />
              <span>{targetUser.email}</span>
            </div>
          )}
        </div>

        <div className="contact-info-security-card">
          <ShieldCheck size={20} className="security-icon" />
          <div className="security-card-text">
            <strong>Encryption</strong>
            <p>Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
