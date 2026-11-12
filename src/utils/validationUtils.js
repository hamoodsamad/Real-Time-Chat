export const isValidEmail = (email) => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();

  // enforce proper email format ending strictly with gmail.com
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(cleanEmail);
};
