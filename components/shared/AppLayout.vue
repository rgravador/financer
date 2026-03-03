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
import AppSidebar from '~/components/shared/AppSidebar.vue'
import AppTopbar from '~/components/shared/AppTopbar.vue'

// Layout wrapper component that provides the app structure
// Uses Vuetify's v-app, v-main with sidebar and topbar
</script>

<style scoped>
.app-main {
  padding: 32px;
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
}
</style>
