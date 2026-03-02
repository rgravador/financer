<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>Tenants Management</h1>
    </div>
    <p class="wf-page-subtitle">Manage all organizational tenants</p>

    <!-- Toolbar -->
    <div class="wf-toolbar mb-6">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddModal = true">
        Create Tenant
      </v-btn>
      <div class="wf-search-box">
        <v-icon class="search-icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Search tenants..."
        />
      </div>
    </div>

    <!-- Table Card -->
    <v-card class="wf-section-card">
      <v-table class="wf-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Users</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="tenant in filteredTenants"
            :key="tenant.id"
            @click="navigateToTenant(tenant.id)"
          >
            <td>
              <strong>{{ tenant.name }}</strong>
            </td>
            <td>
              <span
                class="wf-status-badge"
                :class="tenant.isActive ? 'active' : 'inactive'"
              >
                <span class="wf-status-dot"></span>
                {{ tenant.isActive ? 'Active' : 'Suspended' }}
              </span>
            </td>
            <td>{{ tenant.userCount || 0 }}</td>
            <td>{{ formatDate(tenant.createdAt) }}</td>
            <td>
              <a
                class="action-btn"
                @click.stop="navigateToTenant(tenant.id)"
              >
                View
              </a>
            </td>
          </tr>
          <tr v-if="filteredTenants.length === 0">
            <td colspan="5" class="text-center pa-8">
              <div class="wf-empty-state">
                <v-icon class="empty-icon">mdi-office-building-outline</v-icon>
                <div class="empty-title">No tenants found</div>
                <div class="empty-message">Click "Create Tenant" to add your first tenant</div>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <div class="wf-pagination" v-if="filteredTenants.length > 0">
        <button
          class="wf-pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ← Previous
        </button>
        <span class="wf-pagination-info">
          Page {{ currentPage }} of {{ totalPages }} ({{ filteredTenants.length }} total)
        </span>
        <button
          class="wf-pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next →
        </button>
      </div>
    </v-card>

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
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: ['role'],
  role: ['system_admin'],
})

const systemStore = useSystemStore()
const router = useRouter()

const search = ref('')
const showAddModal = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Filtered tenants based on search
const filteredTenants = computed(() => {
  if (!search.value) {
    return systemStore.tenants
  }

  const searchLower = search.value.toLowerCase()
  return systemStore.tenants.filter((tenant: any) =>
    tenant.name.toLowerCase().includes(searchLower)
  )
})

// Total pages for pagination
const totalPages = computed(() => {
  return Math.ceil(filteredTenants.value.length / itemsPerPage.value)
})

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Navigate to tenant details
const navigateToTenant = (tenantId: string) => {
  router.push(`/system/tenants/${tenantId}`)
}

// Handle tenant created
const handleTenantCreated = (tenant: any) => {
  snackbarMessage.value = `Tenant "${tenant.name}" created successfully`
  snackbarColor.value = 'success'
  showSnackbar.value = true
}

// Load tenants on mount
onMounted(async () => {
  await systemStore.fetchTenants()
})
</script>

<style scoped>
.action-btn {
  color: #1e3a8a;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  display: inline-block;
  cursor: pointer;
}

.action-btn:hover {
  background: #f0f4ff;
}
</style>
