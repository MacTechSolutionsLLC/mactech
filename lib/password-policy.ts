/**
 * Password policy enforcement for CMMC Level 1 compliance
 * Minimum 14 characters, common password denylist
 * Bcrypt cost factor: 12 (documented)
 */

// Common passwords denylist (100 most common)
// Source: Common password lists (top 100)
const COMMON_PASSWORDS = [
  "password",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "abc123",
  "password1",
  "Password1",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "1234567",
  "123456",
  "sunshine",
  "princess",
  "football",
  "iloveyou",
  "master",
  "hello",
  "freedom",
  "whatever",
  "qazwsx",
  "trustno1",
  "dragon",
  "baseball",
  "iloveyou",
  "starwars",
  "batman",
  "superman",
  "qwertyuiop",
  "123qwe",
  "zxcvbnm",
  "asdfgh",
  "qwerty123",
  "password12",
  "Password123",
  "admin123",
  "root",
  "toor",
  "pass",
  "test",
  "guest",
  "info",
  "adm",
  "mysql",
  "user",
  "administrator",
  "oracle",
  "ftp",
  "pi",
  "puppet",
  "ansible",
  "ec2-user",
  "vagrant",
  "azureuser",
  "changeme",
  "default",
  "service",
  "support",
  "1234",
  "12345",
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "qwerty123",
  "qwertyuiop",
  "asdfgh",
  "zxcvbnm",
  "password",
  "password1",
  "password12",
  "password123",
  "Password",
  "Password1",
  "Password12",
  "Password123",
  "admin",
  "admin123",
  "administrator",
  "root",
  "toor",
  "pass",
  "test",
  "guest",
  "welcome",
  "hello",
  "letmein",
  "master",
  "dragon",
  "monkey",
  "princess",
  "football",
  "baseball",
  "iloveyou",
  "sunshine",
  "freedom",
  "whatever",
  "trustno1",
  "qazwsx",
  "batman",
  "superman",
  "starwars",
]

/**
 * Password policy configuration
 */
export const PASSWORD_POLICY = {
  minLength: 14,
  bcryptRounds: 12, // Cost factor for bcrypt
  requireCommonPasswordCheck: true,
  passwordHistoryCount: 5, // Number of previous passwords to prevent reuse (NIST SP 800-171 Rev. 2, Section 3.5.8)
}

/**
 * Get password policy requirements
 */
export function getPasswordPolicy() {
  return {
    minLength: PASSWORD_POLICY.minLength,
    requirements: [
      `Minimum ${PASSWORD_POLICY.minLength} characters`,
      "Cannot be a common password",
      `Cannot reuse any of the last ${PASSWORD_POLICY.passwordHistoryCount} passwords`,
    ],
    bcryptRounds: PASSWORD_POLICY.bcryptRounds,
    passwordHistoryCount: PASSWORD_POLICY.passwordHistoryCount,
  }
}

/**
 * Check if password is in common passwords denylist
 * @param password Password to check
 * @returns true if password is common, false otherwise
 */
export function checkCommonPasswords(password: string): boolean {
  if (!password) {
    return false
  }

  const lowerPassword = password.toLowerCase()
  return COMMON_PASSWORDS.includes(lowerPassword)
}

/**
 * Validate password against policy
 * @param password Password to validate
 * @returns Validation result with errors array
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!password) {
    errors.push("Password is required")
    return { valid: false, errors }
  }

  // Check minimum length
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_POLICY.minLength} characters long`
    )
  }

  // Check common passwords
  if (PASSWORD_POLICY.requireCommonPasswordCheck && checkCommonPasswords(password)) {
    errors.push("Password cannot be a common password")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
