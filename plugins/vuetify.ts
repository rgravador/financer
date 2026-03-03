import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            // Premium Navy Blue & Gold palette
            primary: '#1e3a8a',      // Navy blue (trust, professionalism)
            secondary: '#f59e0b',    // Amber gold (wealth, prosperity)
            accent: '#eab308',       // Yellow gold (premium, success)

            // Custom named colors for semantic use
            navy: '#1e3a8a',         // Navy blue (same as primary)
            gold: '#f59e0b',         // Gold (same as secondary)

            // Semantic colors
            success: '#10B981',      // Emerald green
            warning: '#F59E0B',      // Amber (matches gold theme)
            error: '#EF4444',        // Red
            info: '#1e3a8a',         // Navy blue (consistent with primary)

            // Surface colors
            background: '#F8FAFC',   // Very light gray
            surface: '#FFFFFF',      // White
            'surface-variant': '#F1F5F9', // Light slate

            // Text colors
            'on-primary': '#FFFFFF',
            'on-secondary': '#000000',
            'on-success': '#FFFFFF',
            'on-warning': '#000000',
            'on-error': '#FFFFFF',
            'on-background': '#1E293B',
            'on-surface': '#1E293B',
          }
        }
      }
    },
    defaults: {
      VBtn: {
        style: 'text-transform: none;', // Remove uppercase
        rounded: 'lg',                  // Softer corners
        elevation: 0,                   // Flat by default
      },
      VCard: {
        elevation: 1,                   // Subtle shadow
        rounded: 'lg',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VDataTable: {
        density: 'comfortable',
      }
    }
  })

  nuxtApp.vueApp.use(vuetify)
})
