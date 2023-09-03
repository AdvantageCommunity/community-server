import User from '../models/users.js';
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
export async function generateUniqueUsername(email) {
  let attempts = 0;
  const maxAttempts = 5; // Define a maximum number of attempts

  // Extract the local part of the email (before "@" symbol)
  const localPart = email.split('@')[0];

  while (attempts < maxAttempts) {
    // Remove special characters and spaces, and convert to lowercase
    const cleanedLocalPart = localPart
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    const randomNumber = Math.floor(Math.random() * 10000);
    const potentialUsername = `${cleanedLocalPart}${randomNumber}`;

    const isUsernameTaken = await User.findOne({ username: potentialUsername });

    if (!isUsernameTaken) {
      return potentialUsername; // Return the unique username
    }

    attempts++;
  }

  throw new Error(
    'All generated usernames are taken. Please choose a username manually.'
  );
}
