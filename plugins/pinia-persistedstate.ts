import { createPersistedState } from 'pinia-plugin-persistedstate'
import type { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = nuxtApp.$pinia as Pinia
  pinia.use(
    createPersistedState({
      storage: {
        getItem: (key: string) => {
          if (process.client) {
            return localStorage.getItem(key)
          }
          return null
        },
        setItem: (key: string, value: string) => {
          if (process.client) {
            localStorage.setItem(key, value)
          }
        }
      }
    })
  )
})
