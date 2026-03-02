<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  actionText?: string
}>()

const emit = defineEmits<{
  action: []
}>()

const handleAction = () => {
  emit('action')
}
</script>

<template>
  <v-sheet
    class="d-flex flex-column align-center justify-center pa-12"
    color="transparent"
  >
    <v-icon
      v-if="icon"
      :icon="icon"
      size="64"
      color="grey-lighten-1"
      class="mb-4"
    />

    <div class="text-h6 text-center mb-2">
      {{ title }}
    </div>

    <div v-if="description" class="text-body-2 text-medium-emphasis text-center mb-4" style="max-width: 400px;">
      {{ description }}
    </div>

    <v-btn
      v-if="actionText"
      color="primary"
      variant="elevated"
      @click="handleAction"
    >
      {{ actionText }}
    </v-btn>
  </v-sheet>
</template>
