<template>
  <div class="tenants-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Tenants</h1>
          <p class="page-subtitle">Manage all organizational tenants on your platform</p>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
            class="create-btn"
          >
            New Tenant
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="search-section">
      <div class="search-wrapper">
        <v-icon class="search-icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Search tenants by name..."
        >
        <v-icon
          v-if="search"
          class="clear-icon"
          @click="search = ''"
        >
          mdi-close-circle
        </v-icon>
      </div>

      <div class="filter-chips">
        <button
          class="filter-chip"
          :class="{ active: statusFilter === 'all' }"
          @click="statusFilter = 'all'"
        >
          All
        </button>
        <button
          class="filter-chip"
          :class="{ active: statusFilter === 'active' }"
          @click="statusFilter = 'active'"
        >
          <span class="chip-dot active"></span>
          Active
        </button>
        <button
          class="filter-chip"
          :class="{ active: statusFilter === 'suspended' }"
          @click="statusFilter = 'suspended'"
        >
          <span class="chip-dot suspended"></span>
          Suspended
        </button>
      </div>
    </div>

    <!-- Tenants Grid -->
    <div v-if="systemStore.loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="48" width="4" />
      <p class="loading-text">Loading tenants...</p>
    </div>

    <div v-else-if="filteredTenants.length === 0" class="empty-state">
      <div class="empty-icon">
        <v-icon size="64">mdi-office-building-outline</v-icon>
      </div>
      <h3 class="empty-title">No tenants found</h3>
      <p class="empty-text">
        {{ search ? 'Try adjusting your search or filters' : 'Get started by creating your first tenant' }}
      </p>
      <v-btn
        v-if="!search"
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
      >
        Create Your First Tenant
      </v-btn>
    </div>

    <div v-else class="tenants-grid">
      <div
        v-for="tenant in filteredTenants"
        :key="tenant.id"
        class="tenant-card"
        @click="viewTenant(tenant.id)"
      >
        <div class="card-header">
          <div class="tenant-avatar">
            {{ tenant.name.charAt(0).toUpperCase() }}
          </div>
          <div class="tenant-status">
            <span class="status-indicator" :class="tenant.isActive ? 'active' : 'suspended'"></span>
            {{ tenant.isActive ? 'Active' : 'Suspended' }}
          </div>
        </div>

        <div class="card-body">
          <h3 class="tenant-name">{{ tenant.name }}</h3>
          <p class="tenant-slug">{{ tenant.slug }}</p>
        </div>

        <div class="card-stats">
          <div class="stat">
            <v-icon size="18">mdi-account-multiple</v-icon>
            <span>{{ tenant.userCount || 0 }} users</span>
          </div>
          <div class="stat">
            <v-icon size="18">mdi-calendar</v-icon>
            <span>{{ formatDate(tenant.createdAt) }}</span>
          </div>
        </div>

        <div class="card-footer">
          <v-btn
            variant="text"
            color="primary"
            size="small"
            append-icon="mdi-arrow-right"
            @click.stop="viewTenant(tenant.id)"
          >
            View Details
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Create Tenant Dialog -->
    <v-dialog v-model="createDialog" max-width="520px" persistent>
      <v-card class="create-dialog">
        <div class="dialog-header">
          <div class="dialog-icon">
            <v-icon size="28" color="primary">mdi-office-building-plus</v-icon>
          </div>
          <div class="dialog-title-section">
            <h2 class="dialog-title">Create New Tenant</h2>
            <p class="dialog-subtitle">Add a new organization to your platform</p>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="closeCreateDialog"
            class="close-btn"
          />
        </div>

        <v-divider />

        <div class="dialog-body">
          <v-form ref="createForm" v-model="formValid" @submit.prevent="submitCreate">
            <div class="form-group">
              <label class="form-label">Organization Name</label>
              <v-text-field
                v-model="newTenant.name"
                placeholder="e.g., Acme Bank"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </div>

            <div class="form-group">
              <label class="form-label">URL Slug</label>
              <v-text-field
                v-model="newTenant.slug"
                placeholder="e.g., acme-bank"
                :rules="[rules.required, rules.slug]"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
              <p class="form-hint">
                <v-icon size="14">mdi-information</v-icon>
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4" density="compact">
              {{ errorMessage }}
            </v-alert>
          </v-form>
        </div>

        <v-divider />

        <div class="dialog-footer">
          <v-btn variant="text" size="large" @click="closeCreateDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            size="large"
            :loading="creating"
            :disabled="!formValid"
            @click="submitCreate"
          >
            Create Tenant
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useSystemStore } from '~/stores/system'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

