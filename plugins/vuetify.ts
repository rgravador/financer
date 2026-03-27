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
            primary: '#2563EB',
            secondary: '#64748B',
            accent: '#0EA5E9',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            'surface-variant': '#F1F5F9',
            'on-primary': '#FFFFFF',
            'on-secondary': '#000000',
            'on-success': '#FFFFFF',
            'on-warning': '#000000',
            'on-error': '#FFFFFF',
            'on-background': '#1E293B',
            'on-surface': '#1E293B',
          }
        },
        dark: {
          dark: true,
          colors: {
            primary: '#3B82F6',
            secondary: '#94A3B8',
            accent: '#38BDF8',
            success: '#34D399',
            warning: '#FBBF24',
            error: '#F87171',
            info: '#60A5FA',
            background: '#0F172A',
            surface: '#1E293B',
            'surface-variant': '#334155',
            'on-primary': '#FFFFFF',
            'on-secondary': '#000000',
            'on-success': '#000000',
            'on-warning': '#000000',
            'on-error': '#000000',
            'on-background': '#F1F5F9',
            'on-surface': '#F1F5F9',
          }
        }
      }
    },
    defaults: {
      VBtn: {
        style: 'text-transform: none;',
        rounded: 'lg',
        elevation: 0,
      },
      VCard: {
        elevation: 1,
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
