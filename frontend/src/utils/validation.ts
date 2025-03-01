/**
 * Validates if a string is a valid email address
 *
 * @param email The email string to validate
 * @returns A boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates if a string has a minimum length
 *
 * @param str The string to validate
 * @param minLength The minimum length required
 * @returns A boolean indicating if the string is valid
 */
export function hasMinLength(str: string, minLength: number): boolean {
  return str.length >= minLength;
}

/**
 * Validates if a string meets password complexity requirements
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 *
 * @param password The password string to validate
 * @returns An object with validation result and possible error message
 */
export function validatePassword(password: string): { isValid: boolean, message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true };
}

/**
 * Validates a URL string
 *
 * @param url The URL string to validate
 * @returns A boolean indicating if the URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates if a number is within a specific range
 *
 * @param value The number to validate
 * @param min The minimum allowed value
 * @param max The maximum allowed value
 * @returns A boolean indicating if the number is valid
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Checks if a string contains only alphanumeric characters
 *
 * @param str The string to validate
 * @returns A boolean indicating if the string is valid
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}