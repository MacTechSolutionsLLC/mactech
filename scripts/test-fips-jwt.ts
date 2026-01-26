#!/usr/bin/env tsx
/**
 * Test script for FIPS JWT encoding/decoding
 * Tests the FIPS JWT implementation to ensure it works correctly
 */

import { encodeFIPSJWT, decodeFIPSJWT } from '../lib/fips-jwt'
import { encodeFIPSJWTForNextAuth, decodeFIPSJWTForNextAuth } from '../lib/fips-nextauth-config'
import type { JWT } from 'next-auth/jwt'

const TEST_SECRET = 'test-secret-key-for-fips-jwt-testing-12345'
const TEST_TOKEN: JWT = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
}

async function runTests() {
  console.log('🧪 Testing FIPS JWT Implementation\n')
  console.log('='.repeat(60))

  // Test 1: Basic FIPS JWT encode/decode
  console.log('\n📝 Test 1: Basic FIPS JWT Encode/Decode')
  try {
    const payload = { userId: '123', email: 'test@example.com' }
    const encoded = encodeFIPSJWT(payload, TEST_SECRET, { expiresIn: 3600 })
    console.log('✅ Encode successful')
    console.log(`   Token format: ${encoded.split('.').length} parts (expected: 3)`)
    
    const decoded = decodeFIPSJWT(encoded, TEST_SECRET)
    if (decoded && decoded.userId === '123') {
      console.log('✅ Decode successful')
      console.log(`   Decoded payload: ${JSON.stringify(decoded)}`)
    } else {
      console.log('❌ Decode failed - payload mismatch')
      process.exit(1)
    }
  } catch (error) {
    console.log('❌ Test 1 failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  // Test 2: NextAuth JWT format encode/decode
  console.log('\n📝 Test 2: NextAuth JWT Format Encode/Decode')
  try {
    const encoded = await encodeFIPSJWTForNextAuth(TEST_TOKEN, TEST_SECRET, 3600)
    console.log('✅ Encode successful')
    console.log(`   Token format: ${encoded.split('.').length} parts (expected: 3)`)
    
    const decoded = await decodeFIPSJWTForNextAuth(encoded, TEST_SECRET)
    if (decoded && decoded.id === TEST_TOKEN.id) {
      console.log('✅ Decode successful')
      console.log(`   Decoded JWT: ${JSON.stringify(decoded)}`)
    } else {
      console.log('❌ Decode failed - JWT mismatch')
      process.exit(1)
    }
  } catch (error) {
    console.log('❌ Test 2 failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  // Test 3: Token expiration
  console.log('\n📝 Test 3: Token Expiration')
  try {
    // Create a token that expires in the past
    const now = Math.floor(Date.now() / 1000)
    const expiredExp = now - 3600 // Expired 1 hour ago
    const payload = { userId: '123', iat: expiredExp - 3600, exp: expiredExp }
    const encoded = encodeFIPSJWT(payload, TEST_SECRET, { expiresIn: 3600 })
    const decoded = decodeFIPSJWT(encoded, TEST_SECRET)
    
    if (decoded === null) {
      console.log('✅ Expired token correctly rejected')
    } else {
      console.log('❌ Expired token was not rejected')
      console.log(`   Token exp: ${decoded.exp}, Current time: ${now}`)
      process.exit(1)
    }
  } catch (error) {
    console.log('❌ Test 3 failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  // Test 4: Invalid signature
  console.log('\n📝 Test 4: Invalid Signature')
  try {
    const payload = { userId: '123' }
    const encoded = encodeFIPSJWT(payload, TEST_SECRET, { expiresIn: 3600 })
    const wrongSecret = 'wrong-secret-key'
    const decoded = decodeFIPSJWT(encoded, wrongSecret)
    
    if (decoded === null) {
      console.log('✅ Invalid signature correctly rejected')
    } else {
      console.log('❌ Invalid signature was not rejected')
      process.exit(1)
    }
  } catch (error) {
    console.log('❌ Test 4 failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  // Test 5: Malformed token
  console.log('\n📝 Test 5: Malformed Token')
  try {
    const malformedToken = 'not.a.valid.jwt.token'
    const decoded = decodeFIPSJWT(malformedToken, TEST_SECRET)
    
    if (decoded === null) {
      console.log('✅ Malformed token correctly rejected')
    } else {
      console.log('❌ Malformed token was not rejected')
      process.exit(1)
    }
  } catch (error) {
    console.log('❌ Test 5 failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ All FIPS JWT tests passed!')
  console.log('='.repeat(60))
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})
