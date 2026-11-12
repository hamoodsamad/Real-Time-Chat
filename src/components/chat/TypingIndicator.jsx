import React from "react";

export const TypingIndicator = ({ username }) => {
  return (
    <div className="typing-indicator-row">
      <div className="typing-indicator-bubble">
        {username && (
          <span className="typing-username">{username} is typing</span>
        )}
        <div className="typing-dots">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
};
