// Test helper functions for authentication testing

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

export const mockUserProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  stripe_customer_id: null,
  holding_cell_balance: 0,
  twitter_access_token: null,
  twitter_refresh_token: null,
  twitter_username: null,
  onboarding_completed: false,
  avatar_type: 'default',
  display_name: null
}

export const testCredentials = {
  validEmail: 'test@example.com',
  validPassword: 'TestPassword123',
  invalidEmail: 'invalid-email',
  weakPassword: '123',
  nonExistentEmail: 'nonexistent@example.com'
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const simulateNetworkError = () => {
  throw new Error('Failed to fetch')
}

// Test scenarios
export const authTestScenarios = [
  {
    name: 'Valid Signup',
    input: { email: testCredentials.validEmail, password: testCredentials.validPassword },
    expectedResult: 'success'
  },
  {
    name: 'Invalid Email Signup',
    input: { email: testCredentials.invalidEmail, password: testCredentials.validPassword },
    expectedResult: 'validation_error'
  },
  {
    name: 'Weak Password Signup',
    input: { email: testCredentials.validEmail, password: testCredentials.weakPassword },
    expectedResult: 'validation_error'
  },
  {
    name: 'Valid Login',
    input: { email: testCredentials.validEmail, password: testCredentials.validPassword },
    expectedResult: 'success'
  },
  {
    name: 'Invalid Login',
    input: { email: testCredentials.nonExistentEmail, password: testCredentials.validPassword },
    expectedResult: 'auth_error'
  }
]