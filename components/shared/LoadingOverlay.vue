<script setup lang="ts">
defineProps<{
  loading: boolean
  message?: string
}>()
</script>

<template>
  <v-overlay
    :model-value="loading"
    class="align-center justify-center"
    persistent
  >
    <div class="text-center">
      <v-progress-circular
        indeterminate
        size="64"
        width="6"
        color="primary"
      />
      <div v-if="message" class="text-h6 mt-4 text-white">
        {{ message }}
      </div>
    </div>
  </v-overlay>
</template>
