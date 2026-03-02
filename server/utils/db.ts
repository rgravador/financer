import mongoose from 'mongoose'

// Cached connection to prevent multiple connections in development
let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

/**
 * Connect to MongoDB Atlas
 * Uses singleton pattern to prevent multiple connections
 */
export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const config = useRuntimeConfig()
    const MONGODB_URI = config.mongodbUri

    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable')
    }

    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error)
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

/**
 * Disconnect from MongoDB
 * Useful for testing or cleanup
 */
export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect()
    cached.conn = null
    cached.promise = null
    console.log('✅ MongoDB disconnected')
  }
}
