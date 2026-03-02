// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  // SPA mode (disable SSR)
  ssr: false,

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false // Temporarily disabled - legacy Ant Design components need migration
  },

  // Modules
  modules: ['@pinia/nuxt', 'vuetify-nuxt-module'],

  // Runtime config
  runtimeConfig: {
    // Server-only keys
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

    redisUrl: process.env.REDIS_URL,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpFrom: process.env.SMTP_FROM,
    appUrl: process.env.APP_URL,

    clamavHost: process.env.CLAMAV_HOST,
    clamavPort: process.env.CLAMAV_PORT,

    // Public keys (exposed to client)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },

  // CSS
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '~/styles/vuetify/index.scss',
    '~/styles/wireframe.scss'
  ],

  // Vite configuration for SCSS
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/styles/vuetify/_variables.scss" as *;`
        }
      }
    }
  },

  // App head configuration (Inter font)
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        }
      ]
    }
  },

  // Development tools
  devtools: { enabled: true }
})
