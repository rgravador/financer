<template>
  <v-app-bar
    :height="64"
    elevation="0"
    class="app-topbar"
  >
    <!-- Search Box -->
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search..."
      variant="outlined"
      density="compact"
      hide-details
      class="search-field"
      clearable
    />

    <v-spacer />

    <!-- Notifications -->
    <v-btn
      icon="mdi-bell-outline"
      variant="text"
      class="topbar-btn"
    >
      <v-badge
        v-if="notificationCount > 0"
        :content="notificationCount"
        color="error"
        offset-x="-4"
        offset-y="-4"
      >
        <v-icon>mdi-bell-outline</v-icon>
      </v-badge>
      <v-icon v-else>mdi-bell-outline</v-icon>
    </v-btn>

    <!-- User Menu -->
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          class="user-menu-btn"
        >
          <v-icon>mdi-account-circle</v-icon>
          <span class="user-name">{{ authStore.user?.name || 'User' }}</span>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>

      <v-list density="compact">
        <v-list-item @click="handleProfile">
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>

        <v-list-item @click="handleSettings">
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>

        <v-divider class="my-1" />

        <v-list-item @click="handleLogout">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// Search query
const searchQuery = ref('')

// Mock notification count (would come from a notifications store)
const notificationCount = ref(3)

// Handle profile navigation
const handleProfile = () => {
  router.push('/profile')
}

// Handle settings navigation
const handleSettings = () => {
  router.push('/settings')
}

// Handle logout
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Watch search query for debounced search
watch(searchQuery, (newValue) => {
  if (!newValue) return
  // TODO: Implement search functionality
  console.log('Search:', newValue)
})
</script>

<style scoped>
.app-topbar {
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 32px;
}

.search-field {
  max-width: 400px;
}

.topbar-btn {
  color: rgba(0, 0, 0, 0.6);
  margin-left: 8px;
}

.topbar-btn:hover {
  color: rgba(0, 0, 0, 0.87);
}

.user-menu-btn {
  margin-left: 8px;
  text-transform: none;
  color: rgba(0, 0, 0, 0.87);
}

.user-name {
  margin: 0 8px;
  font-size: 14px;
}
</style>
