import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CallProvider } from "./context/CallContext";

import "./styles/global.css";
import "./styles/auth.css";
import "./styles/sidebar.css";
import "./styles/chat.css";
import "./styles/call.css";
import "./styles/modals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CallProvider>
        <App />
      </CallProvider>
    </AuthProvider>
  </React.StrictMode>,
);
