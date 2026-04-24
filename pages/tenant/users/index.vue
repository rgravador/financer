<template>
  <div class="users-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-group">
          <h1 class="page-title">Team Members</h1>
          <p class="page-subtitle">
            Manage officers, approvers, and administrators in your organization
          </p>
        </div>
        <div class="header-stats">
          <div class="stat-pill">
            <v-icon size="16" color="success">mdi-account-check</v-icon>
            <span class="stat-value">{{ activeUsersCount }}</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-pill">
            <v-icon size="16" color="warning">mdi-account-clock</v-icon>
            <span class="stat-value">{{ inactiveUsersCount }}</span>
            <span class="stat-label">Inactive</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="usersStore.loading"
          @click="loadUsers"
        >
          Refresh
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-account-plus"
          @click="openCreateDialog"
        >
          Add User
        </v-btn>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
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
      <div class="filter-group">
        <v-select
          v-model="roleFilter"
          :items="roleOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="compact"
          hide-details
          prepend-inner-icon="mdi-badge-account-outline"
          class="role-filter"
          :menu-props="{ contentClass: 'filter-dropdown-menu' }"
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
          :menu-props="{ contentClass: 'filter-dropdown-menu' }"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="usersStore.loading && !usersStore.users.length" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="56" width="4" />
      <p class="loading-text">Loading team members...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="usersStore.error" class="error-container">
      <div class="error-icon">
        <v-icon size="48" color="error">mdi-alert-circle-outline</v-icon>
      </div>
      <h3 class="error-title">Unable to load team members</h3>
      <p class="error-message">{{ usersStore.error }}</p>
      <v-btn color="primary" variant="outlined" @click="loadUsers">
        <v-icon start>mdi-refresh</v-icon>
        Try Again
      </v-btn>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredUsers.length === 0" class="empty-container">
      <div class="empty-illustration">
        <v-icon size="80" color="primary">mdi-account-group-outline</v-icon>
      </div>
      <h3 class="empty-title">
        {{ hasFilters ? 'No users found' : 'No team members yet' }}
      </h3>
      <p class="empty-message">
        {{ hasFilters
          ? 'Try adjusting your search or filter criteria.'
          : 'Add your first team member to get started with loan processing.'
        }}
      </p>
      <v-btn
        v-if="!hasFilters"
        color="primary"
        size="large"
        @click="openCreateDialog"
      >
        <v-icon start>mdi-account-plus</v-icon>
        Add First User
      </v-btn>
    </div>

    <!-- Users Grid -->
    <div v-else class="users-grid">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="user-card"
        :class="{ 'user-card--inactive': !user.isActive }"
      >
        <div class="user-card-header">
          <v-avatar size="56" :color="getRoleColor(user.role)" variant="tonal" class="user-avatar">
            <span class="avatar-text">{{ getInitials(user.firstName, user.lastName) }}</span>
          </v-avatar>
          <div class="user-status-badge" :class="user.isActive ? 'status-active' : 'status-inactive'">
            <span class="status-dot"></span>
            {{ user.isActive ? 'Active' : 'Inactive' }}
          </div>
        </div>

        <div class="user-card-body">
          <h3 class="user-name">{{ user.firstName }} {{ user.lastName }}</h3>
          <p class="user-email">{{ user.email }}</p>
          <div class="user-role-badge" :class="`role-${user.role}`">
            <v-icon size="14">{{ getRoleIcon(user.role) }}</v-icon>
            {{ getRoleLabel(user.role) }}
          </div>
        </div>

        <div class="user-card-meta">
          <div v-if="user.mustChangePassword" class="password-warning">
            <v-icon size="14" color="warning">mdi-alert</v-icon>
            <span>Password change required</span>
          </div>
          <div class="meta-item">
            <v-icon size="14">mdi-calendar-plus</v-icon>
            <span>Joined {{ formatDate(user.createdAt) }}</span>
          </div>
          <div v-if="user.lastLogin" class="meta-item">
            <v-icon size="14">mdi-login</v-icon>
            <span>Last login {{ formatDate(user.lastLogin) }}</span>
          </div>
        </div>

        <div class="user-card-actions">
          <v-btn
            variant="text"
            size="small"
            color="primary"
            @click="openEditDialog(user)"
          >
            <v-icon start size="16">mdi-pencil-outline</v-icon>
            Edit
          </v-btn>
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                variant="text"
                size="small"
                icon="mdi-dots-vertical"
                v-bind="props"
              />
            </template>
            <v-list class="actions-menu" density="compact">
              <v-list-item prepend-icon="mdi-lock-reset" @click="openResetPasswordDialog(user)">
                <v-list-item-title>Reset Password</v-list-item-title>
              </v-list-item>
              <v-list-item
                :prepend-icon="user.isActive ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
                @click="toggleUserStatus(user)"
              >
                <v-list-item-title>{{ user.isActive ? 'Deactivate' : 'Activate' }}</v-list-item-title>
              </v-list-item>
              <v-divider class="my-1" />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                class="delete-action"
                @click="openDeleteDialog(user)"
              >
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showFormDialog" max-width="520" persistent>
      <v-card class="form-dialog">
        <v-card-title class="dialog-title">
          <v-icon start :color="editingUser ? 'primary' : 'success'">
            {{ editingUser ? 'mdi-account-edit' : 'mdi-account-plus' }}
          </v-icon>
          {{ editingUser ? 'Edit User' : 'Add New User' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submitForm">
            <div class="form-row">
              <v-text-field
                v-model="formData.firstName"
                label="First Name"
                :rules="[rules.required, rules.minLength(2), rules.maxLength(50)]"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="formData.lastName"
                label="Last Name"
                :rules="[rules.required, rules.minLength(2), rules.maxLength(50)]"
                variant="outlined"
                density="comfortable"
              />
            </div>
            <v-text-field
              v-model="formData.email"
              label="Email Address"
              type="email"
              :rules="[rules.required, rules.email]"
              :disabled="!!editingUser"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />
            <v-select
              v-model="formData.role"
              :items="createRoleOptions"
              item-title="label"
              item-value="value"
              label="Role"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              :menu-props="{ contentClass: 'filter-dropdown-menu' }"
            >
              <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps">
                  <template #prepend>
                    <v-icon :color="getRoleColor(item.value)" size="20">{{ getRoleIcon(item.value) }}</v-icon>
                  </template>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw?.description }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
            <v-text-field
              v-if="!editingUser"
              v-model="formData.password"
              label="Initial Password"
              :type="showPasswordField ? 'text' : 'password'"
              :rules="[rules.required, rules.password]"
              :append-inner-icon="showPasswordField ? 'mdi-eye-off' : 'mdi-eye'"
              variant="outlined"
              density="comfortable"
              hint="Minimum 8 characters with uppercase, lowercase, number, and special character"
              persistent-hint
              @click:append-inner="showPasswordField = !showPasswordField"
            />
            <v-switch
              v-if="editingUser"
              v-model="formData.isActive"
              label="Account Active"
              color="success"
              hide-details
              :disabled="isSelfEdit"
            />
            <v-alert
              v-if="editingUser && isSelfEdit"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-3"
            >
              You cannot deactivate your own account.
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="formLoading"
            @click="submitForm"
          >
            {{ editingUser ? 'Save Changes' : 'Create User' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reset Password Dialog -->
    <v-dialog v-model="showResetDialog" max-width="480">
      <v-card class="form-dialog">
        <v-card-title class="dialog-title">
          <v-icon start color="warning">mdi-lock-reset</v-icon>
          Reset Password
        </v-card-title>
        <v-card-text>
          <p class="dialog-text">
            Reset the password for
            <strong>{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong>?
          </p>
          <v-alert type="info" variant="tonal" density="compact" class="mt-4">
            A new temporary password will be generated. The user will be logged out of all active sessions and must change their password on next login.
          </v-alert>
        </v-card-text>
        <v-card-actions class="dialog-actions">
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

    <!-- Password Display Dialog -->
    <v-dialog v-model="showPasswordDialog" max-width="480" persistent>
      <v-card class="form-dialog">
        <v-card-title class="dialog-title">
          <v-icon start color="success">mdi-check-circle</v-icon>
          {{ isNewUser ? 'User Created' : 'Password Reset' }}
        </v-card-title>
        <v-card-text>
          <p class="dialog-text mb-4">
            {{ isNewUser
              ? 'The user account has been created successfully. Share the temporary password securely with the user.'
              : 'Password has been reset successfully. Share the new temporary password securely with the user.'
            }}
          </p>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            This password will only be shown once. Make sure to copy it now.
          </v-alert>
          <div class="password-display-row">
            <v-text-field
              :model-value="tempPassword"
              label="Temporary Password"
              :type="showTempPassword ? 'text' : 'password'"
              readonly
              variant="outlined"
              density="comfortable"
              :append-inner-icon="showTempPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showTempPassword = !showTempPassword"
            />
            <v-btn
              color="primary"
              variant="tonal"
              :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
              size="large"
              @click="copyPassword"
            />
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn color="primary" @click="closePasswordDialog">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card class="form-dialog">
        <v-card-title class="dialog-title">
          <v-icon start color="error">mdi-alert</v-icon>
          Delete User
        </v-card-title>
        <v-card-text>
          <p class="dialog-text">
            Are you sure you want to delete
            <strong>{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong>?
          </p>
          <v-alert type="error" variant="tonal" density="compact" class="mt-4">
            This will deactivate the account and revoke all active sessions. The user will no longer be able to access the system.
          </v-alert>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            :loading="deleteLoading"
            @click="confirmDelete"
          >
            Delete User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useUsersStore, type TenantUser } from '~/stores/users'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_admin'],
})

const usersStore = useUsersStore()
const authStore = useAuthStore()

// Reactive state
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const showFormDialog = ref(false)
const showResetDialog = ref(false)
const showPasswordDialog = ref(false)
const showDeleteDialog = ref(false)
const editingUser = ref<TenantUser | null>(null)
const selectedUser = ref<TenantUser | null>(null)
const formLoading = ref(false)
const resetLoading = ref(false)
const deleteLoading = ref(false)
const tempPassword = ref('')
const showTempPassword = ref(false)
const showPasswordField = ref(false)
const copied = ref(false)
const isNewUser = ref(false)
const formRef = ref()

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'tenant_officer',
  password: '',
  isActive: true,
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Filter options
const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Officers', value: 'tenant_officer' },
  { label: 'Approvers', value: 'tenant_approver' },
  { label: 'Administrators', value: 'tenant_admin' },
]

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const createRoleOptions = [
  { label: 'Loan Officer', value: 'tenant_officer', description: 'Can create and manage loan applications' },
  { label: 'Loan Approver', value: 'tenant_approver', description: 'Can review and approve/reject loans' },
  { label: 'Administrator', value: 'tenant_admin', description: 'Full access to manage users and settings' },
]

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email address',
  minLength: (min: number) => (v: string) => (v && v.length >= min) || `Minimum ${min} characters`,
  maxLength: (max: number) => (v: string) => (v && v.length <= max) || `Maximum ${max} characters`,
  password: (v: string) => {
    if (!v) return 'Password is required'
    if (v.length < 8) return 'Minimum 8 characters'
    if (!/[A-Z]/.test(v)) return 'Must contain uppercase letter'
    if (!/[a-z]/.test(v)) return 'Must contain lowercase letter'
    if (!/[0-9]/.test(v)) return 'Must contain number'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(v)) return 'Must contain special character'
    return true
  },
}

