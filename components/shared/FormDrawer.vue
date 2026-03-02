<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title: string
  width?: string | number
}>(), {
  width: 500
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="right"
    temporary
    :width="width"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Title Bar -->
    <v-toolbar color="primary" dark>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
      <v-btn
        icon="mdi-close"
        @click="$emit('update:modelValue', false)"
      />
    </v-toolbar>

    <!-- Form Content -->
    <div class="pa-4">
      <slot />
    </div>

    <!-- Actions -->
    <template #append>
      <div class="pa-4" style="border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
        <slot name="actions">
          <v-btn
            variant="text"
            class="mr-2"
            @click="$emit('update:modelValue', false)"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
          >
            Save
          </v-btn>
        </slot>
      </div>
    </template>
  </v-navigation-drawer>
</template>
