import { connectDB } from '../utils/db'

/**
 * Nitro plugin to establish MongoDB connection on server startup
 * This ensures the database is connected before any API routes are accessed
 */
export default defineNitroPlugin(async (nitroApp) => {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await connectDB()
    console.log('✅ MongoDB plugin initialized successfully')
  } catch (error) {
    console.error('❌ MongoDB plugin initialization failed:', error)
    // Don't throw - allow the server to start even if MongoDB is unavailable
    // Individual routes will handle connection errors gracefully
  }
})
