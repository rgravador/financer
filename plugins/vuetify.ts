import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin((nuxtApp) => {
  const colorMode = useColorMode()

  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      // Theme controlled by @nuxtjs/color-mode (see watcher below)
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#3B82F6',
            secondary: '#64748B',
            accent: '#F97316',
            gold: '#F97316',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            'surface-variant': '#F1F5F9',
            'on-primary': '#FFFFFF',
            'on-secondary': '#FFFFFF',
            'on-success': '#FFFFFF',
            'on-warning': '#000000',
            'on-error': '#FFFFFF',
            'on-background': '#0F172A',
            'on-surface': '#0F172A',
          }
        },
        dark: {
          dark: true,
          colors: {
            primary: '#3B82F6',
            secondary: '#475569',
            accent: '#F97316',
            gold: '#F97316',
            success: '#34D399',
            warning: '#FBBF24',
            error: '#FB7185',
            info: '#60A5FA',
            background: '#080C18',
            surface: '#101828',
            'surface-variant': '#1A2440',
            'on-primary': '#FFFFFF',
            'on-secondary': '#E2E8F0',
            'on-success': '#080C18',
            'on-warning': '#080C18',
            'on-error': '#080C18',
            'on-background': '#E2E8F0',
            'on-surface': '#E2E8F0',
          }
        }
      }
    },
    defaults: {
      VBtn: {
        style: 'text-transform: none; letter-spacing: 0.01em;',
        rounded: 'lg',
        elevation: 0,
      },
      VCard: {
        elevation: 0,
        rounded: 'xl',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VDataTable: {
        density: 'comfortable',
      },
      VChip: {
        rounded: 'lg',
      },
    }
  })

  nuxtApp.vueApp.use(vuetify)

  // @nuxtjs/color-mode is the single source of truth
  // This watcher syncs Vuetify's theme with color-mode
  watch(
    () => colorMode.value,
    (newMode) => {
      vuetify.theme.global.name.value = newMode === 'dark' ? 'dark' : 'light'
    },
    { immediate: true }
  )
})
