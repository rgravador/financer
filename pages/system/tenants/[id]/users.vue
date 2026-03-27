<template>
  <div class="tenant-users-page">
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb">
      <NuxtLink to="/system/tenants" class="breadcrumb-link">
        <v-icon size="16">mdi-domain</v-icon>
        Tenants
      </NuxtLink>
      <v-icon size="14" class="breadcrumb-separator">mdi-chevron-right</v-icon>
      <NuxtLink :to="`/system/tenants/${tenantId}`" class="breadcrumb-link">
        {{ tenantName }}
      </NuxtLink>
      <v-icon size="14" class="breadcrumb-separator">mdi-chevron-right</v-icon>
      <span class="breadcrumb-current">Administrators</span>
    </nav>

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Tenant Administrators</h1>
        <p class="page-subtitle">
          Manage administrators for <strong>{{ tenantName }}</strong>
        </p>
      </div>
      <div class="header-actions">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-lock-reset"
          @click="showDefaultPasswordDialog = true"
        >
          Default Password
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Add Administrator
        </v-btn>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search by name or email..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="search-field"
      />
      <v-select
        v-model="statusFilter"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        variant="outlined"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-filter-variant"
        class="status-filter"
        :menu-props="{ contentClass: 'status-filter-menu' }"
      />
    </div>

    <!-- Loading State -->
    <div v-if="systemStore.loading && !systemStore.tenantAdmins.length" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="loading-text">Loading administrators...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="systemStore.error" class="error-container">
      <v-icon size="48" color="error">mdi-alert-circle</v-icon>
      <h3 class="error-title">Failed to load administrators</h3>
      <p class="error-message">{{ systemStore.error }}</p>
      <v-btn color="primary" variant="outlined" @click="loadAdmins">
        <v-icon start>mdi-refresh</v-icon>
        Try Again
      </v-btn>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredAdmins.length === 0" class="empty-container">
      <div class="empty-icon">
        <v-icon size="64">mdi-account-plus-outline</v-icon>
      </div>
      <h3 class="empty-title">
        {{ searchQuery || statusFilter !== 'all' ? 'No administrators found' : 'No administrators yet' }}
      </h3>
      <p class="empty-message">
        {{ searchQuery || statusFilter !== 'all'
          ? 'Try adjusting your search or filter criteria.'
          : 'Create the first administrator for this tenant to get started.'
        }}
      </p>
      <v-btn
        v-if="!searchQuery && statusFilter === 'all'"
        color="primary"
        @click="openCreateDialog"
      >
        <v-icon start>mdi-plus</v-icon>
        Add Administrator
      </v-btn>
    </div>

    <!-- Admins Table -->
    <v-card v-else class="admins-table-card" elevation="0">
      <v-data-table
        :headers="tableHeaders"
        :items="filteredAdmins"
        :loading="systemStore.loading"
        class="admins-table"
        item-value="id"
        hover
      >
        <!-- Name Column -->
        <template #item.name="{ item }">
          <div class="user-cell">
            <v-avatar size="44" color="primary" variant="tonal" class="user-avatar">
              <span class="avatar-text">{{ getInitials(item.firstName, item.lastName) }}</span>
            </v-avatar>
            <div class="user-info">
              <span class="user-name">{{ item.firstName }} {{ item.lastName }}</span>
              <span class="user-email">{{ item.email }}</span>
            </div>
          </div>
        </template>

        <!-- Status Column -->
        <template #item.isActive="{ item }">
          <div class="status-badge" :class="item.isActive ? 'status-active' : 'status-inactive'">
            <span class="status-dot"></span>
            <span class="status-text">{{ item.isActive ? 'Active' : 'Inactive' }}</span>
          </div>
        </template>

        <!-- Password Status Column -->
        <template #item.mustChangePassword="{ item }">
          <div v-if="item.mustChangePassword" class="password-badge">
            <v-icon size="16" class="password-icon">mdi-alert-circle</v-icon>
            <span>Change Required</span>
          </div>
          <span v-else class="text-muted">—</span>
        </template>

        <!-- Created Date Column -->
        <template #item.createdAt="{ item }">
          <span class="date-text">{{ formatDate(item.createdAt) }}</span>
        </template>

        <!-- Last Login Column -->
        <template #item.lastLogin="{ item }">
          <span v-if="item.lastLogin" class="date-text">{{ formatDate(item.lastLogin) }}</span>
          <span v-else class="text-muted">Never</span>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                v-bind="props"
                class="action-btn"
              />
            </template>
            <v-list class="actions-menu">
              <v-list-item prepend-icon="mdi-pencil-outline" @click="openEditDialog(item)">
                <v-list-item-title>Edit Profile</v-list-item-title>
              </v-list-item>
              <v-list-item prepend-icon="mdi-lock-reset" @click="openResetPasswordDialog(item)">
                <v-list-item-title>Reset Password</v-list-item-title>
              </v-list-item>
              <v-list-item
                :prepend-icon="item.isActive ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
                @click="toggleStatus(item)"
              >
                <v-list-item-title>{{ item.isActive ? 'Deactivate' : 'Activate' }}</v-list-item-title>
              </v-list-item>
              <v-divider class="my-1" />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                class="delete-action"
                @click="openDeleteDialog(item)"
              >
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showFormDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="dialog-title">
          <v-icon start>{{ editingAdmin ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
          {{ editingAdmin ? 'Edit Administrator' : 'Create Administrator' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submitForm">
            <v-text-field
              v-model="formData.firstName"
              label="First Name"
              :rules="[rules.required, rules.minLength(2), rules.maxLength(50)]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />
            <v-text-field
              v-model="formData.lastName"
              label="Last Name"
              :rules="[rules.required, rules.minLength(2), rules.maxLength(50)]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />
            <v-text-field
              v-model="formData.email"
              label="Email Address"
              type="email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />
            <v-switch
              v-if="editingAdmin"
              v-model="formData.isActive"
              label="Active"
              color="success"
              hide-details
            />
          </v-form>
          <v-alert
            v-if="!editingAdmin"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            A temporary password will be generated. The user must change it on first login.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="formLoading"
            @click="submitForm"
          >
            {{ editingAdmin ? 'Save Changes' : 'Create Administrator' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Password Display Dialog -->
    <v-dialog v-model="showPasswordDialog" max-width="450" persistent>
      <v-card>
        <v-card-title class="dialog-title">
          <v-icon start color="success">mdi-check-circle</v-icon>
          Administrator Created
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            The administrator account has been created successfully. Please share the temporary password securely with the user.
          </p>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            This password will only be shown once. Make sure to copy it now.
          </v-alert>
          <div class="password-display">
            <v-text-field
              :model-value="tempPassword"
              label="Temporary Password"
              :type="showPassword ? 'text' : 'password'"
              readonly
              variant="outlined"
              density="comfortable"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            />
            <v-btn
              color="primary"
              variant="tonal"
              :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
              @click="copyPassword"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="closePasswordDialog">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reset Password Dialog -->
    <v-dialog v-model="showResetDialog" max-width="480">
      <v-card>
        <v-card-title class="dialog-title">
          <v-icon start color="warning">mdi-lock-reset</v-icon>
          Reset Password
        </v-card-title>
        <v-card-text>
          <p>
            Reset the password for
            <strong>{{ selectedAdmin?.firstName }} {{ selectedAdmin?.lastName }}</strong>
          </p>

          <!-- Reset Options -->
          <v-radio-group v-model="resetPasswordOption" class="mt-4">
            <v-radio value="random" class="reset-option">
              <template #label>
                <div class="option-label">
                  <span class="option-title">Generate random password</span>
                  <span class="option-desc">A secure random password will be generated</span>
                </div>
              </template>
            </v-radio>
            <v-radio
              value="default"
              :disabled="!defaultPasswordIsSet"
              class="reset-option"
            >
              <template #label>
                <div class="option-label">
                  <span class="option-title">Reset to default password</span>
                  <span class="option-desc">
                    {{ defaultPasswordIsSet
                      ? 'Use the configured default password'
                      : 'No default password configured'
                    }}
                  </span>
                </div>
              </template>
            </v-radio>
          </v-radio-group>

          <v-alert type="info" variant="tonal" density="compact" class="mt-3">
            This will log the user out of all active sessions. They must change their password on next login.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showResetDialog = false">Cancel</v-btn>
          <v-btn
            color="warning"
            :loading="resetLoading"
            @click="confirmResetPassword"
          >
            Reset Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card>
        <v-card-title class="dialog-title">
          <v-icon start color="error">mdi-alert</v-icon>
          Delete Administrator
        </v-card-title>
        <v-card-text>
          <p>
            Are you sure you want to delete
            <strong>{{ selectedAdmin?.firstName }} {{ selectedAdmin?.lastName }}</strong>?
          </p>
          <v-alert type="error" variant="tonal" density="compact" class="mt-3">
            This action will deactivate the account and revoke all active sessions. The user will no longer be able to access the system.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            :loading="deleteLoading"
            @click="confirmDelete"
          >
            Delete Administrator
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Default Password Dialog -->
    <v-dialog v-model="showDefaultPasswordDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="dialog-title">
          <v-icon start color="primary">mdi-lock-reset</v-icon>
          Default Password Settings
        </v-card-title>
        <v-card-text>
          <v-alert
            v-if="defaultPasswordIsSet"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <div class="d-flex align-center justify-space-between">
              <span>Default password is configured</span>
              <v-chip size="small" color="success" variant="flat">Active</v-chip>
            </div>
          </v-alert>
          <v-alert
            v-else
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            No default password configured. Random passwords will be generated for new administrators.
          </v-alert>

          <p class="text-body-2 mb-4">
            When set, this password will be used for all new tenant administrator accounts instead of generating random passwords.
          </p>

          <!-- Current Default Password (Read-only) -->
          <v-text-field
            v-if="defaultPasswordIsSet && currentDefaultPassword"
            :model-value="currentDefaultPassword"
            label="Current Default Password"
            :type="showCurrentPassword ? 'text' : 'password'"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            density="comfortable"
            readonly
            class="mb-4"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
          />

          <!-- New Password Input -->
          <v-text-field
            v-model="defaultPasswordInput"
            :label="defaultPasswordIsSet ? 'New Default Password' : 'Default Password'"
            :type="showDefaultPassword ? 'text' : 'password'"
            :append-inner-icon="showDefaultPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            density="comfortable"
            :placeholder="defaultPasswordIsSet ? 'Enter new password to update' : 'Enter default password'"
            hint="Minimum 8 characters with uppercase, lowercase, number, and special character"
            persistent-hint
            @click:append-inner="showDefaultPassword = !showDefaultPassword"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="defaultPasswordIsSet"
            color="error"
            variant="text"
            :loading="removingDefaultPassword"
            @click="removeDefaultPassword"
          >
            Remove Default
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="closeDefaultPasswordDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="savingDefaultPassword"
            :disabled="!defaultPasswordInput.trim()"
            @click="saveDefaultPassword"
          >
            {{ defaultPasswordIsSet ? 'Update' : 'Set Password' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useSystemStore, type TenantAdmin } from '~/stores/system'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

const route = useRoute()
const systemStore = useSystemStore()

const tenantId = route.params.id as string

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('all')
const showFormDialog = ref(false)
const showPasswordDialog = ref(false)
const showResetDialog = ref(false)
const showDeleteDialog = ref(false)
const editingAdmin = ref<TenantAdmin | null>(null)
const selectedAdmin = ref<TenantAdmin | null>(null)
const formLoading = ref(false)
const resetLoading = ref(false)
const deleteLoading = ref(false)
const tempPassword = ref('')
const showPassword = ref(false)
const copied = ref(false)
const formRef = ref()
const resetPasswordOption = ref<'random' | 'default'>('random')

// Default password dialog state
const showDefaultPasswordDialog = ref(false)
const defaultPasswordInput = ref('')
const showDefaultPassword = ref(false)
const showCurrentPassword = ref(false)
const savingDefaultPassword = ref(false)
const removingDefaultPassword = ref(false)

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  isActive: true,
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Status filter options
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

// Table headers
const tableHeaders = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Status', key: 'isActive', sortable: true, width: 120 },
  { title: 'Password', key: 'mustChangePassword', sortable: false, width: 140 },
  { title: 'Created', key: 'createdAt', sortable: true, width: 140 },
  { title: 'Last Login', key: 'lastLogin', sortable: true, width: 140 },
  { title: '', key: 'actions', sortable: false, width: 60 },
]

// Form validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email address',
  minLength: (min: number) => (v: string) => (v && v.length >= min) || `Minimum ${min} characters`,
  maxLength: (max: number) => (v: string) => (v && v.length <= max) || `Maximum ${max} characters`,
}

// Computed
const tenantName = computed(() => {
  return systemStore.selectedTenantForAdmins?.name || 'Tenant'
})

const defaultPasswordIsSet = computed(() => {
  return systemStore.defaultPasswordStatus?.isSet || false
})

const currentDefaultPassword = computed(() => {
  return systemStore.defaultPasswordStatus?.currentPassword || null
})

const filteredAdmins = computed(() => {
  let admins = systemStore.tenantAdmins

  // Filter by status
  if (statusFilter.value === 'active') {
    admins = admins.filter(a => a.isActive)
  } else if (statusFilter.value === 'inactive') {
    admins = admins.filter(a => !a.isActive)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    admins = admins.filter(a =>
      a.firstName.toLowerCase().includes(query) ||
      a.lastName.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query)
    )
  }

  return admins
})

// Methods
const loadAdmins = async () => {
  try {
    await systemStore.fetchTenantAdmins(tenantId)
  } catch (error) {
    console.error('Failed to load admins:', error)
  }
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const formatDate = (date: Date | string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const openCreateDialog = () => {
  editingAdmin.value = null
  formData.value = { firstName: '', lastName: '', email: '', isActive: true }
  showFormDialog.value = true
}

const openEditDialog = (admin: TenantAdmin) => {
  editingAdmin.value = admin
  formData.value = {
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    isActive: admin.isActive,
  }
  showFormDialog.value = true
}

const closeFormDialog = () => {
  showFormDialog.value = false
  editingAdmin.value = null
  formData.value = { firstName: '', lastName: '', email: '', isActive: true }
}

const submitForm = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true
  try {
    if (editingAdmin.value) {
      await systemStore.updateTenantAdmin(tenantId, editingAdmin.value.id, {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        email: formData.value.email,
        isActive: formData.value.isActive,
      })
      showSnackbar('Administrator updated successfully', 'success')
      closeFormDialog()
    } else {
      const response = await systemStore.createTenantAdmin(tenantId, {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        email: formData.value.email,
      })
      tempPassword.value = response.temporaryPassword
      showFormDialog.value = false
      showPasswordDialog.value = true
    }
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Operation failed', 'error')
  } finally {
    formLoading.value = false
  }
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  tempPassword.value = ''
  showPassword.value = false
  copied.value = false
  formData.value = { firstName: '', lastName: '', email: '', isActive: true }
}

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(tempPassword.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const openResetPasswordDialog = (admin: TenantAdmin) => {
  selectedAdmin.value = admin
  resetPasswordOption.value = 'random' // Reset to default option
  showResetDialog.value = true
}

const confirmResetPassword = async () => {
  if (!selectedAdmin.value) return

  resetLoading.value = true
  try {
    const useDefault = resetPasswordOption.value === 'default'
    const response = await systemStore.resetTenantAdminPassword(tenantId, selectedAdmin.value.id, useDefault)
    tempPassword.value = response.temporaryPassword
    showResetDialog.value = false
    showPasswordDialog.value = true
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to reset password', 'error')
  } finally {
    resetLoading.value = false
  }
}

const toggleStatus = async (admin: TenantAdmin) => {
  try {
    await systemStore.toggleTenantAdminStatus(tenantId, admin.id)
    showSnackbar(`Administrator ${admin.isActive ? 'deactivated' : 'activated'} successfully`, 'success')
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Operation failed', 'error')
  }
}

const openDeleteDialog = (admin: TenantAdmin) => {
  selectedAdmin.value = admin
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedAdmin.value) return

  deleteLoading.value = true
  try {
    await systemStore.deleteTenantAdmin(tenantId, selectedAdmin.value.id)
    showSnackbar('Administrator deleted successfully', 'success')
    showDeleteDialog.value = false
    selectedAdmin.value = null
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to delete administrator', 'error')
  } finally {
    deleteLoading.value = false
  }
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Default password methods
const closeDefaultPasswordDialog = () => {
  showDefaultPasswordDialog.value = false
  defaultPasswordInput.value = ''
  showDefaultPassword.value = false
  showCurrentPassword.value = false
}

const saveDefaultPassword = async () => {
  if (!defaultPasswordInput.value.trim()) return

  savingDefaultPassword.value = true
  try {
    await systemStore.setDefaultPassword(defaultPasswordInput.value)
    showSnackbar('Default password has been set successfully', 'success')
    closeDefaultPasswordDialog()
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to set default password', 'error')
  } finally {
    savingDefaultPassword.value = false
  }
}

const removeDefaultPassword = async () => {
  removingDefaultPassword.value = true
  try {
    await systemStore.removeDefaultPassword()
    showSnackbar('Default password has been removed', 'success')
    closeDefaultPasswordDialog()
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to remove default password', 'error')
  } finally {
    removingDefaultPassword.value = false
  }
}

// Lifecycle
onMounted(async () => {
  loadAdmins()
  // Fetch default password status for reset dialog
  try {
    await systemStore.fetchDefaultPasswordStatus()
  } catch (error) {
    console.error('Failed to fetch default password status:', error)
  }
})

onUnmounted(() => {
  systemStore.clearTenantAdmins()
})
</script>

<style scoped>
.tenant-users-page {
  padding: 0;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  font-size: 14px;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: rgb(var(--v-theme-primary));
}

.breadcrumb-separator {
  color: rgba(var(--v-theme-on-surface), 0.3);
}

.breadcrumb-current {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

.page-subtitle strong {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Filters */
.filters-row {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  align-items: center;
}

.search-field {
  max-width: 360px;
  flex: 1;
}

.search-field :deep(.v-field) {
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.search-field :deep(.v-field:hover) {
  border-color: rgba(var(--v-theme-on-surface), 0.24);
}

.search-field :deep(.v-field--focused) {
  border-color: rgb(var(--v-theme-primary));
}

/* Status Filter Dropdown - Fixed visibility */
.status-filter {
  min-width: 170px;
  max-width: 180px;
}

.status-filter :deep(.v-field) {
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.status-filter :deep(.v-field:hover) {
  border-color: rgba(var(--v-theme-on-surface), 0.24);
}

.status-filter :deep(.v-field--focused) {
  border-color: rgb(var(--v-theme-primary));
}

.status-filter :deep(.v-field__prepend-inner) {
  color: rgb(var(--v-theme-primary));
  opacity: 1;
}

.status-filter :deep(.v-field__input) {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
  opacity: 1;
}

.status-filter :deep(.v-select__selection-text) {
  color: rgb(var(--v-theme-on-surface));
  opacity: 1;
}


/* Loading/Error/Empty States */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.loading-text {
  margin-top: 20px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 15px;
}

.error-title,
.empty-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 20px 0 8px;
}

.error-message,
.empty-message {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 24px;
  max-width: 400px;
  font-size: 15px;
  line-height: 1.5;
}

.empty-icon {
  width: 120px;
  height: 120px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
}

/* Table Card */
.admins-table-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}

/* Data Table Styling */
.admins-table :deep(.v-data-table-header) {
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.admins-table :deep(.v-data-table-header th) {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.6);
  padding: 16px 20px !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.admins-table :deep(.v-data-table__tr) {
  transition: background 0.15s ease;
}

.admins-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.04) !important;
}

.admins-table :deep(.v-data-table__tr td) {
  padding: 20px 20px !important;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  vertical-align: middle;
}

.admins-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 12px 16px;
}

/* User Cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-text {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.user-email {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.55);
  line-height: 1.3;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-active {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.status-active .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.status-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-inactive .status-dot {
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

/* Password Badge */
.password-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  font-size: 13px;
  font-weight: 500;
}

.password-icon {
  color: inherit;
}

/* Date Text */
.date-text {
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 14px;
}

.text-muted {
  color: rgba(var(--v-theme-on-surface), 0.4);
}

/* Actions */
.action-btn {
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.action-btn:hover {
  opacity: 1;
}

.actions-menu {
  min-width: 180px;
  border-radius: 12px;
  padding: 6px;
}

.actions-menu :deep(.v-list-item) {
  border-radius: 8px;
  min-height: 40px;
  padding: 0 12px;
  margin: 2px 0;
}

.actions-menu :deep(.v-list-item:hover) {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.actions-menu :deep(.v-list-item-title) {
  font-size: 14px;
}

.delete-action {
  color: rgb(var(--v-theme-error)) !important;
}

.delete-action :deep(.v-icon) {
  color: rgb(var(--v-theme-error)) !important;
}

/* Reset Password Options */
.reset-option {
  margin-bottom: 8px;
}

.reset-option :deep(.v-label) {
  opacity: 1;
}

.option-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-title {
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.option-desc {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Dialog */
.dialog-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 20px 24px 16px;
}

.password-display {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.password-display .v-text-field {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-row {
    flex-direction: column;
  }

  .search-field {
    max-width: 100%;
  }

  .status-filter {
    max-width: 100%;
  }
}
</style>

<!-- Global styles for dropdown menu (teleported outside component) -->
<style>
.status-filter-menu {
  border-radius: 12px !important;
  padding: 6px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}

.status-filter-menu .v-list {
  background: rgb(var(--v-theme-surface)) !important;
  padding: 0 !important;
}

.status-filter-menu .v-list-item {
  border-radius: 8px !important;
  min-height: 44px !important;
  margin: 2px 0 !important;
}

.status-filter-menu .v-list-item:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
}

.status-filter-menu .v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.12) !important;
}

.status-filter-menu .v-list-item--active .v-list-item-title {
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600 !important;
}

.status-filter-menu .v-list-item-title {
  font-size: 14px !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}
</style>
