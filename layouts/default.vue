<template>
  <v-app>
    <!-- Skip to content link (a11y) -->
    <a href="#main-content" class="skip-to-content">Skip to main content</a>

    <AppSidebar v-model="sidebarOpen" />
    <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" :sidebar-open="sidebarOpen" />

    <v-main id="main-content" class="app-main">
      <div class="main-content">
        <slot />
      </div>
    </v-main>

    <!-- Global Snackbar -->
    <SnackbarContainer />
  </v-app>
</template>

<script setup lang="ts">
const sidebarOpen = ref(true)
</script>

<style scoped>
.skip-to-content {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: var(--z-skip-link, 2000);
  padding: 12px 24px;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 2px solid var(--accent-primary);
  border-radius: var(--border-radius-sm, 8px);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: top var(--transition-fast, 150ms);
}

.skip-to-content:focus {
  top: 16px;
}

.app-main {
  min-height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color var(--transition-base);
}

.main-content {
  padding: 32px;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

@media (max-width: 960px) {
  .main-content {
    padding: 24px;
  }
}

@media (max-width: 600px) {
  .main-content {
    padding: 16px;
  }
}
</style>
