/**
 * Temporary Password Generation and Management
 * NIST SP 800-171 Rev. 2, Section 3.5.9
 * 
 * Provides secure temporary password generation and expiration checking
 * for user account creation and password resets.
 */

import crypto from 'crypto'

/**
 * Configuration for temporary passwords
 */
export const TEMPORARY_PASSWORD_CONFIG = {
  /** Minimum length for temporary passwords (16 characters) */
  minLength: 16,
  /** Default length for temporary passwords (20 characters for better security) */
  defaultLength: 20,
  /** Expiration time in hours (72 hours = 3 days) */
  expirationHours: 72,
}

/**
 * Character sets for password generation
 */
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const ALL_CHARS = UPPERCASE + LOWERCASE + NUMBERS + SPECIAL

/**
 * Generate a cryptographically secure random temporary password
 * 
 * The password will:
 * - Be at least 16 characters long (default 20)
 * - Include uppercase, lowercase, numbers, and special characters
 * - Be cryptographically secure using crypto.randomBytes()
 * 
 * @param length Optional password length (default: 20)
 * @returns Secure random password string
 */
export function generateTemporaryPassword(length: number = TEMPORARY_PASSWORD_CONFIG.defaultLength): string {
  if (length < TEMPORARY_PASSWORD_CONFIG.minLength) {
    length = TEMPORARY_PASSWORD_CONFIG.minLength
  }

  // Ensure we have at least one character from each required set
  let password = ''
  
  // Add one character from each required set
  password += UPPERCASE[getRandomInt(UPPERCASE.length)]
  password += LOWERCASE[getRandomInt(LOWERCASE.length)]
  password += NUMBERS[getRandomInt(NUMBERS.length)]
  password += SPECIAL[getRandomInt(SPECIAL.length)]
  
  // Fill the rest with random characters from all sets
  const remainingLength = length - password.length
  for (let i = 0; i < remainingLength; i++) {
    password += ALL_CHARS[getRandomInt(ALL_CHARS.length)]
  }
  
  // Shuffle the password to avoid predictable patterns
  return shuffleString(password)
}

/**
 * Get a cryptographically secure random integer
 * @param max Maximum value (exclusive)
 * @returns Random integer between 0 and max-1
 */
function getRandomInt(max: number): number {
  const randomBytes = crypto.randomBytes(4)
  const randomValue = randomBytes.readUInt32BE(0)
  return randomValue % max
}

/**
 * Shuffle a string using Fisher-Yates algorithm with crypto randomness
 * @param str String to shuffle
 * @returns Shuffled string
 */
function shuffleString(str: string): string {
  const arr = str.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

/**
 * Get the expiration timestamp for a temporary password
 * @param hoursFromNow Hours from now when password expires (default: 72)
 * @returns Date object representing expiration time
 */
export function getTemporaryPasswordExpiration(hoursFromNow: number = TEMPORARY_PASSWORD_CONFIG.expirationHours): Date {
  const expirationDate = new Date()
  expirationDate.setHours(expirationDate.getHours() + hoursFromNow)
  return expirationDate
}

/**
 * Check if a temporary password has expired
 * @param expiresAt Expiration timestamp (DateTime or null)
 * @returns true if expired or if expiresAt is null (treat null as expired for safety)
 */
export function isTemporaryPasswordExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    return true // No expiration date means expired (safety default)
  }
  return new Date() > expiresAt
}

/**
 * Get the configured expiration time in hours
 * @returns Number of hours until temporary password expires
 */
export function getTemporaryPasswordExpirationHours(): number {
  return TEMPORARY_PASSWORD_CONFIG.expirationHours
}
