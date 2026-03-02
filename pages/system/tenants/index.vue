<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">Tenant Management</h1>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddModal = true">
            Add Tenant
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Total Tenants</div>
                <div class="text-h4">{{ systemStore.totalTenants }}</div>
              </div>
              <v-icon size="48" color="primary">mdi-office-building</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Active Tenants</div>
                <div class="text-h4">{{ systemStore.activeTenants.length }}</div>
              </div>
              <v-icon size="48" color="success">mdi-check-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Suspended</div>
                <div class="text-h4">{{ systemStore.inactiveTenants.length }}</div>
              </div>
              <v-icon size="48" color="warning">mdi-pause-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Total Users</div>
                <div class="text-h4">{{ systemStore.totalUsers }}</div>
              </div>
              <v-icon size="48" color="info">mdi-account-group</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tenants Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search tenants"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="ma-2"
            />
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="systemStore.tenants"
            :search="search"
            :loading="systemStore.loading"
            :items-per-page="10"
            class="elevation-1"
          >
            <template #item.name="{ item }">
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.slug }}</div>
            </template>

            <template #item.userCount="{ item }">
              <v-chip size="small" variant="tonal" color="info">
                {{ item.userCount }} users
              </v-chip>
            </template>

            <template #item.activeLoansCount="{ item }">
              <v-chip size="small" variant="tonal" color="primary">
                {{ item.activeLoansCount }} loans
              </v-chip>
            </template>

            <template #item.isActive="{ item }">
              <v-chip :color="item.isActive ? 'success' : 'warning'" size="small">
                {{ item.isActive ? 'Active' : 'Suspended' }}
              </v-chip>
            </template>

            <template #item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex gap-2">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  :to="`/system/tenants/${item.id}`"
                >
                  <v-icon>mdi-eye</v-icon>
                  <v-tooltip activator="parent" location="top">View Details</v-tooltip>
                </v-btn>

                <v-btn
                  :icon="item.isActive ? 'mdi-pause' : 'mdi-play'"
                  size="small"
                  variant="text"
                  :color="item.isActive ? 'warning' : 'success'"
                  @click="handleToggleStatus(item)"
                >
                  <v-icon>{{ item.isActive ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                  <v-tooltip activator="parent" location="top">
                    {{ item.isActive ? 'Suspend' : 'Activate' }}
                  </v-tooltip>
                </v-btn>
              </div>
            </template>

            <template #no-data>
              <div class="text-center pa-4">
                <v-icon size="64" color="grey-lighten-1">mdi-office-building-outline</v-icon>
                <div class="text-body-1 mt-2">No tenants found</div>
                <div class="text-caption text-medium-emphasis">Click "Add Tenant" to create your first tenant</div>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Tenant Modal -->
    <SystemTenantFormModal
      v-model="showAddModal"
      @created="handleTenantCreated"
    />

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: ['auth', 'role'],
  role: ['system_admin'],
})

const systemStore = useSystemStore()

const search = ref('')
const showAddModal = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Table headers
const headers = [
  { title: 'Tenant', key: 'name', sortable: true },
  { title: 'Users', key: 'userCount', sortable: true },
  { title: 'Active Loans', key: 'activeLoansCount', sortable: true },
  { title: 'Status', key: 'isActive', sortable: true },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Handle tenant created
const handleTenantCreated = (tenant: any) => {
  snackbarMessage.value = `Tenant "${tenant.name}" created successfully`
  snackbarColor.value = 'success'
  showSnackbar.value = true
}

// Handle toggle status
const handleToggleStatus = async (tenant: any) => {
  const action = tenant.isActive ? 'suspend' : 'activate'
  if (!confirm(`Are you sure you want to ${action} "${tenant.name}"?`)) {
    return
  }

  try {
    await systemStore.toggleTenantStatus(tenant.id)
    snackbarMessage.value = `Tenant "${tenant.name}" ${action}d successfully`
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error: any) {
    snackbarMessage.value = error.data?.statusMessage || `Failed to ${action} tenant`
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Load tenants on mount
onMounted(async () => {
  await systemStore.fetchTenants()
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
