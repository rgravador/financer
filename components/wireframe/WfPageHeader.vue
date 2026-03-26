<template>
  <div class="page-header">
    <v-breadcrumbs
      v-if="breadcrumbs && breadcrumbs.length > 0"
      :items="breadcrumbs"
      class="page-breadcrumbs"
      density="compact"
    >
      <template v-slot:divider>
        <v-icon size="14" class="breadcrumb-divider">mdi-chevron-right</v-icon>
      </template>
      <template v-slot:item="{ item }">
        <NuxtLink
          v-if="item.to && !item.disabled"
          :to="item.to"
          class="breadcrumb-link"
        >
          {{ item.title }}
        </NuxtLink>
        <span v-else class="breadcrumb-current">{{ item.title }}</span>
      </template>
    </v-breadcrumbs>

    <div class="header-content">
      <div class="header-text">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="header-actions">
        <slot name="actions" />
      </div>
    </div>
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
  --color-primary: #1e3a8a;
  --color-primary-light: #3b82f6;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-text-light: #94a3b8;
  --font-heading: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  margin-bottom: 32px;
}

/* Breadcrumbs */
.page-breadcrumbs {
  padding: 0 0 16px 0;
}

.page-breadcrumbs :deep(.v-breadcrumbs-item) {
  padding: 0;
}

.breadcrumb-link {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary);
}

.breadcrumb-current {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}

.breadcrumb-divider {
  color: var(--color-text-light);
  margin: 0 4px;
}

/* Header Content */
.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
