<script setup lang="ts" generic="T">
import EmptyState from './EmptyState.vue'

withDefaults(defineProps<{
  columns: Array<{
    key: string
    title: string
    sortable?: boolean
    align?: 'start' | 'end' | 'center'
  }>
  items: T[]
  loading?: boolean
  emptyText?: string
  emptyIcon?: string
  itemsPerPage?: number
  showSelect?: boolean
}>(), {
  loading: false,
  emptyText: 'No data available',
  emptyIcon: 'mdi-inbox',
  itemsPerPage: 10,
  showSelect: false
})

const emit = defineEmits<{
  'row-click': [item: T]
  'update:selected': [items: T[]]
}>()

const handleRowClick = (item: T) => {
  emit('row-click', item)
}
</script>

<template>
  <v-card>
    <v-data-table
      :headers="columns"
      :items="items"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :show-select="showSelect"
      hover
      @click:row="(_event, { item }) => handleRowClick(item)"
      @update:model-value="$emit('update:selected', $event)"
    >
      <!-- Custom column slots -->
      <template
        v-for="(_column, name) in $slots"
        :key="name"
        #[name]="slotData"
      >
        <slot :name="name" v-bind="slotData" />
      </template>

      <!-- Empty state -->
      <template #no-data>
        <EmptyState
          :icon="emptyIcon"
          :title="emptyText"
          description="Try adjusting your filters or search criteria"
        />
      </template>

      <!-- Loading state -->
      <template #loading>
        <div class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
:deep(.v-data-table__tr) {
  cursor: pointer;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
