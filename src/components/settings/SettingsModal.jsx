import React, { useState } from "react";
import { X, Upload, Camera, Check, Smartphone, Mail } from "lucide-react";
import { updateUserProfile } from "../../services/userService";
import { uploadAttachment } from "../../services/storageService";
import { Avatar } from "../common/Avatar";

const WHATSAPP_STATUS_PRESETS = [
  "Available",
  "Busy",
  "At work",
  "In a meeting",
  "At school",
  "At the movies",
  "Battery about to die",
  "Can't talk, StreamLine only",
  "At the gym",
  "Sleeping",
  "Urgent calls only",
];

export const SettingsModal = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
}) => {
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || "",
  );
  const [bio, setBio] = useState(
    userProfile?.bio || "Hey there! I am using StreamLine",
  );
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  if (!isOpen) return null;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      const res = await uploadAttachment(file, `profiles/${currentUser.uid}`);
      await updateUserProfile(currentUser.uid, { photoURL: res.downloadUrl });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setBio(preset);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile(currentUser.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container settings-modal-container">
        <div className="modal-header">
          <h3>Profile & Settings</h3>
          <button className="icon-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* WhatsApp Profile DP Upload Section */}
        <div className="settings-avatar-section">
          <div className="avatar-wrapper-relative">
            <Avatar src={userProfile?.photoURL} name={displayName} size="large" />
            <label className="avatar-camera-overlay" title="Change Profile Picture (DP)">
              <Camera size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
                className="file-hidden-input"
              />
            </label>
          </div>
          <span className="avatar-upload-hint">
            {avatarUploading ? "Uploading new photo..." : "Tap camera to change photo"}
          </span>
        </div>

        <form onSubmit={handleProfileSave} className="settings-form">
          <div className="input-field">
            <label>Your Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="input-field">
            <label>About / Status</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              rows={2}
            />
          </div>

          {/* WhatsApp Status Presets */}
          <div className="status-presets-section">
            <label className="presets-label">Select About preset:</label>
            <div className="presets-pill-list">
              {WHATSAPP_STATUS_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-pill-btn ${bio === preset ? "active-preset" : ""}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  {preset}
                  {bio === preset && <Check size={13} className="preset-check-icon" />}
                </button>
              ))}
            </div>
          </div>

          {/* Account Details */}
          <div className="settings-account-details">
            <label className="details-header">Account Details</label>
            <div className="details-row">
              <span className="details-label">Username:</span>
              <span className="details-val">@{userProfile?.username || "user"}</span>
            </div>
            {userProfile?.phoneNumber && (
              <div className="details-row">
                <span className="details-label">Phone:</span>
                <span className="details-val">{userProfile.phoneNumber}</span>
              </div>
            )}
            {userProfile?.email && !userProfile.email.includes("@streamline.app") && (
              <div className="details-row">
                <span className="details-label">Email:</span>
                <span className="details-val">{userProfile.email}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="primary-action-button"
            disabled={saving || avatarUploading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};
