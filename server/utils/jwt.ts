import jwt from 'jsonwebtoken'
import type { JWTPayload } from '~/types'

/**
 * Sign an access token
 * @param payload - JWT payload containing user information
 * @returns Signed JWT access token
 */
export function signAccessToken(payload: JWTPayload): string {
  const config = useRuntimeConfig()

  return jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

/**
 * Sign a refresh token
 * @param payload - JWT payload containing user information
 * @returns Signed JWT refresh token
 */
export function signRefreshToken(payload: JWTPayload): string {
  const config = useRuntimeConfig()

  return jwt.sign(
    payload,
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  )
}

/**
 * Verify an access token
 * @param token - JWT access token to verify
 * @returns Decoded JWT payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): JWTPayload {
  const config = useRuntimeConfig()

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token')
    }
    throw error
  }
}

/**
 * Verify a refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded JWT payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): JWTPayload {
  const config = useRuntimeConfig()

  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret) as JWTPayload
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token')
    }
    throw error
  }
}
