export function validateEmail(email) {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}
export function validateSocials(socials) {
  if (!Array.isArray(socials)) return false;
  for (let social of socials) {
    if (typeof social === 'string') return true;
    else return false;
  }
}
export function validUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
  return usernameRegex.test(username);
}
