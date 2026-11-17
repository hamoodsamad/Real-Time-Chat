import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Mail, Smartphone, ShieldCheck, RefreshCw } from "lucide-react";
import { registerUser, registerWithPhone } from "../../services/authService";
import { isValidEmail, isValidPhone } from "../../utils/validationUtils";
import { generateSecureOTP } from "../../utils/securityUtils";

export const Register = ({ onSwitchToLogin }) => {
  const [authMethod, setAuthMethod] = useState("email"); // "email" | "phone"
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // OTP Verification Step State
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [enteredOTP, setEnteredOTP] = useState("");

  const handleInitiateRegister = (e) => {
    e.preventDefault();
    setStatusMessage({ text: "", type: "" });

    if (!displayName || !username || !password) {
      setStatusMessage({
        text: "Please fill in all profile fields.",
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

    if (authMethod === "email") {
      if (!email || !isValidEmail(email)) {
        setStatusMessage({
          text: "Please enter a valid email address.",
          type: "error",
        });
        return;
      }
    } else {
      if (!phone || !isValidPhone(phone)) {
        setStatusMessage({
          text: "Please enter a valid phone number (e.g. +923001234567).",
          type: "error",
        });
        return;
      }
    }

    // Generate 6-digit OTP for free verification
    const otp = generateSecureOTP();
    setGeneratedOTP(otp);
    setEnteredOTP("");
    setIsVerifyingOTP(true);
    setStatusMessage({
      text: `Verification code generated for ${authMethod === "email" ? email : phone}. Enter the 6-digit code below:`,
      type: "success",
    });
  };

  const handleVerifyAndComplete = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: "", type: "" });

    if (!enteredOTP || enteredOTP.trim().length !== 6) {
      setStatusMessage({
        text: "Please enter the complete 6-digit verification code.",
        type: "error",
      });
      return;
    }

    if (enteredOTP.trim() !== generatedOTP) {
      setStatusMessage({
        text: "Invalid verification code. Please check and try again.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      if (authMethod === "email") {
        await registerUser(email, password, displayName, username, phone);
      } else {
        await registerWithPhone(phone, password, displayName, username);
      }
      setStatusMessage({
        text: "Account registered and verified successfully!",
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

  const handleResendOTP = () => {
    const newOtp = generateSecureOTP();
    setGeneratedOTP(newOtp);
    setEnteredOTP("");
    setStatusMessage({
      text: `New verification code generated: ${newOtp}`,
      type: "success",
    });
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
        <h2>{isVerifyingOTP ? "Verify Your Account" : "Create Account"}</h2>
        <p>
          {isVerifyingOTP
            ? `Enter the OTP sent to your ${authMethod}`
            : "Set up your secure messaging profile"}
        </p>
      </div>

      {!isVerifyingOTP && (
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
      )}

      {statusMessage.text && (
        <div
          className={`auth-alert ${statusMessage.type === "error" ? "alert-danger" : "alert-success"}`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* OTP Display Helper Pill for 100% Free Demo Access */}
      {isVerifyingOTP && generatedOTP && (
        <div className="otp-preview-banner">
          <ShieldCheck size={18} />
          <span>Your Verification Code is: <strong>{generatedOTP}</strong></span>
        </div>
      )}

      {isVerifyingOTP ? (
        <form onSubmit={handleVerifyAndComplete} className="auth-form">
          <div className="input-field">
            <label htmlFor="reg-otp">6-Digit Verification Code</label>
            <input
              id="reg-otp"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={enteredOTP}
              onChange={(e) => setEnteredOTP(e.target.value.replace(/[^0-9]/g, ""))}
              disabled={loading}
              className="otp-code-input"
              autoFocus
            />
          </div>

          <div className="otp-resend-row">
            <button
              type="button"
              className="text-button inline-flex-btn"
              onClick={handleResendOTP}
              disabled={loading}
            >
              <RefreshCw size={13} />
              <span>Resend Code</span>
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setIsVerifyingOTP(false)}
            >
              Edit details
            </button>
          </div>

          <button
            type="submit"
            className="primary-action-button"
            disabled={loading || enteredOTP.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Complete Registration"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleInitiateRegister} className="auth-form">
          <div className="input-field">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              autoFocus
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

          {authMethod === "email" ? (
            <div className="input-field">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          ) : (
            <div className="input-field">
              <label htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

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
            Continue with OTP Verification
          </button>
        </form>
      )}

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