const systemStore = useSystemStore()
const router = useRouter()

const search = ref('')
const statusFilter = ref('all')
const createDialog = ref(false)
const formValid = ref(false)
const creating = ref(false)
const errorMessage = ref('')

const newTenant = ref({
  name: '',
  slug: '',
})

const rules = {
  required: (v: string) => !!v || 'This field is required',
  slug: (v: string) => {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugPattern.test(v) || 'Must be lowercase with hyphens only'
  },
}

const filteredTenants = computed(() => {
  let tenants = systemStore.tenants

  if (search.value) {
    const searchLower = search.value.toLowerCase()
    tenants = tenants.filter(tenant =>
      tenant.name.toLowerCase().includes(searchLower)
    )
  }

  if (statusFilter.value === 'active') {
    tenants = tenants.filter(tenant => tenant.isActive)
  } else if (statusFilter.value === 'suspended') {
    tenants = tenants.filter(tenant => !tenant.isActive)
  }

  return tenants
})

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const openCreateDialog = () => {
  createDialog.value = true
  errorMessage.value = ''
}

const closeCreateDialog = () => {
  createDialog.value = false
  newTenant.value = { name: '', slug: '' }
  errorMessage.value = ''
}

const submitCreate = async () => {
  if (!formValid.value) return

  creating.value = true
  errorMessage.value = ''

  try {
    await systemStore.createTenant({
      name: newTenant.value.name,
      slug: newTenant.value.slug,
    })
    closeCreateDialog()
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || error.message || 'Failed to create tenant'
  } finally {
    creating.value = false
  }
}

const viewTenant = (tenantId: string) => {
  router.push(`/system/tenants/${tenantId}`)
}

watch(() => newTenant.value.name, (newName) => {
  if (!newName) {
    newTenant.value.slug = ''
    return
  }
  newTenant.value.slug = newName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
})

onMounted(async () => {
  try {
    await systemStore.fetchTenants()
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
  }
})
</script>

<style scoped>
.tenants-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  transition: color var(--transition-base);
}

.page-subtitle {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
  transition: color var(--transition-base);
}

.create-btn {
  font-family: var(--font-display);
  font-weight: 600;
}

/* Search Section */
.search-section {
  display: flex;
  gap: 20px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 280px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: all var(--transition-base);
}

.search-wrapper:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
}

.search-icon {
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.search-wrapper:focus-within .search-icon {
  color: var(--accent-primary);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-icon {
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--transition-base);
}

.clear-icon:hover {
  color: var(--text-secondary);
}

.filter-chips {
  display: flex;
  gap: 8px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.filter-chip:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.filter-chip.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--text-inverse);
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chip-dot.active {
  background: #10b981;
}

.chip-dot.suspended {
  background: #ef4444;
}

.filter-chip.active .chip-dot.active {
  background: #a7f3d0;
}

.filter-chip.active .chip-dot.suspended {
  background: #fecaca;
}

/* Loading & Empty States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-text {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
  transition: color var(--transition-base);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  text-align: center;
  padding: 48px;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: var(--bg-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: background-color var(--transition-base), color var(--transition-base);
}

.empty-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  transition: color var(--transition-base);
}

.empty-text {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--text-muted);
  margin: 0 0 8px 0;
  transition: color var(--transition-base);
}

/* Tenants Grid */
.tenants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.tenant-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tenant-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tenant-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
}

.tenant-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.active {
  background: #10b981;
}

.status-indicator.suspended {
  background: #ef4444;
}

.card-body {
  flex: 1;
}

.tenant-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  transition: color var(--transition-base);
}

.tenant-slug {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  transition: color var(--transition-base);
}

.card-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.stat .v-icon {
  color: var(--text-muted);
}

.card-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
  margin-top: auto;
  transition: border-color var(--transition-base);
}

/* Create Dialog */
.create-dialog {
  border-radius: 20px !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
}

.dialog-icon {
  width: 52px;
  height: 52px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-title-section {
  flex: 1;
}

.dialog-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  transition: color var(--transition-base);
}

.dialog-subtitle {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  transition: color var(--transition-base);
}

.close-btn {
  color: var(--text-muted);
}

.dialog-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  transition: color var(--transition-base);
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
  transition: color var(--transition-base);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
}

/* Responsive */
@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-section {
    flex-direction: column;
  }

  .filter-chips {
    justify-content: center;
  }

  .page-title {
    font-size: 26px;
  }

  .tenants-grid {
    grid-template-columns: 1fr;
  }
}
</style>
