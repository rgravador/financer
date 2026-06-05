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
            primary: '#8B5CF6',
            secondary: '#64748B',
            accent: '#FB7185',
            gold: '#FBBF24',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#22D3EE',
            background: '#E4E4E8',
            surface: '#F0F0F4',
            'surface-variant': '#E8E8EC',
            'on-primary': '#FFFFFF',
            'on-secondary': '#FFFFFF',
            'on-success': '#FFFFFF',
            'on-warning': '#1E1B4B',
            'on-error': '#FFFFFF',
            'on-background': '#1E1B4B',
            'on-surface': '#1E1B4B',
          }
        },
        dark: {
          dark: true,
          colors: {
            primary: '#A78BFA',
            secondary: '#475569',
            accent: '#FB7185',
            gold: '#FBBF24',
            success: '#34D399',
            warning: '#FBBF24',
            error: '#FB7185',
            info: '#67E8F9',
            background: '#0E0C1A',
            surface: '#16132A',
            'surface-variant': '#1E1B30',
            'on-primary': '#FFFFFF',
            'on-secondary': '#E2E8F0',
            'on-success': '#0C0A1E',
            'on-warning': '#0C0A1E',
            'on-error': '#0C0A1E',
            'on-background': '#E8E0F0',
            'on-surface': '#E8E0F0',
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
        autocomplete: 'new-password',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VAutocomplete: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
        autocomplete: 'new-password',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
        autocomplete: 'new-password',
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
