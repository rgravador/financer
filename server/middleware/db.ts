import { connectDB } from '../utils/db'

/**
 * Database middleware
 * Ensures MongoDB connection is established before API routes are processed
 * Runs on all /api/** routes
 */
export default defineEventHandler(async (event) => {
  // Only run for API routes
  if (event.path?.startsWith('/api/')) {
    try {
      await connectDB()
    } catch (error) {
      console.error('❌ Database connection failed in middleware:', error)
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection unavailable',
      })
    }
  }
})
