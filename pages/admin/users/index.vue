<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">User Management</h1>
          <v-btn color="primary" prepend-icon="mdi-account-plus" @click="showInviteModal = true">
            Invite User
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
                <div class="text-caption text-medium-emphasis">Total Users</div>
                <div class="text-h4">{{ usersStore.totalUsers }}</div>
              </div>
              <v-icon size="48" color="primary">mdi-account-group</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Active Users</div>
                <div class="text-h4">{{ usersStore.activeUsers.length }}</div>
              </div>
              <v-icon size="48" color="success">mdi-account-check</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Loan Officers</div>
                <div class="text-h4">{{ usersStore.usersByRole('tenant_officer').length }}</div>
              </div>
              <v-icon size="48" color="blue">mdi-account-tie</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Approvers</div>
                <div class="text-h4">{{ usersStore.usersByRole('tenant_approver').length }}</div>
              </div>
              <v-icon size="48" color="amber">mdi-check-decagram</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Users Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search users"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="ma-2"
            />
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="usersStore.users"
            :search="search"
            :loading="usersStore.loading"
            :items-per-page="10"
            class="elevation-1"
          >
            <template #item.name="{ item }">
              <div class="font-weight-medium">{{ item.firstName }} {{ item.lastName }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </template>

            <template #item.role="{ item }">
              <SharedRoleBadge :role="item.role" />
            </template>

            <template #item.applicationsCount="{ item }">
              <v-chip size="small" variant="tonal" color="primary">
                {{ item.applicationsCount || 0 }} applications
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

            <template #item.actions="{ item }">
              <div class="d-flex gap-2">
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      size="small"
                      variant="text"
                      v-bind="props"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list density="compact">
                    <v-list-item @click="handleEditRole(item)">
                      <v-list-item-title>
                        <v-icon start size="small">mdi-account-edit</v-icon>
                        Change Role
                      </v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-if="item.isActive"
                      @click="handleDeactivate(item)"
                    >
                      <v-list-item-title>
                        <v-icon start size="small">mdi-account-off</v-icon>
                        Deactivate
                      </v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-else
                      @click="handleActivate(item)"
                    >
                      <v-list-item-title>
                        <v-icon start size="small">mdi-account-check</v-icon>
                        Activate
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>

            <template #no-data>
              <div class="text-center pa-4">
                <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
                <div class="text-body-1 mt-2">No users found</div>
                <div class="text-caption text-medium-emphasis">Click "Invite User" to add your first user</div>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

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

// Table headers
const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Applications', key: 'applicationsCount', sortable: true },
  { title: 'Status', key: 'isActive', sortable: true },
  { title: 'Joined', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

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
.gap-2 {
  gap: 8px;
}
</style>
