import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

export const VideoCallOverlay = ({
  localStream,
  remoteStream,
  callType,
  onEndCall,
  isAudioMuted,
  isVideoMuted,
  onToggleAudio,
  onToggleVideo,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="video-overlay-wrapper">
      <div className="streams-canvas">
        {callType === "video" && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-stream-video"
          />
        )}

        {callType === "video" && (
          <div className="local-stream-pip">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-stream-video"
            />
          </div>
        )}

        {callType === "audio" && (
          <div className="audio-call-placeholder">
            <div className="pulse-circle" />
            <h3>Voice Call In Progress</h3>
            <audio ref={remoteVideoRef} autoPlay />
          </div>
        )}
      </div>

      <div className="call-controls-panel">
        <button
          className={`control-round-button ${isAudioMuted ? "btn-danger" : ""}`}
          onClick={onToggleAudio}
        >
          {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {callType === "video" && (
          <button
            className={`control-round-button ${isVideoMuted ? "btn-danger" : ""}`}
            onClick={onToggleVideo}
          >
            {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
        )}

        <button className="control-round-button btn-hangup" onClick={onEndCall}>
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
};
