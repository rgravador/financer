<template>
  <v-app>
    <AppSidebar />
    <AppTopbar />

    <v-main class="app-main">
      <div class="main-content">
        <slot />
      </div>
    </v-main>

    <!-- Global Snackbar -->
    <SnackbarContainer />
  </v-app>
</template>

<script setup lang="ts">
// Default layout with sidebar and topbar
// AppSidebar and AppTopbar are auto-imported from components/shared/
</script>

<style scoped>
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
</style>
