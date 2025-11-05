<template>
  <v-app>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AuthLayout'
})
</script>

<style scoped>
.v-main {
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
}
</style>
