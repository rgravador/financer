<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <span class="text-h6 mr-4">Admin Users Management</span>
        <v-spacer />
        <v-select
          v-model="roleFilter"
          :items="roleOptions"
          label="Role"
          density="compact"
          style="max-width: 200px"
          class="mr-2"
          clearable
        />
        <v-select
          v-model="companyFilter"
          :items="companyOptions"
          label="Company"
          density="compact"
          style="max-width: 200px"
          class="mr-2"
          clearable
        />
        <v-text-field
          v-model="searchQuery"
          density="compact"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          style="max-width: 300px"
          class="mr-2"
          clearable
        />
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>
            mdi-plus
          </v-icon>
          Add User
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :loading="loading"
        :search="searchQuery"
      >
        <template #[`item.avatar_url`]="{ item }">
          <v-avatar v-if="item.avatar_url" size="40">
            <v-img :src="item.avatar_url" />
          </v-avatar>
          <v-avatar v-else size="40" color="primary">
            <span class="text-white">{{ getInitials(item.full_name) }}</span>
          </v-avatar>
        </template>

        <template #[`item.role`]="{ item }">
          <v-chip :color="getRoleColor(item.role)" size="small">
            {{ getRoleLabel(item.role) }}
          </v-chip>
        </template>

        <template #[`item.is_active`]="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #[`item.created_at`]="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #[`item.actions`]="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
            </template>
            <v-list>
              <v-list-item @click="viewUser(item)">
                <template #prepend>
                  <v-icon>mdi-eye</v-icon>
                </template>
                <v-list-item-title>View</v-list-item-title>
              </v-list-item>
              <v-list-item @click="editUser(item)">
                <template #prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item
                v-if="item.is_active"
                @click="toggleUserStatus(item)"
              >
                <template #prepend>
                  <v-icon>mdi-account-off</v-icon>
                </template>
                <v-list-item-title>Deactivate</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-else
                @click="toggleUserStatus(item)"
              >
                <template #prepend>
                  <v-icon>mdi-account-check</v-icon>
                </template>
                <v-list-item-title>Activate</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="deleteUser(item)" class="text-error">
                <template #prepend>
                  <v-icon color="error">
                    mdi-delete
                  </v-icon>
                </template>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">{{ isEditing ? 'Edit User' : 'Create User' }}</span>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveUser">
            <v-row>
              <v-col cols="12">
                <label for="user-full-name" class="font-weight-medium">Full Name *</label>
                <v-text-field
                  id="user-full-name"
                  v-model="formData.full_name"
                  :rules="[rules.required]"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                  required
                />
              </v-col>

              <v-col cols="12">
                <label for="user-email" class="font-weight-medium">Email *</label>
                <v-text-field
                  id="user-email"
                  v-model="formData.email"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  :disabled="isEditing"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                  required
                />
              </v-col>

              <v-col v-if="!isEditing" cols="12">
                <label for="user-password" class="font-weight-medium">Password *</label>
                <v-text-field
                  id="user-password"
                  v-model="formData.password"
                  type="password"
                  :rules="[rules.required, rules.minLength]"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formData.role"
                  :items="roleSelectOptions"
                  label="Role *"
                  :rules="[rules.required]"
                  required
                />
              </v-col>

              <v-col cols="12">
                <label for="user-display-name" class="font-weight-medium">Display Name</label>
                <v-text-field
                  id="user-display-name"
                  v-model="formData.display_name"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                />
              </v-col>

              <v-col v-if="isEditing" cols="12">
                <v-switch
                  v-model="formData.is_active"
                  label="Active"
                  color="success"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">
            Cancel
          </v-btn>
          <v-btn color="primary" :loading="saving" @click="saveUser">
            {{ isEditing ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card v-if="selectedUser">
        <v-card-title class="d-flex align-center pa-4">
          <v-avatar v-if="selectedUser.avatar_url" size="60" class="mr-4">
            <v-img :src="selectedUser.avatar_url" />
          </v-avatar>
          <v-avatar v-else size="60" color="primary" class="mr-4">
            <span class="text-h5 text-white">{{ getInitials(selectedUser.full_name) }}</span>
          </v-avatar>
          <div>
            <div class="text-h6">
              {{ selectedUser.full_name }}
            </div>
            <v-chip :color="getRoleColor(selectedUser.role)" size="small" class="mt-2">
              {{ getRoleLabel(selectedUser.role) }}
            </v-chip>
          </div>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 text-grey">
                Email
              </div>
              <div class="text-body-1">
                {{ selectedUser.email }}
              </div>
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 text-grey">
                Display Name
              </div>
              <div class="text-body-1">
                {{ selectedUser.display_name || '-' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">
                Status
              </div>
              <div class="text-body-1">
                <v-chip :color="selectedUser.is_active ? 'success' : 'error'" size="small">
                  {{ selectedUser.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">
                Created At
              </div>
              <div class="text-body-1">
                {{ formatDate(selectedUser.created_at) }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this user? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" :loading="deleting" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { UserProfileWithMeta, UserRole } from '~/types'
import { formatDate } from '~/utils/formatters'

interface UserFormData {
  full_name: string
  email: string
  password: string
  display_name: string
  role: UserRole
  is_active: boolean
}

export default defineComponent({
  name: 'InternalAdminUsersPage',

  middleware: ['internal-admin'],

  data () {
    return {
      dialog: false,
      viewDialog: false,
      deleteDialog: false,
      isEditing: false,
      loading: true,
      saving: false,
      deleting: false,
      users: [] as UserProfileWithMeta[],
      selectedUser: null as UserProfileWithMeta | null,
      userToDelete: null as UserProfileWithMeta | null,
      searchQuery: '',
      roleFilter: null as UserRole | null,
      companyFilter: null,
      formData: {
        full_name: '',
        email: '',
        password: '',
        display_name: '',
        role: 'admin' as UserRole,
        is_active: true
      } as UserFormData,
      headers: [
        { title: 'Avatar', key: 'avatar_url', sortable: false },
        { title: 'Name', key: 'full_name' },
        { title: 'Email', key: 'email' },
        { title: 'Role', key: 'role' },
        { title: 'Status', key: 'is_active' },
        { title: 'Created', key: 'created_at' },
        { title: 'Actions', key: 'actions', sortable: false }
      ],
      roleOptions: [
        { title: 'Tenant Admin', value: 'admin' },
        { title: 'Internal Admin', value: 'internal_admin' }
      ],
      roleSelectOptions: [
        { title: 'Tenant Admin', value: 'admin' },
        { title: 'Internal Admin', value: 'internal_admin' }
      ],
      companyOptions: [],
      rules: {
        required: (v: any) => !!v || 'This field is required',
        email: (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
        minLength: (v: string) => (v && v.length >= 6) || 'Password must be at least 6 characters'
      }
    }
  },

  computed: {
    filteredUsers (): UserProfileWithMeta[] {
      let filtered = [...this.users]

      // Apply role filter
      if (this.roleFilter) {
        filtered = filtered.filter(user => user.role === this.roleFilter)
      }

      // Apply search filter
      if (this.searchQuery) {
        const searchLower = this.searchQuery.toLowerCase()
        filtered = filtered.filter(user =>
          user.full_name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        )
      }

      return filtered
    }
  },

  async mounted () {
    await this.fetchUsers()
  },

  methods: {
    formatDate,

    getInitials (name: string): string {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    },

    getRoleColor (role: UserRole): string {
      const colors: Record<UserRole, string> = {
        admin: 'primary',
        agent: 'info',
        internal_admin: 'purple'
      }
      return colors[role] || 'grey'
    },

    getRoleLabel (role: UserRole): string {
      const labels: Record<UserRole, string> = {
        admin: 'Tenant Admin',
        agent: 'Agent',
        internal_admin: 'Internal Admin'
      }
      return labels[role] || role
    },

    async fetchUsers () {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('users_profile')
          .select('*')
          .in('role', ['admin', 'internal_admin'])
          .order('created_at', { ascending: false })

        if (error) { throw error }

        this.users = (data || []) as UserProfileWithMeta[]
      } catch (error: any) {
        const { showError } = useUI()
        showError(`Failed to fetch users: ${error.message}`)
      } finally {
        this.loading = false
      }
    },

    openCreateDialog () {
      this.isEditing = false
      this.selectedUser = null
      this.resetForm()
      this.dialog = true
    },

    viewUser (user: UserProfileWithMeta) {
      this.selectedUser = user
      this.viewDialog = true
    },

    editUser (user: UserProfileWithMeta) {
      this.isEditing = true
      this.selectedUser = user
      this.formData = {
        full_name: user.full_name,
        email: user.email,
        password: '',
        display_name: user.display_name || '',
        role: user.role,
        is_active: user.is_active
      }
      this.dialog = true
    },

    async saveUser () {
      const form = this.$refs.form as any
      const { valid } = await form.validate()

      if (!valid) { return }

      this.saving = true
      try {
        if (this.isEditing && this.selectedUser) {
          await this.updateUser()
        } else {
          await this.createUser()
        }
        this.closeDialog()
        await this.fetchUsers()
      } finally {
        this.saving = false
      }
    },

    async createUser () {
      const authStore = useAuthStore()
      const result = await authStore.signup({
        email: this.formData.email,
        password: this.formData.password,
        full_name: this.formData.full_name,
        display_name: this.formData.display_name,
        role: this.formData.role
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const { showSuccess } = useUI()
      showSuccess('User created successfully')
    },

    async updateUser () {
      const supabase = useSupabaseClient()
      const { error } = await supabase
        .from('users_profile')
        .update({
          full_name: this.formData.full_name,
          role: this.formData.role,
          is_active: this.formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.selectedUser!.id)

      if (error) { throw error }

      const { showSuccess } = useUI()
      showSuccess('User updated successfully')
    },

    async toggleUserStatus (user: UserProfileWithMeta) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { error } = await supabase
          .from('users_profile')
          .update({
            is_active: !user.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (error) { throw error }

        const { showSuccess } = useUI()
        showSuccess(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`)
        await this.fetchUsers()
      } catch (error: any) {
        const { showError } = useUI()
        showError(`Failed to update user status: ${error.message}`)
      } finally {
        this.loading = false
      }
    },

    deleteUser (user: UserProfileWithMeta) {
      this.userToDelete = user
      this.deleteDialog = true
    },

    async confirmDelete () {
      if (!this.userToDelete) { return }

      this.deleting = true
      try {
        const supabase = useSupabaseClient()
        const { error } = await supabase
          .from('users_profile')
          .delete()
          .eq('id', this.userToDelete.id)

        if (error) { throw error }

        const { showSuccess } = useUI()
        showSuccess('User deleted successfully')
        this.deleteDialog = false
        this.userToDelete = null
        await this.fetchUsers()
      } catch (error: any) {
        const { showError } = useUI()
        showError(`Failed to delete user: ${error.message}`)
      } finally {
        this.deleting = false
      }
    },

    resetForm () {
      this.formData = {
        full_name: '',
        email: '',
        password: '',
        display_name: '',
        role: 'admin',
        is_active: true
      }
      const form = this.$refs.form as any
      if (form) {
        form.reset()
      }
    },

    closeDialog () {
      this.dialog = false
      this.resetForm()
      this.selectedUser = null
    }
  }
})
</script>
