<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import SnackbarContainer from './SnackbarContainer.vue'

const { mobile } = useDisplay()
const drawer = ref(!mobile.value) // Open on desktop, closed on mobile by default
</script>

<template>
  <v-app>
    <!-- Navigation Drawer (Sidebar) -->
    <v-navigation-drawer
      v-model="drawer"
      :temporary="mobile"
      :permanent="!mobile"
      width="260"
    >
      <AppSidebar />
    </v-navigation-drawer>

    <!-- Top Bar -->
    <AppTopbar
      v-model:mobile-drawer="drawer"
    />

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>

    <!-- Snackbar Notifications -->
    <SnackbarContainer />
  </v-app>
</template>
