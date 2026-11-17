import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { loginUser, resetPassword } from "../../services/authService";
import { isValidEmail } from "../../utils/validationUtils";

export const Login = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: "", type: "" });

    if (!email || !password) {
      setStatusMessage({ text: "Please fill in all fields.", type: "error" });
      return;
    }

    if (!isValidEmail(email)) {
      setStatusMessage({
        text: "Please provide a valid @gmail.com address.",
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
  };

  const handleForgotPassword = async () => {
    if (!email || !isValidEmail(email)) {
      setStatusMessage({
        text: "Enter a valid @gmail.com address first.",
        type: "error",
      });
      return;
    }
    try {
      await resetPassword(email);
      setStatusMessage({
        text: "Reset email sent! Check your inbox.",
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

      {statusMessage.text && (
        <div
          className={`auth-alert ${statusMessage.type === "error" ? "alert-danger" : "alert-success"}`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleLogin} className="auth-form">
        <div className="input-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

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

        <div className="forgot-container">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-button"
          >
            Forgot Password?
          </button>
        </div>

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
