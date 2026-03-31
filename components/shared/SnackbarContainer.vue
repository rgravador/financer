<template>
  <v-snackbar
    v-model="snackbar.state.value.show"
    :color="snackbar.state.value.color"
    :timeout="snackbar.state.value.timeout"
    location="bottom right"
    class="app-snackbar"
  >
    <div class="snackbar-content">
      <v-icon v-if="snackbarIcon" class="snackbar-icon">{{ snackbarIcon }}</v-icon>
      <span class="snackbar-message">{{ snackbar.state.value.message }}</span>
    </div>

    <template v-slot:actions>
      <v-btn
        variant="text"
        size="small"
        @click="snackbar.hide()"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
const snackbar = useSnackbar()

const snackbarIcon = computed(() => {
  const icons: Record<string, string> = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
  }
  return icons[snackbar.state.value.color] || ''
})
</script>

<style scoped>
.app-snackbar {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.snackbar-icon {
  font-size: 20px;
}

.snackbar-message {
  font-size: 14px;
  font-weight: 500;
}
</style>
