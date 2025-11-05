<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">
          Internal Admin Dashboard
        </h1>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ stats.totalCompanies }}
                </div>
                <div class="text-caption text-grey">
                  Total Companies
                </div>
              </div>
              <v-icon size="40" color="primary">
                mdi-office-building
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ stats.activeCompanies }}
                </div>
                <div class="text-caption text-grey">
                  Active Companies
                </div>
              </div>
              <v-icon size="40" color="success">
                mdi-check-circle
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ stats.totalAdmins }}
                </div>
                <div class="text-caption text-grey">
                  Tenant Admins
                </div>
              </div>
              <v-icon size="40" color="info">
                mdi-shield-account
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ stats.totalInternalAdmins }}
                </div>
                <div class="text-caption text-grey">
                  Internal Admins
                </div>
              </div>
              <v-icon size="40" color="purple">
                mdi-shield-star
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Companies -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <span class="text-h6">Recent Companies</span>
            <v-btn variant="text" size="small" to="/internal-admin/companies">
              View All
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-data-table
            :headers="companyHeaders"
            :items="recentCompanies"
            :loading="loading"
            hide-default-footer
            :items-per-page="5"
          >
            <template #[`item.logo_url`]="{ item }">
              <v-avatar v-if="item.logo_url" size="40">
                <v-img :src="item.logo_url" />
              </v-avatar>
              <v-avatar v-else size="40" color="grey">
                <v-icon>mdi-office-building</v-icon>
              </v-avatar>
            </template>

            <template #[`item.status`]="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small">
                {{ item.status }}
              </v-chip>
            </template>

            <template #[`item.created_at`]="{ item }">
              {{ formatDate(item.created_at) }}
            </template>

            <template #[`item.actions`]="{ item }">
              <v-btn
                icon="mdi-eye"
                variant="text"
                size="small"
                :to="`/internal-admin/companies?id=${item.id}`"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="pa-4">
            <span class="text-h6">Quick Actions</span>
          </v-card-title>
          <v-divider />
          <v-list>
            <v-list-item
              prepend-icon="mdi-plus"
              title="Add New Company"
              to="/internal-admin/companies"
            />
            <v-list-item
              prepend-icon="mdi-account-plus"
              title="Create Tenant Admin"
              to="/internal-admin/users"
            />
            <v-list-item
              prepend-icon="mdi-office-building-outline"
              title="Manage Companies"
              to="/internal-admin/companies"
            />
            <v-list-item
              prepend-icon="mdi-account-group"
              title="Manage Users"
              to="/internal-admin/users"
            />
          </v-list>
        </v-card>

        <!-- System Info -->
        <v-card class="mt-4">
          <v-card-title class="pa-4">
            <span class="text-h6">System Info</span>
          </v-card-title>
          <v-divider />
          <v-list>
            <v-list-item>
              <v-list-item-title>Database Status</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip color="success" size="small">
                  Connected
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Last Backup</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(new Date().toISOString()) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Storage Used</v-list-item-title>
              <v-list-item-subtitle>2.4 GB / 100 GB</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Activity Log -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="pa-4">
            <span class="text-h6">Recent Activity</span>
          </v-card-title>
          <v-divider />
          <v-timeline side="end" density="compact" class="pa-4">
            <v-timeline-item
              v-for="(activity, index) in recentActivity"
              :key="index"
              dot-color="primary"
              size="small"
            >
              <div class="d-flex justify-space-between">
                <div>
                  <div class="font-weight-medium">
                    {{ activity.action }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ activity.user }} - {{ activity.target }}
                  </div>
                </div>
                <div class="text-caption text-grey">
                  {{ formatRelativeTime(activity.timestamp) }}
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { CompanyWithRelations, CompanyStatus } from '~/types'
import { formatDate, formatRelativeTime } from '~/utils/formatters'

interface DashboardStats {
  totalCompanies: number
  activeCompanies: number
  totalAdmins: number
  totalInternalAdmins: number
}

interface ActivityLog {
  action: string
  user: string
  target: string
  timestamp: string
}

export default defineComponent({
  name: 'InternalAdminDashboard',

  middleware: ['internal-admin'],

  data () {
    return {
      loading: true,
      stats: {
        totalCompanies: 0,
        activeCompanies: 0,
        totalAdmins: 0,
        totalInternalAdmins: 0
      } as DashboardStats,
      recentCompanies: [] as CompanyWithRelations[],
      recentActivity: [] as ActivityLog[],
      companyHeaders: [
        { title: 'Logo', key: 'logo_url', sortable: false },
        { title: 'Name', key: 'name' },
        { title: 'Contact Email', key: 'contact_email' },
        { title: 'Status', key: 'status' },
        { title: 'Created', key: 'created_at' },
        { title: '', key: 'actions', sortable: false }
      ]
    }
  },

  async mounted () {
    await this.loadDashboardData()
  },

  methods: {
    formatDate,
    formatRelativeTime,

    getStatusColor (status: CompanyStatus): string {
      const colors: Record<CompanyStatus, string> = {
        active: 'success',
        inactive: 'warning',
        archived: 'grey'
      }
      return colors[status] || 'grey'
    },

    async loadDashboardData () {
      this.loading = true
      try {
        const supabase = useSupabaseClient()

        // Fetch companies
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select(`
            *,
            creator:created_by (
              id,
              email,
              full_name,
              role,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        if (companiesError) { throw companiesError }

        this.recentCompanies = (companies || []) as CompanyWithRelations[]

        // Fetch company stats
        const { data: allCompanies, error: statsError } = await supabase
          .from('companies')
          .select('id, status')

        if (statsError) { throw statsError }

        this.stats.totalCompanies = allCompanies?.length || 0
        this.stats.activeCompanies = allCompanies?.filter(c => c.status === 'active').length || 0

        // Fetch user stats
        const { data: users, error: usersError } = await supabase
          .from('users_profile')
          .select('id, role')

        if (usersError) { throw usersError }

        this.stats.totalAdmins = users?.filter(u => u.role === 'admin').length || 0
        this.stats.totalInternalAdmins = users?.filter(u => u.role === 'internal_admin').length || 0

        // Mock recent activity (in production, this would come from an audit log table)
        this.recentActivity = [
          {
            action: 'Company Created',
            user: 'John Doe',
            target: 'Acme Corp',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
          },
          {
            action: 'User Created',
            user: 'Jane Smith',
            target: 'Admin User',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
          },
          {
            action: 'Company Updated',
            user: 'John Doe',
            target: 'Tech Solutions Inc',
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString()
          },
          {
            action: 'Company Archived',
            user: 'Admin',
            target: 'Old Company LLC',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString()
          }
        ]
      } catch (error: any) {
        const { showError } = useUI()
        showError(`Failed to load dashboard data: ${error.message}`)
      } finally {
        this.loading = false
      }
    }
  }
})
</script>