// Computed
const hasFilters = computed(() => {
  return searchQuery.value || roleFilter.value !== 'all' || statusFilter.value !== 'all'
})

const activeUsersCount = computed(() => usersStore.users.filter(u => u.isActive).length)
const inactiveUsersCount = computed(() => usersStore.users.filter(u => !u.isActive).length)

const isSelfEdit = computed(() => {
  return editingUser.value?.id === authStore.user?.id
})

const filteredUsers = computed(() => {
  let users = usersStore.users

  // Filter by role
  if (roleFilter.value !== 'all') {
    users = users.filter(u => u.role === roleFilter.value)
  }

  // Filter by status
  if (statusFilter.value === 'active') {
    users = users.filter(u => u.isActive)
  } else if (statusFilter.value === 'inactive') {
    users = users.filter(u => !u.isActive)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(u =>
      u.firstName.toLowerCase().includes(query) ||
      u.lastName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  }

  return users
})

// Methods
const loadUsers = async () => {
  try {
    await usersStore.fetchUsers()
  } catch (error) {
    console.error('Failed to load users:', error)
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

const getRoleColor = (role: string) => {
  switch (role) {
    case 'tenant_admin': return 'primary'
    case 'tenant_approver': return 'success'
    case 'tenant_officer': return 'info'
    default: return 'grey'
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'tenant_admin': return 'mdi-shield-account'
    case 'tenant_approver': return 'mdi-check-decagram'
    case 'tenant_officer': return 'mdi-account-tie'
    default: return 'mdi-account'
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'tenant_admin': return 'Administrator'
    case 'tenant_approver': return 'Approver'
    case 'tenant_officer': return 'Officer'
    default: return role
  }
}

const openCreateDialog = () => {
  editingUser.value = null
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'tenant_officer',
    password: '',
    isActive: true,
  }
  showFormDialog.value = true
}

const openEditDialog = (user: TenantUser) => {
  editingUser.value = user
  formData.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    password: '',
    isActive: user.isActive,
  }
  showFormDialog.value = true
}

const closeFormDialog = () => {
  showFormDialog.value = false
  editingUser.value = null
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'tenant_officer',
    password: '',
    isActive: true,
  }
  showPasswordField.value = false
}

