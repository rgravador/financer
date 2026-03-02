<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>User Management</h1>
    </div>
    <p class="wf-page-subtitle">Manage team members and their roles</p>

    <!-- Toolbar -->
    <div class="wf-toolbar mb-6">
      <v-btn color="primary" prepend-icon="mdi-account-plus" @click="showInviteModal = true">
        Invite User
      </v-btn>
      <div class="wf-search-box">
        <v-icon class="search-icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Search users..."
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="wf-section-gap">
      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ usersStore.totalUsers }}</div>
            <div class="wf-stat-label">Total Users</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ usersStore.activeUsers.length }}</div>
            <div class="wf-stat-label">Active Users</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ usersStore.usersByRole('tenant_officer').length }}</div>
            <div class="wf-stat-label">Loan Officers</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ usersStore.usersByRole('tenant_approver').length }}</div>
            <div class="wf-stat-label">Approvers</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table Card -->
    <v-card class="wf-section-card">
      <v-table class="wf-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user.id"
          >
            <td>
              <div>
                <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                <div class="wf-table-subtext">{{ user.email }}</div>
              </div>
            </td>
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
            <td>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    v-bind="props"
                  />
                </template>

                <v-list density="compact">
                  <v-list-item @click="handleEditRole(user)">
                    <v-list-item-title>
                      <v-icon start size="small">mdi-account-edit</v-icon>
                      Change Role
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-if="user.isActive"
                    @click="handleDeactivate(user)"
                  >
                    <v-list-item-title>
                      <v-icon start size="small">mdi-account-off</v-icon>
                      Deactivate
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-else
                    @click="handleActivate(user)"
                  >
                    <v-list-item-title>
                      <v-icon start size="small">mdi-account-check</v-icon>
                      Activate
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="text-center pa-8">
              <div class="wf-empty-state">
                <v-icon class="empty-icon">mdi-account-off</v-icon>
                <div class="empty-title">No users found</div>
                <div class="empty-message">Click "Invite User" to add your first user</div>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <div class="wf-pagination" v-if="filteredUsers.length > 0">
        <button
          class="wf-pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ← Previous
        </button>
        <span class="wf-pagination-info">
          Page {{ currentPage }} of {{ totalPages }} ({{ filteredUsers.length }} total)
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

    <!-- Invite User Modal -->
    <AdminTenantUserFormModal
      v-model="showInviteModal"
      @created="handleUserCreated"
    />

    <!-- Edit Role Dialog -->
    <v-dialog v-model="showEditRoleDialog" max-width="400px">
      <v-card v-if="selectedUser">
        <v-card-title class="text-h6">Change User Role</v-card-title>
        <v-card-text>
          <div class="mb-3">
            <div class="text-caption text-medium-emphasis">User</div>
            <div class="font-weight-medium">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</div>
          </div>

          <v-select
            v-model="newRole"
            label="New Role"
            variant="outlined"
            :items="roleOptions"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEditRoleDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="usersStore.loading" @click="handleUpdateRole">
            Update Role
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TenantUser } from '~/stores/users'

definePageMeta({
  middleware: ['role'],
  role: ['tenant_admin'],
})

const usersStore = useUsersStore()

const search = ref('')
const showInviteModal = ref(false)
const showEditRoleDialog = ref(false)
const selectedUser = ref<TenantUser | null>(null)
const newRole = ref('')
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Filtered users based on search
const filteredUsers = computed(() => {
  if (!search.value) {
    return usersStore.users
  }

  const searchLower = search.value.toLowerCase()
  return usersStore.users.filter((user: TenantUser) =>
    user.firstName.toLowerCase().includes(searchLower) ||
    user.lastName.toLowerCase().includes(searchLower) ||
    user.email.toLowerCase().includes(searchLower)
  )
})

// Total pages for pagination
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value)
})

// Role options
const roleOptions = [
  { title: 'Loan Officer', value: 'tenant_officer' },
  { title: 'Approver', value: 'tenant_approver' },
  { title: 'Tenant Admin', value: 'tenant_admin' },
]

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
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

// Handle user created
const handleUserCreated = (user: TenantUser) => {
  snackbarMessage.value = `User "${user.firstName} ${user.lastName}" invited successfully`
  snackbarColor.value = 'success'
  showSnackbar.value = true
}

// Handle edit role
const handleEditRole = (user: TenantUser) => {
  selectedUser.value = user
  newRole.value = user.role
  showEditRoleDialog.value = true
}

// Handle update role
const handleUpdateRole = async () => {
  if (!selectedUser.value || newRole.value === selectedUser.value.role) {
    showEditRoleDialog.value = false
    return
  }

  try {
    await usersStore.updateUser(selectedUser.value.id, { role: newRole.value })
    snackbarMessage.value = `Role updated to ${roleOptions.find(r => r.value === newRole.value)?.title}`
    snackbarColor.value = 'success'
    showSnackbar.value = true
    showEditRoleDialog.value = false
  } catch (error: any) {
    snackbarMessage.value = error.data?.statusMessage || 'Failed to update role'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Handle deactivate
const handleDeactivate = async (user: TenantUser) => {
  if (!confirm(`Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`)) {
    return
  }

  try {
    await usersStore.deactivateUser(user.id)
    snackbarMessage.value = `User "${user.firstName} ${user.lastName}" deactivated successfully`
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error: any) {
    snackbarMessage.value = error.data?.statusMessage || 'Failed to deactivate user'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Handle activate
const handleActivate = async (user: TenantUser) => {
  try {
    await usersStore.activateUser(user.id)
    snackbarMessage.value = `User "${user.firstName} ${user.lastName}" activated successfully`
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error: any) {
    snackbarMessage.value = error.data?.statusMessage || 'Failed to activate user'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Load users on mount
onMounted(async () => {
  await usersStore.fetchUsers()
})
</script>

<style scoped>
.wf-stat-card {
  text-align: center;
  padding: 24px;
}

.wf-stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 8px;
}

.wf-stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.wf-table-subtext {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
</style>
