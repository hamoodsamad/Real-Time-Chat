import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Mail, Smartphone } from "lucide-react";
import { loginUser, loginWithPhone, resetPassword } from "../../services/authService";
import { isValidEmail, isValidPhone } from "../../utils/validationUtils";

export const Login = ({ onSwitchToRegister }) => {
  const [authMethod, setAuthMethod] = useState("email"); // "email" | "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: "", type: "" });

    if (authMethod === "email") {
      if (!email || !password) {
        setStatusMessage({ text: "Please enter your email and password.", type: "error" });
        return;
      }
      if (!isValidEmail(email)) {
        setStatusMessage({
          text: "Please provide a valid email address.",
          type: "error",
        });
        return;
      }

      try {
        setLoading(true);
        await loginUser(email, password);
      } catch (err) {
        setStatusMessage({
          text: err.message.replace("Firebase: ", ""),
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Phone Auth
      if (!phone || !password) {
        setStatusMessage({ text: "Please enter your phone number and password.", type: "error" });
        return;
      }
      if (!isValidPhone(phone)) {
        setStatusMessage({
          text: "Please enter a valid phone number with country code (e.g. +923001234567).",
          type: "error",
        });
        return;
      }

      try {
        setLoading(true);
        await loginWithPhone(phone, password);
      } catch (err) {
        setStatusMessage({
          text: err.message.replace("Firebase: ", ""),
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (authMethod !== "email" || !email || !isValidEmail(email)) {
      setStatusMessage({
        text: "Please enter your registered email address first.",
        type: "error",
      });
      return;
    }
    try {
      await resetPassword(email);
      setStatusMessage({
        text: "Password reset link sent! Check your inbox.",
        type: "success",
      });
    } catch (err) {
      setStatusMessage({
        text: err.message.replace("Firebase: ", ""),
        type: "error",
      });
    }
  };

  return (
    <div className="auth-card">
      <a
        href="https://my-portfolio-czuhuqnne-hamoodsamad0321-6526.vercel.app"
        className="back-to-portfolio-btn"
        title="Return to Portfolio"
      >
        <ArrowLeft size={16} />
        <span>Back to Portfolio</span>
      </a>

      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p>Sign in to access encrypted channels</p>
      </div>

      {/* Auth Method Switcher Tabs: Email vs Phone */}
      <div className="auth-method-tabs">
        <button
          type="button"
          className={`auth-tab-btn ${authMethod === "email" ? "active-tab" : ""}`}
          onClick={() => {
            setAuthMethod("email");
            setStatusMessage({ text: "", type: "" });
          }}
        >
          <Mail size={16} />
          <span>Email</span>
        </button>
        <button
          type="button"
          className={`auth-tab-btn ${authMethod === "phone" ? "active-tab" : ""}`}
          onClick={() => {
            setAuthMethod("phone");
            setStatusMessage({ text: "", type: "" });
          }}
        >
          <Smartphone size={16} />
          <span>Phone</span>
        </button>
      </div>

      {statusMessage.text && (
        <div
          className={`auth-alert ${statusMessage.type === "error" ? "alert-danger" : "alert-success"}`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleLogin} className="auth-form">
        {authMethod === "email" ? (
          <div className="input-field">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
        ) : (
          <div className="input-field">
            <label htmlFor="login-phone">Phone Number</label>
            <input
              id="login-phone"
              type="tel"
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
        )}

        <div className="input-field">
          <label htmlFor="login-password">Password</label>
          <div className="password-input-wrapper">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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

        {authMethod === "email" && (
          <div className="forgot-container">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-button"
            >
              Forgot Password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="primary-action-button"
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      <div className="auth-footer">
        <p>Don't have an account?</p>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-link-button"
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default Login;
