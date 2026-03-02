<script setup lang="ts">
import { useSnackbar } from '~/composables/useSnackbar'

const { state, hide } = useSnackbar()
</script>

<template>
  <v-snackbar
    v-model="state.show"
    :color="state.color"
    :timeout="state.timeout"
    location="top right"
    @update:model-value="!$event && hide()"
  >
    {{ state.message }}

    <template #actions>
      <v-btn
        variant="text"
        @click="hide"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
