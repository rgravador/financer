<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="mb-4">
          <h1 class="text-h4">
            User Management
          </h1>
          <p class="text-subtitle-1 text-grey">
            Manage system users and permissions
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Total Users
            </div>
            <div class="text-h5">
              {{ adminStore.users.length }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Agents
            </div>
            <div class="text-h5 text-info">
              {{ agentUsers.length }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Admins
            </div>
            <div class="text-h5 text-primary">
              {{ adminUsers.length }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Active Users
            </div>
            <div class="text-h5 text-success">
              {{ activeUsers.length }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="adminStore.loading" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-grey">
          Loading users...
        </p>
      </v-col>
    </v-row>

    <!-- Users List -->
    <v-row v-else-if="adminStore.users.length > 0" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>All Users ({{ adminStore.users.length }})</span>
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search users"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              autocomplete="off"
              style="max-width: 300px;"
            />
          </v-card-title>
          <v-divider />

          <!-- Desktop Table -->
          <div class="d-none d-md-block">
            <v-table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Stats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <div class="d-flex align-center">
                      <v-avatar size="40" color="primary" class="mr-3">
                        <span class="text-body-1">{{ getInitials(user.full_name) }}</span>
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold">
                          {{ user.full_name }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ user.display_name || user.email }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <v-chip
                      size="small"
                      :color="user.role === 'admin' ? 'primary' : 'info'"
                    >
                      {{ user.role.toUpperCase() }}
                    </v-chip>
                  </td>
                  <td>
                    <v-chip
                      size="small"
                      :color="user.is_active ? 'success' : 'grey'"
                    >
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </v-chip>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <div v-if="user.role === 'agent'" class="text-caption">
                      <div>Loans: {{ getUserStats(user.id).loans }}</div>
                      <div>Collections: {{ formatCurrency(getUserStats(user.id).collected) }}</div>
                    </div>
                    <span v-else class="text-grey text-caption">-</span>
                  </td>
                  <td>
                    <v-btn
                      v-if="user.is_active"
                      size="small"
                      color="warning"
                      variant="outlined"
                      @click="openDeactivateDialog(user)"
                    >
                      Deactivate
                    </v-btn>
                    <v-btn
                      v-else
                      size="small"
                      color="success"
                      variant="outlined"
                      @click="handleActivateUser(user)"
                    >
                      Activate
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- Mobile Cards -->
          <div class="d-md-none">
            <v-card
              v-for="user in filteredUsers"
              :key="user.id"
              variant="outlined"
              class="ma-2"
            >
              <v-card-text>
                <div class="d-flex align-center mb-3">
                  <v-avatar size="48" color="primary" class="mr-3">
                    <span>{{ getInitials(user.full_name) }}</span>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="font-weight-bold">
                      {{ user.full_name }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ user.display_name || user.email }}
                    </div>
                  </div>
                  <v-chip
                    size="small"
                    :color="user.role === 'admin' ? 'primary' : 'info'"
                  >
                    {{ user.role }}
                  </v-chip>
                </div>
                <div class="mb-2">
                  <v-chip
                    size="small"
                    :color="user.is_active ? 'success' : 'grey'"
                  >
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </div>
                <div v-if="user.role === 'agent'" class="text-caption mb-3">
                  Loans: {{ getUserStats(user.id).loans }} •
                  Collections: {{ formatCurrency(getUserStats(user.id).collected) }}
                </div>
                <v-btn
                  v-if="user.is_active"
                  size="small"
                  color="warning"
                  variant="outlined"
                  block
                  @click="openDeactivateDialog(user)"
                >
                  Deactivate
                </v-btn>
                <v-btn
                  v-else
                  size="small"
                  color="success"
                  variant="outlined"
                  block
                  @click="handleActivateUser(user)"
                >
                  Activate
                </v-btn>
              </v-card-text>
            </v-card>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else class="mt-8">
      <v-col cols="12" class="text-center">
        <v-icon size="120" color="grey-lighten-2">
          mdi-account-group
        </v-icon>
        <h3 class="text-h6 mt-4 text-grey">
          No users found
        </h3>
      </v-col>
    </v-row>

    <!-- Deactivate Dialog -->
    <v-dialog v-model="deactivateDialog" max-width="400">
      <v-card v-if="selectedUser">
        <v-card-title>Deactivate User</v-card-title>
        <v-card-text>
          <p>Are you sure you want to deactivate <strong>{{ selectedUser.full_name }}</strong>?</p>
          <p class="text-caption text-grey mt-2">
            This user will no longer be able to access the system.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deactivateDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            :loading="actionLoading"
            @click="handleDeactivateUser"
          >
            Deactivate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { UserProfile } from '~/types'

export default defineComponent({
  name: 'AdminUsers',

  data () {
    return {
      search: '',
      deactivateDialog: false,
      selectedUser: null as UserProfile | null,
      actionLoading: false
    }
  },

  computed: {
    adminStore () {
      return useAdmin()
    },

    loansStore () {
      return useLoansStore()
    },

    uiStore () {
      return useUIStore()
    },

    agentUsers () {
      return this.adminStore.users.filter((u: UserProfile) => u.role === 'agent')
    },

    adminUsers () {
      return this.adminStore.users.filter((u: UserProfile) => u.role === 'admin')
    },

    activeUsers () {
      return this.adminStore.users.filter((u: UserProfile) => u.is_active)
    },

    filteredUsers () {
      if (!this.search) { return this.adminStore.users }

      const searchLower = this.search.toLowerCase()
      return this.adminStore.users.filter((user: UserProfile) =>
        user.full_name.toLowerCase().includes(searchLower) ||
        (user.display_name?.toLowerCase().includes(searchLower)) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }
  },

  async mounted () {
    try {
      await Promise.all([
        this.adminStore.fetchUsers(),
        this.loansStore.fetchLoans()
      ])
    } catch (error: any) {
      this.uiStore.showError('Failed to load users')
    }
  },

  methods: {
    formatCurrency,
    formatDate,

    getInitials (name: string) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    getUserStats (userId: string) {
      const userLoans = this.loansStore.loans.filter((l: any) => l.agent_id === userId)
      const loans = userLoans.length
      const collected = userLoans.reduce((sum: number, l: any) => sum + l.total_paid, 0)

      return { loans, collected }
    },

    openDeactivateDialog (user: UserProfile) {
      this.selectedUser = user
      this.deactivateDialog = true
    },

    async handleDeactivateUser () {
      if (!this.selectedUser) { return }

      this.actionLoading = true
      const result = await this.adminStore.deactivateUser(this.selectedUser.id)

      if (result.success) {
        this.uiStore.showSuccess('User deactivated successfully')
        this.deactivateDialog = false
        this.selectedUser = null
        await this.adminStore.fetchUsers()
      } else {
        this.uiStore.showError(result.error || 'Failed to deactivate user')
      }

      this.actionLoading = false
    },

    async handleActivateUser (user: UserProfile) {
      const result = await this.adminStore.activateUser(user.id)

      if (result.success) {
        this.uiStore.showSuccess('User activated successfully')
        await this.adminStore.fetchUsers()
      } else {
        this.uiStore.showError(result.error || 'Failed to activate user')
      }
    }
  }
})

definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
