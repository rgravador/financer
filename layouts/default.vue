<template>
  <v-app>
    <AppSidebar />
    <AppTopbar />

    <v-main class="app-main">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// Default layout with sidebar and topbar
// AppSidebar and AppTopbar are auto-imported from components/shared/
</script>

<style scoped>
.app-main {
  padding: 32px;
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
}
</style>
