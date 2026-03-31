import mongoose from 'mongoose'

export default defineEventHandler(async () => {
  // Check database connection
  let dbStatus: 'connected' | 'disconnected' | 'error' = 'disconnected'
  try {
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected'
    }
  } catch {
    dbStatus = 'error'
  }

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: dbStatus,
    },
  }
})
