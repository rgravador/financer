export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const origin = getHeader(event, 'origin')

  // Allowed origins
  const allowedOrigins = [
    config.appUrl, // Production frontend URL
    'http://localhost:3000', // Local development
    'http://127.0.0.1:3000', // Local development alternative
  ].filter(Boolean) // Remove any undefined values

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
  }

  // Allow credentials (cookies, authorization headers)
  setHeader(event, 'Access-Control-Allow-Credentials', 'true')

  // Allowed methods
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')

  // Allowed headers
  setHeader(
    event,
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  )

  // Max age for preflight requests (24 hours)
  setHeader(event, 'Access-Control-Max-Age', '86400')

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
    return
  }
})
