<template>
  <div class="page-header">
    <v-breadcrumbs
      v-if="breadcrumbs && breadcrumbs.length > 0"
      :items="breadcrumbs"
      class="page-breadcrumbs"
      density="compact"
    >
      <template v-slot:divider>
        <v-icon size="16">mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>

    <h1 class="page-title">{{ title }}</h1>
    <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
interface Breadcrumb {
  title: string
  to?: string
  disabled?: boolean
}

interface Props {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
}

withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  breadcrumbs: undefined,
})
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.page-breadcrumbs {
  padding: 0 0 8px 0;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: rgb(var(--v-theme-navy));
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}
</style>
