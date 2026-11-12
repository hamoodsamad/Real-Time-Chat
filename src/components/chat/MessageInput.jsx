import React, { useState, useRef } from "react";
import { Send, Paperclip, Mic, Trash2, Check } from "lucide-react";
import { sendMessage } from "../../services/chatService";
import { uploadAttachment } from "../../services/storageService";
import { useTyping } from "../../hooks/useTyping";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";

export const MessageInput = ({ conversationId, currentUser, userProfile }) => {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || uploading) return;

    const outgoing = text.trim();
    setText("");
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const isImg = file.type.startsWith("image/");
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
          type: isImg ? "image" : "file",
          mediaUrl: result.downloadUrl,
          fileName: result.fileName,
          fileSize: result.fileSize,
        },
      );
    } catch (err) {
      // upload failed
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="file-hidden-input"
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
            className="input-tool-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip size={19} />
          </button>

          <form onSubmit={handleFormSubmit} className="message-editor-form">
            <input
              type="text"
              placeholder={
                uploading ? "Processing audio / upload..." : "Type a message..."
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
                <Mic size={19} />
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
};
