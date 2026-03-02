<template>
  <v-container fluid>
    <v-row v-if="systemStore.loading && !tenant">
      <v-col cols="12" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="text-h6 mt-4">Loading tenant details...</div>
      </v-col>
    </v-row>

    <template v-else-if="tenant">
      <!-- Header -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <v-btn
                icon="mdi-arrow-left"
                variant="text"
                :to="'/system/tenants'"
                class="mr-2"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <span class="text-h4">{{ tenant.name }}</span>
              <v-chip
                :color="tenant.isActive ? 'success' : 'warning'"
                size="small"
                class="ml-2"
              >
                {{ tenant.isActive ? 'Active' : 'Suspended' }}
              </v-chip>
            </div>

            <div class="d-flex gap-2">
              <v-btn
                :color="tenant.isActive ? 'warning' : 'success'"
                variant="outlined"
                :prepend-icon="tenant.isActive ? 'mdi-pause' : 'mdi-play'"
                @click="handleToggleStatus"
              >
                {{ tenant.isActive ? 'Suspend' : 'Activate' }}
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Tenant Info Cards -->
      <v-row>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon start>mdi-information</v-icon>
              Tenant Information
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <v-list-item-title class="text-caption text-medium-emphasis">Name</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1">{{ tenant.name }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title class="text-caption text-medium-emphasis">Slug</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1">{{ tenant.slug }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title class="text-caption text-medium-emphasis">Created</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1">{{ formatDate(tenant.createdAt) }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title class="text-caption text-medium-emphasis">Last Updated</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1">{{ formatDate(tenant.updatedAt) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" sm="6">
              <v-card>
                <v-card-text>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-caption text-medium-emphasis">Total Users</div>
                      <div class="text-h4">{{ tenant.userCount || 0 }}</div>
                    </div>
                    <v-icon size="48" color="info">mdi-account-group</v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6">
              <v-card>
                <v-card-text>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-caption text-medium-emphasis">Active Loans</div>
                      <div class="text-h4">{{ tenant.activeLoansCount || 0 }}</div>
                    </div>
                    <v-icon size="48" color="primary">mdi-file-document-multiple</v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Users Table -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <div class="d-flex align-center justify-space-between w-100">
                <span>Users</span>
                <v-chip size="small" variant="tonal">
                  {{ tenant.users?.length || 0 }} users
                </v-chip>
              </div>
            </v-card-title>

            <v-data-table
              :headers="userHeaders"
              :items="tenant.users || []"
              :items-per-page="10"
              class="elevation-1"
            >
              <template #item.name="{ item }">
                <div class="font-weight-medium">{{ item.firstName }} {{ item.lastName }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
              </template>

              <template #item.role="{ item }">
                <v-chip :color="getRoleColor(item.role)" size="small">
                  {{ formatRole(item.role) }}
                </v-chip>
              </template>

              <template #item.isActive="{ item }">
                <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
                  {{ item.isActive ? 'Active' : 'Inactive' }}
                </v-chip>
              </template>

              <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>

              <template #no-data>
                <div class="text-center pa-4">
                  <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
                  <div class="text-body-1 mt-2">No users in this tenant</div>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Error State -->
    <v-row v-else-if="systemStore.error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" prominent>
          <v-alert-title>Error Loading Tenant</v-alert-title>
          <div>{{ systemStore.error }}</div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: ['auth', 'role'],
  role: ['system_admin'],
})

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()

const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const tenantId = computed(() => route.params.id as string)
const tenant = computed(() => systemStore.selectedTenant)

// User table headers
const userHeaders = [
  { title: 'User', key: 'name', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Status', key: 'isActive', sortable: true },
  { title: 'Joined', key: 'createdAt', sortable: true },
]

// Format date
const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format role
const formatRole = (role: string) => {
  const roleLabels: Record<string, string> = {
    system_admin: 'System Admin',
    tenant_admin: 'Tenant Admin',
    tenant_officer: 'Loan Officer',
    tenant_approver: 'Approver',
  }
  return roleLabels[role] || role
}

// Get role color
const getRoleColor = (role: string) => {
  const roleColors: Record<string, string> = {
    system_admin: 'purple',
    tenant_admin: 'indigo',
    tenant_officer: 'blue',
    tenant_approver: 'amber',
  }
  return roleColors[role] || 'grey'
}

// Handle toggle status
const handleToggleStatus = async () => {
  if (!tenant.value) return

  const action = tenant.value.isActive ? 'suspend' : 'activate'
  if (!confirm(`Are you sure you want to ${action} "${tenant.value.name}"?`)) {
    return
  }

  try {
    await systemStore.toggleTenantStatus(tenantId.value)
    snackbarMessage.value = `Tenant "${tenant.value.name}" ${action}d successfully`
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error: any) {
    snackbarMessage.value = error.data?.statusMessage || `Failed to ${action} tenant`
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Load tenant on mount
onMounted(async () => {
  try {
    await systemStore.fetchTenant(tenantId.value)
  } catch (error) {
    console.error('Failed to load tenant:', error)
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.w-100 {
  width: 100%;
}
</style>
