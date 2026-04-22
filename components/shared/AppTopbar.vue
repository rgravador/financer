<template>
  <v-app-bar
    app
    :height="72"
    elevation="0"
    class="app-topbar"
  >
    <!-- Mobile hamburger menu -->
    <v-btn
      v-if="isMobile"
      icon
      variant="text"
      class="hamburger-btn"
      aria-label="Toggle navigation menu"
      @click="$emit('toggleSidebar')"
    >
      <v-icon>{{ sidebarOpen ? 'mdi-close' : 'mdi-menu' }}</v-icon>
    </v-btn>

    <v-spacer />

    <div class="topbar-right">
      <!-- Notifications -->
      <NotificationBell />

      <!-- Divider -->
      <div class="topbar-divider" aria-hidden="true"></div>

      <!-- User Menu -->
      <v-menu offset-y :close-on-content-click="true">
        <template v-slot:activator="{ props: menuProps }">
          <button
            v-bind="menuProps"
            class="user-menu-btn"
            aria-label="User menu"
            aria-haspopup="menu"
          >
            <div class="user-avatar-small">
              <img :src="avatarImage" :alt="userName" class="avatar-img" loading="lazy" />
            </div>
            <v-icon size="16" class="dropdown-icon" aria-hidden="true">mdi-chevron-down</v-icon>
          </button>
        </template>

        <div class="user-dropdown" role="menu" aria-label="User options">
          <div class="dropdown-header">
            <div class="dropdown-avatar">
              <img :src="avatarImage" :alt="userName" class="avatar-img" loading="lazy" />
            </div>
            <div class="dropdown-info">
              <p class="dropdown-name">{{ userName }}</p>
              <p class="dropdown-email">{{ authStore.user?.email || '' }}</p>
            </div>
          </div>

          <div class="dropdown-divider" role="separator"></div>

          <button class="dropdown-item" role="menuitem" @click="handleProfile">
            <v-icon size="18" aria-hidden="true">mdi-account-outline</v-icon>
            <span>My Profile</span>
          </button>

          <button class="dropdown-item" role="menuitem" @click="handleSettings">
            <v-icon size="18" aria-hidden="true">mdi-cog-outline</v-icon>
            <span>Settings</span>
          </button>

          <button class="dropdown-item" role="menuitem" @click="toggleTheme" :aria-label="`Switch to ${isDarkMode ? 'light' : 'dark'} mode`">
            <v-icon size="18" aria-hidden="true">{{ isDarkMode ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
            <span>{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>

          <div class="dropdown-divider" role="separator"></div>

          <button class="dropdown-item logout-item" role="menuitem" @click="handleLogout">
            <v-icon size="18" aria-hidden="true">mdi-logout</v-icon>
            <span>Sign Out</span>
          </button>
        </div>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useDisplay } from 'vuetify'

defineProps<{
  sidebarOpen?: boolean
}>()

defineEmits<{
  toggleSidebar: []
}>()

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const authStore = useAuthStore()
const router = useRouter()
const colorMode = useColorMode()

// Theme
const isDarkMode = computed(() => colorMode.value === 'dark')
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

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
  } catch {
    // Logout errors are non-critical — redirect anyway
    router.push('/login')
  }
}
</script>

<style scoped>
.app-topbar {
  background-color: var(--bg-card) !important;
  border-bottom: 1px solid var(--border-color) !important;
  padding: 0 32px !important;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.hamburger-btn {
  color: var(--text-primary);
}

/* Right Section */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
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

.user-menu-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
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

.dropdown-item:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

.dropdown-item.logout-item {
  color: var(--color-error);
}

.dropdown-item.logout-item:hover {
  background: rgb(var(--v-theme-error) / 0.1);
}

/* Responsive */
@media (max-width: 960px) {
  .app-topbar {
    padding: 0 16px !important;
  }
}

@media (max-width: 600px) {
  .topbar-divider {
    display: none;
  }
}
</style>
