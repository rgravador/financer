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
            // Modern Blue palette (matches VUETIFY_CUSTOMIZATION.md)
            primary: '#2563EB',      // Modern blue (primary actions, links)
            secondary: '#64748B',    // Slate gray (secondary actions)
            accent: '#0EA5E9',       // Sky blue (highlights, interactive)

            // Semantic colors
            success: '#10B981',      // Emerald green
            warning: '#F59E0B',      // Amber
            error: '#EF4444',        // Red
            info: '#3B82F6',         // Blue

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
