<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UserMenu from './UserMenu.vue'

const props = defineProps<{
  mobileDrawer?: boolean
}>()

const emit = defineEmits<{
  'update:mobile-drawer': [value: boolean]
}>()

const route = useRoute()

const pageTitle = computed(() => {
  const path = route.path

  // Extract title from route path
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return 'Dashboard'

  const lastSegment = segments[segments.length - 1]
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const toggleMobileDrawer = () => {
  emit('update:mobile-drawer', !props.mobileDrawer)
}
</script>

<template>
  <v-app-bar elevation="0" border="b">
    <!-- Mobile menu button -->
    <v-app-bar-nav-icon
      class="d-lg-none"
      @click="toggleMobileDrawer"
    />

    <!-- Page title -->
    <v-app-bar-title>
      {{ pageTitle }}
    </v-app-bar-title>

    <v-spacer />

    <!-- Notifications (placeholder) -->
    <v-btn icon>
      <v-badge
        content="3"
        color="error"
        dot
      >
        <v-icon>mdi-bell</v-icon>
      </v-badge>
    </v-btn>

    <!-- User menu -->
    <UserMenu />
  </v-app-bar>
</template>