const submitForm = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true
  try {
    if (editingUser.value) {
      await usersStore.updateUser(editingUser.value.id, {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        role: formData.value.role,
        isActive: formData.value.isActive,
      })
      showSnackbar('User updated successfully', 'success')
      closeFormDialog()
    } else {
      const user = await usersStore.createUser({
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        email: formData.value.email,
        role: formData.value.role,
        password: formData.value.password,
      })
      // For new users, show the password they entered
      tempPassword.value = formData.value.password
      isNewUser.value = true
      showFormDialog.value = false
      showPasswordDialog.value = true
    }
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Operation failed', 'error')
  } finally {
    formLoading.value = false
  }
}

const openResetPasswordDialog = (user: TenantUser) => {
  if (user.id === authStore.user?.id) {
    showSnackbar('You cannot reset your own password here. Use the change password feature.', 'warning')
    return
  }
  selectedUser.value = user
  showResetDialog.value = true
}

const confirmResetPassword = async () => {
  if (!selectedUser.value) return

  resetLoading.value = true
  try {
    const response = await usersStore.resetUserPassword(selectedUser.value.id)
    tempPassword.value = response.temporaryPassword
    isNewUser.value = false
    showResetDialog.value = false
    showPasswordDialog.value = true
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to reset password', 'error')
  } finally {
    resetLoading.value = false
  }
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  tempPassword.value = ''
  showTempPassword.value = false
  copied.value = false
  isNewUser.value = false
  closeFormDialog()
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

const toggleUserStatus = async (user: TenantUser) => {
  if (user.id === authStore.user?.id) {
    showSnackbar('You cannot deactivate your own account', 'warning')
    return
  }

  try {
    if (user.isActive) {
      await usersStore.deactivateUser(user.id)
      showSnackbar('User deactivated successfully', 'success')
    } else {
      await usersStore.activateUser(user.id)
      showSnackbar('User activated successfully', 'success')
    }
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Operation failed', 'error')
  }
}

const openDeleteDialog = (user: TenantUser) => {
  if (user.id === authStore.user?.id) {
    showSnackbar('You cannot delete your own account', 'warning')
    return
  }
  selectedUser.value = user
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedUser.value) return

  deleteLoading.value = true
  try {
    await usersStore.deactivateUser(selectedUser.value.id)
    showSnackbar('User deleted successfully', 'success')
    showDeleteDialog.value = false
    selectedUser.value = null
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to delete user', 'error')
  } finally {
    deleteLoading.value = false
  }
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
  padding: 0;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 36px;
}

