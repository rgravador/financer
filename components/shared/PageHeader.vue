<script setup lang="ts">
interface Breadcrumb {
  title: string
  to?: string
  disabled?: boolean
}

defineProps<{
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  showBack?: boolean
}>()

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="page-header mb-6">
    <!-- Breadcrumbs -->
    <v-breadcrumbs
      v-if="breadcrumbs && breadcrumbs.length > 0"
      :items="breadcrumbs"
      density="compact"
      class="pa-0"
    >
      <template #divider>
        <v-icon icon="mdi-chevron-right" />
      </template>
    </v-breadcrumbs>

    <!-- Title and Actions -->
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-btn
          v-if="showBack"
          icon="mdi-arrow-left"
          variant="text"
          class="mr-2"
          @click="goBack"
        />
        <div>
          <h1 class="text-h4 font-weight-bold">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="text-body-1 text-medium-emphasis mt-1 mb-0">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Action slot -->
      <div>
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
</style>
