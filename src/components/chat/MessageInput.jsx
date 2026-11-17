import React, { useState, useRef } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Trash2,
  Check,
  Smile,
  MapPin,
  Image as ImageIcon,
  FileText,
  X,
} from "lucide-react";
import { sendMessage } from "../../services/chatService";
import { uploadAttachment } from "../../services/storageService";
import { useTyping } from "../../hooks/useTyping";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { EmojiPicker } from "./EmojiPicker";
import { ImageCaptionModal } from "./ImageCaptionModal";

export const MessageInput = ({ conversationId, currentUser, userProfile }) => {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false);

  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const textInputRef = useRef(null);

  const { triggerTyping, cancelTyping } = useTyping(
    conversationId,
    currentUser.uid,
  );
  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  const handleInputChange = (e) => {
    setText(e.target.value);
    triggerTyping();
  };

  const handleSelectEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    textInputRef.current?.focus();
    triggerTyping();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || uploading) return;

    const outgoing = text.trim();
    setText("");
    setShowEmojiPicker(false);
    cancelTyping();

    try {
      await sendMessage(
        conversationId,
        currentUser.uid,
        userProfile?.displayName || "User",
        {
          text: outgoing,
          type: "text",
        },
      );
    } catch (err) {
      // ignore message delivery interrupt
    }
  };

  // Triggered when user picks an image from file picker
  const handleImageSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowAttachMenu(false);
    setSelectedImageFile(file);
    setIsCaptionModalOpen(true);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Send photo with caption from ImageCaptionModal
  const handleSendImageWithCaption = async (file, caption) => {
    try {
      setUploading(true);
      const result = await uploadAttachment(
        file,
        `conversations/${conversationId}`,
      );

      await sendMessage(
        conversationId,
        currentUser.uid,
        userProfile?.displayName || "User",
        {
          text: caption || "",
          type: "image",
          mediaUrl: result.downloadUrl,
          fileName: result.fileName,
          fileSize: result.fileSize,
        },
      );
      setIsCaptionModalOpen(false);
      setSelectedImageFile(null);
    } catch (err) {
      // upload error
    } finally {
      setUploading(false);
    }
  };

  // Direct document upload
  const handleDocumentSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowAttachMenu(false);

    try {
      setUploading(true);
      const result = await uploadAttachment(
        file,
        `conversations/${conversationId}`,
      );

      await sendMessage(
        conversationId,
        currentUser.uid,
        userProfile?.displayName || "User",
        {
          text: "",
          type: "file",
          mediaUrl: result.downloadUrl,
          fileName: result.fileName,
          fileSize: result.fileSize,
        },
      );
    } catch (err) {
      // upload error
    } finally {
      setUploading(false);
      if (documentInputRef.current) documentInputRef.current.value = "";
    }
  };

  // Send current GPS location
  const handleShareLocation = () => {
    setShowAttachMenu(false);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setUploading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          await sendMessage(
            conversationId,
            currentUser.uid,
            userProfile?.displayName || "User",
            {
              type: "location",
              latitude,
              longitude,
              mapUrl,
              text: `📍 Shared Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            },
          );
        } finally {
          setUploading(false);
        }
      },
      (err) => {
        setUploading(false);
        alert(`Location access denied or unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleSendVoiceNote = async () => {
    try {
      const audioFile = await stopRecording();
      if (!audioFile) return;

      setUploading(true);
      const result = await uploadAttachment(
        audioFile,
        `conversations/${conversationId}`,
      );

      await sendMessage(
        conversationId,
        currentUser.uid,
        userProfile?.displayName || "User",
        {
          text: "",
          type: "audio",
          mediaUrl: result.downloadUrl,
          fileName: "Voice message",
          fileSize: audioFile.size,
        },
      );
    } catch (err) {
      // catch storage permission or network error
    } finally {
      setUploading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="message-input-bar">
      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageSelected}
        className="file-hidden-input"
      />
      <input
        type="file"
        ref={documentInputRef}
        onChange={handleDocumentSelected}
        className="file-hidden-input"
      />

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* WhatsApp-Style Attachment Menu Popup */}
      {showAttachMenu && (
        <div className="whatsapp-attach-menu">
          <button
            type="button"
            className="attach-menu-item item-image"
            onClick={() => imageInputRef.current?.click()}
          >
            <div className="attach-item-circle circle-image">
              <ImageIcon size={20} />
            </div>
            <span>Photos & Videos</span>
          </button>

          <button
            type="button"
            className="attach-menu-item item-document"
            onClick={() => documentInputRef.current?.click()}
          >
            <div className="attach-item-circle circle-document">
              <FileText size={20} />
            </div>
            <span>Document</span>
          </button>

          <button
            type="button"
            className="attach-menu-item item-location"
            onClick={handleShareLocation}
          >
            <div className="attach-item-circle circle-location">
              <MapPin size={20} />
            </div>
            <span>Share Location</span>
          </button>
        </div>
      )}

      {/* Image Preview & Caption Modal */}
      <ImageCaptionModal
        file={selectedImageFile}
        isOpen={isCaptionModalOpen}
        onClose={() => {
          setIsCaptionModalOpen(false);
          setSelectedImageFile(null);
        }}
        onSend={handleSendImageWithCaption}
        uploading={uploading}
      />

      {isRecording ? (
        <div className="voice-recording-wrapper">
          <button
            type="button"
            className="voice-discard-btn"
            onClick={cancelRecording}
            title="Cancel recording"
          >
            <Trash2 size={18} />
          </button>

          <div className="voice-status-indicator">
            <span className="voice-record-pulse" />
            <span className="voice-timer-text">
              {formatTimer(recordingDuration)}
            </span>
          </div>

          <button
            type="button"
            className="voice-submit-btn"
            onClick={handleSendVoiceNote}
            title="Send voice note"
          >
            <Check size={18} />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            className={`input-tool-button ${showEmojiPicker ? "tool-active" : ""}`}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            title="Emojis"
          >
            <Smile size={20} />
          </button>

          <button
            type="button"
            className={`input-tool-button ${showAttachMenu ? "tool-active" : ""}`}
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            disabled={uploading}
            title="Attach Media / Location"
          >
            <Paperclip size={20} />
          </button>

          <form onSubmit={handleFormSubmit} className="message-editor-form">
            <input
              ref={textInputRef}
              type="text"
              placeholder={
                uploading ? "Processing media / location..." : "Type a message..."
              }
              value={text}
              onChange={handleInputChange}
              disabled={uploading}
            />
            {text.trim() ? (
              <button
                type="submit"
                className="send-message-button"
                disabled={uploading}
                title="Send message"
              >
                <Send size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="voice-mic-trigger-btn"
                onClick={startRecording}
                disabled={uploading}
                title="Record voice note"
              >
                <Mic size={20} />
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
};
