import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { updateUserProfile } from "../../services/userService";
import { uploadAttachment } from "../../services/storageService";
import { Avatar } from "../common/Avatar";

export const SettingsModal = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
}) => {
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || "",
  );
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const res = await uploadAttachment(file, `profiles/${currentUser.uid}`);
      await updateUserProfile(currentUser.uid, { photoURL: res.downloadUrl });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile(currentUser.uid, { displayName, bio });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Profile & Settings</h3>
          <button className="icon-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-avatar-section">
          <Avatar src={userProfile?.photoURL} name={displayName} size="large" />
          <label className="upload-avatar-label">
            <Upload size={16} /> Update Photo
            <input
              type="file"
              onChange={handleAvatarUpload}
              className="file-hidden-input"
            />
          </label>
        </div>

        <form onSubmit={handleProfileSave} className="settings-form">
          <div className="input-field">
            <label>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="primary-action-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};
