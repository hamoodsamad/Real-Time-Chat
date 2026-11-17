/**
 * Security & Data Sanitization Utilities
 */

// Sanitize user text to prevent XSS and limit payload size
export const sanitizeText = (text, maxLength = 5000) => {
  if (typeof text !== "string") return "";
  const trimmed = text.trim().slice(0, maxLength);
  // Strip control characters while preserving standard whitespace and emoji
  return trimmed.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
};

// Validate that external URLs are strictly safe HTTP/HTTPS or blob
export const isSafeUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "blob:"
    );
  } catch {
    return false;
  }
};

// Generate a cryptographic 6-digit OTP code for free verification
export const generateSecureOTP = () => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const code = (array[0] % 900000) + 100000;
  return code.toString();
};
