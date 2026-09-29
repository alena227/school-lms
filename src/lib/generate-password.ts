const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generatePassword(length = 10) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return result;
}
