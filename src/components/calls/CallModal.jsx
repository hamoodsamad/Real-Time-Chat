import React from "react";
import { Phone, PhoneOff } from "lucide-react";
import { Avatar } from "../common/Avatar";

export const CallModal = ({ incomingCall, onAccept, onReject }) => {
  if (!incomingCall) return null;

  return (
    <div className="call-notification-banner">
      <div className="call-notification-info">
        <Avatar
          src={incomingCall.callerPhoto}
          name={incomingCall.callerName}
          size="medium"
        />
        <div>
          <h4>{incomingCall.callerName}</h4>
          <p>Incoming {incomingCall.type} call...</p>
        </div>
      </div>
      <div className="call-notification-actions">
        <button className="call-accept-button" onClick={onAccept}>
          <Phone size={18} /> Accept
        </button>
        <button className="call-reject-button" onClick={onReject}>
          <PhoneOff size={18} /> Reject
        </button>
      </div>
    </div>
  );
};
