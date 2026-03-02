<template>
  <v-container fluid class="wf-content-padding">
    <!-- Loading State -->
    <div v-if="systemStore.loading && !tenant" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64" />
      <div class="text-h6 mt-4">Loading tenant details...</div>
    </div>

    <!-- Main Content -->
    <template v-else-if="tenant">
      <!-- Back Button -->
      <NuxtLink to="/system/tenants" class="back-btn">
        ← Back to Tenants
      </NuxtLink>

      <!-- Page Header -->
      <div class="wf-page-header">
        <h1>{{ tenant.name }}</h1>
      </div>

      <!-- Details Grid -->
      <div class="details-grid">
        <!-- Tenant Information Card -->
        <v-card class="wf-card">
          <div class="card-title">Tenant Information</div>
          <div class="wf-info-row">
            <span class="wf-info-label">Name</span>
            <span class="wf-info-value">{{ tenant.name }}</span>
          </div>
          <div class="wf-info-row">
            <span class="wf-info-label">Status</span>
            <span class="wf-info-value">
              <span
                class="wf-status-badge"
                :class="tenant.isActive ? 'active' : 'inactive'"
              >
                <span class="wf-status-dot"></span>
                {{ tenant.isActive ? 'Active' : 'Suspended' }}
              </span>
            </span>
          </div>
          <div class="wf-info-row">
            <span class="wf-info-label">Created</span>
            <span class="wf-info-value">{{ formatDateLong(tenant.createdAt) }}</span>
          </div>
          <div class="wf-info-row">
            <span class="wf-info-label">Total Users</span>
            <span class="wf-info-value">{{ tenant.userCount || 0 }}</span>
          </div>
          <div class="wf-info-row">
            <span class="wf-info-label">Slug</span>
            <span class="wf-info-value">{{ tenant.slug }}</span>
          </div>
          <div class="wf-info-row">
            <span class="wf-info-label">Active Loans</span>
            <span class="wf-info-value">{{ tenant.activeLoansCount || 0 }}</span>
          </div>
        </v-card>

        <!-- Quick Actions Card -->
        <v-card class="wf-card">
          <div class="card-title">Quick Actions</div>
          <div class="actions-list">
            <v-btn
              color="primary"
              block
              @click="handleToggleStatus"
            >
              {{ tenant.isActive ? 'Suspend Tenant' : 'Activate Tenant' }}
            </v-btn>
            <v-btn
              variant="outlined"
              block
              :to="`/admin/users?tenant=${tenant.id}`"
            >
              View Users
            </v-btn>
            <v-btn
              variant="outlined"
              block
              :to="`/loans/applications?tenant=${tenant.id}`"
            >
              View Loans
            </v-btn>
            <v-btn
              variant="outlined"
              block
              :to="`/system/audit-logs?tenant=${tenant.id}`"
            >
              View Audit Logs
            </v-btn>
          </div>
        </v-card>
      </div>

      <!-- Recent Activity Table -->
      <v-card class="wf-card mt-6">
        <div class="card-title">Users</div>
        <v-table class="wf-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in tenant.users" :key="user.id">
              <td>
                <strong>{{ user.firstName }} {{ user.lastName }}</strong>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span
                  class="wf-role-badge"
                  :class="getRoleClass(user.role)"
                >
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td>
                <span
                  class="wf-status-badge"
                  :class="user.isActive ? 'active' : 'inactive'"
                >
                  <span class="wf-status-dot"></span>
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
            </tr>
            <tr v-if="!tenant.users || tenant.users.length === 0">
              <td colspan="5" class="text-center pa-8">
                <div class="wf-empty-state">
                  <v-icon class="empty-icon">mdi-account-off</v-icon>
                  <div class="empty-title">No users in this tenant</div>
                  <div class="empty-message">Users will appear here once they are added</div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template>

    <!-- Error State -->
    <v-alert v-else-if="systemStore.error" type="error" variant="tonal" prominent>
      <v-alert-title>Error Loading Tenant</v-alert-title>
      <div>{{ systemStore.error }}</div>
    </v-alert>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: ['role'],
  role: ['system_admin'],
})

const route = useRoute()
const systemStore = useSystemStore()

const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const tenantId = computed(() => route.params.id as string)
const tenant = computed(() => systemStore.selectedTenant)

// Format date
const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format date long
const formatDateLong = (date: Date | string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format role
const formatRole = (role: string) => {
  const roleLabels: Record<string, string> = {
    system_admin: 'Admin',
    tenant_admin: 'Admin',
    tenant_officer: 'Officer',
    tenant_approver: 'Approver',
  }
  return roleLabels[role] || role
}

// Get role class
const getRoleClass = (role: string) => {
  const roleClasses: Record<string, string> = {
    system_admin: 'admin',
    tenant_admin: 'admin',
    tenant_officer: 'officer',
    tenant_approver: 'approver',
  }
  return roleClasses[role] || ''
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
.details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #1e3a8a;
}

@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