.header-content {
  flex: 1;
}

.header-title-group {
  margin-bottom: 16px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  line-height: 1.5;
}

.header-stats {
  display: flex;
  gap: 12px;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 24px;
  font-size: 14px;
}

.stat-value {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.stat-label {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Filters Section */
.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.role-filter,
.status-filter {
  min-width: 160px;
}

.search-field :deep(.v-field),
.role-filter :deep(.v-field),
.status-filter :deep(.v-field) {
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.search-field :deep(.v-field:hover),
.role-filter :deep(.v-field:hover),
.status-filter :deep(.v-field:hover) {
  border-color: rgba(var(--v-theme-on-surface), 0.24);
}

.search-field :deep(.v-field--focused),
.role-filter :deep(.v-field--focused),
.status-filter :deep(.v-field--focused) {
  border-color: rgb(var(--v-theme-primary));
}

/* Loading/Error/Empty States */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.loading-text {
  margin-top: 24px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 16px;
}

.error-icon {
  width: 88px;
  height: 88px;
  background: rgba(var(--v-theme-error), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title,
.empty-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 24px 0 12px;
}

.error-message,
.empty-message {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 28px;
  max-width: 400px;
  font-size: 15px;
  line-height: 1.6;
}

.empty-illustration {
  width: 140px;
  height: 140px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Users Grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.user-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 24px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.user-card--inactive {
  opacity: 0.7;
}

.user-card--inactive:hover {
  opacity: 1;
}

/* Card Header */
.user-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.user-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-active {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.status-active .status-dot {
  background: #10b981;
}

.status-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-inactive .status-dot {
  background: #ef4444;
}

/* Card Body */
.user-card-body {
  flex: 1;
}

.user-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 6px 0;
}

.user-email {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 14px 0;
}

.user-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.role-tenant_admin {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.role-tenant_approver {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.role-tenant_officer {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

/* Card Meta */
.user-card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.meta-item .v-icon {
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.password-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgb(var(--v-theme-warning));
  font-weight: 500;
}

/* Card Actions */
.user-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

/* Actions Menu */
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

.delete-action {
  color: rgb(var(--v-theme-error)) !important;
}

.delete-action :deep(.v-icon) {
  color: rgb(var(--v-theme-error)) !important;
}

/* Dialog Styles */
.form-dialog {
  border-radius: 20px;
}

.dialog-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 24px 28px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.dialog-text {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.8);
  line-height: 1.6;
}

.dialog-actions {
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.password-display-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.password-display-row .v-text-field {
  flex: 1;
}

/* Responsive */
@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field {
    max-width: 100%;
  }

  .filter-group {
    flex-direction: column;
  }

  .role-filter,
  .status-filter {
    width: 100%;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

<!-- Global styles for filter dropdowns -->
<style>
.filter-dropdown-menu {
  border-radius: 12px !important;
  padding: 6px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

.filter-dropdown-menu .v-list {
  background: rgb(var(--v-theme-surface)) !important;
  padding: 0 !important;
}

.filter-dropdown-menu .v-list-item {
  border-radius: 8px !important;
  min-height: 44px !important;
  margin: 2px 0 !important;
}

.filter-dropdown-menu .v-list-item:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
}

.filter-dropdown-menu .v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.12) !important;
}

.filter-dropdown-menu .v-list-item--active .v-list-item-title {
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600 !important;
}
</style>
