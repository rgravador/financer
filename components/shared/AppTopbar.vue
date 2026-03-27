<template>
  <v-app-bar
    app
    :height="72"
    elevation="0"
    class="app-topbar"
  >

    <v-spacer />

    <div class="topbar-right">
      <!-- Notifications -->
      <button class="topbar-btn notification-btn">
        <v-icon size="20">mdi-bell-outline</v-icon>
        <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
      </button>

      <!-- Divider -->
      <div class="topbar-divider"></div>

      <!-- User Menu -->
      <v-menu offset-y :close-on-content-click="true">
        <template v-slot:activator="{ props }">
          <button v-bind="props" class="user-menu-btn">
            <div class="user-avatar-small">
              <img :src="avatarImage" :alt="userName" class="avatar-img" />
            </div>
            <v-icon size="16" class="dropdown-icon">mdi-chevron-down</v-icon>
          </button>
        </template>

        <div class="user-dropdown">
          <div class="dropdown-header">
            <div class="dropdown-avatar">
              <img :src="avatarImage" :alt="userName" class="avatar-img" />
            </div>
            <div class="dropdown-info">
              <p class="dropdown-name">{{ userName }}</p>
              <p class="dropdown-email">{{ authStore.user?.email || '' }}</p>
            </div>
          </div>

          <div class="dropdown-divider"></div>

          <button class="dropdown-item" @click="handleProfile">
            <v-icon size="18">mdi-account-outline</v-icon>
            <span>My Profile</span>
          </button>

          <button class="dropdown-item" @click="handleSettings">
            <v-icon size="18">mdi-cog-outline</v-icon>
            <span>Settings</span>
          </button>

          <button class="dropdown-item" @click="toggleTheme">
            <v-icon size="18">{{ isDarkMode ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
            <span>{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>

          <div class="dropdown-divider"></div>

          <button class="dropdown-item logout-item" @click="handleLogout">
            <v-icon size="18">mdi-logout</v-icon>
            <span>Sign Out</span>
          </button>
        </div>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const colorMode = useColorMode()

// Theme
const isDarkMode = computed(() => colorMode.value === 'dark')
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Search query
const searchQuery = ref('')

// Mock notification count (would come from a notifications store)
const notificationCount = ref(3)

// Get avatar image based on gender (default to male if not provided)
const avatarImage = computed(() => {
  const gender = authStore.user?.gender || 'male'
  return gender === 'female' ? '/female-icon.jpg' : '/male-icon.jpg'
})

// Get user's full name
const userName = computed(() => {
  const user = authStore.user
  if (!user) return 'User'
  if (user.fullName) return user.fullName
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
  return user.firstName || user.lastName || user.email || 'User'
})

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
  background-color: var(--bg-card) !important;
  border-bottom: 1px solid var(--border-color) !important;
  padding: 0 32px !important;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

/* Search */
.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  min-width: 320px;
  transition: all var(--transition-base);
}

.search-container:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgb(245 158 11 / 0.15);
}

.search-icon {
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-shortcut {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 3px 6px;
  border-radius: 6px;
}

/* Right Section */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
}

.topbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  background: var(--color-error);
  color: white;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.topbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 8px;
}

/* User Menu Button */
.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.user-menu-btn:hover {
  background: var(--bg-hover);
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar-small .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-icon {
  color: var(--text-muted);
}

/* User Dropdown */
.user-dropdown {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  min-width: 240px;
  padding: 8px;
  margin-top: 8px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.dropdown-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--border-radius);
  overflow: hidden;
  flex-shrink: 0;
}

.dropdown-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-info {
  flex: 1;
  min-width: 0;
}

.dropdown-name {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.dropdown-email {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-hover);
}

.dropdown-item.logout-item {
  color: var(--color-error);
}

.dropdown-item.logout-item:hover {
  background: rgb(239 68 68 / 0.1);
}

/* Responsive */
@media (max-width: 900px) {
  .search-container {
    min-width: 200px;
  }

  .search-shortcut {
    display: none;
  }
}

@media (max-width: 640px) {
  .search-container {
    display: none;
  }
}
</style>
