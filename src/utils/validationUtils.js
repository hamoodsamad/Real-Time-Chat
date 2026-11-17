export const isValidEmail = (email) => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  // Validates standard email addresses including gmail.com
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(cleanEmail);
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const clean = phone.replace(/[^0-9]/g, "");
  return clean.length >= 10 && clean.length <= 15;
};
