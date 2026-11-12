import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "../../services/authService";
import { isValidEmail } from "../../utils/validationUtils";

export const Register = ({ onSwitchToLogin }) => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: "", type: "" });

    if (!displayName || !username || !email || !password) {
      setStatusMessage({
        text: "All fields are strictly required.",
        type: "error",
      });
      return;
    }

    if (!isValidEmail(email)) {
      setStatusMessage({
        text: "Please enter a valid @gmail.com address.",
        type: "error",
      });
      return;
    }

    if (password.length < 6) {
      setStatusMessage({
        text: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      await registerUser(email, password, displayName, username);
      setStatusMessage({
        text: "Account registered successfully!",
        type: "success",
      });
    } catch (err) {
      setStatusMessage({
        text: err.message.replace("Firebase: ", ""),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Register Profile</h2>
        <p>Set up your platform credentials</p>
      </div>

      {statusMessage.text && (
        <div
          className={`auth-alert ${statusMessage.type === "error" ? "alert-danger" : "alert-success"}`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleRegister} className="auth-form">
        <div className="input-field">
          <label htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-field">
          <label htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-field">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-field">
          <label htmlFor="reg-password">Password</label>
          <div className="password-input-wrapper">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="primary-action-button"
          disabled={loading}
        >
          {loading ? "Creating..." : "Register Account"}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account?</p>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-link-button"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Register;
