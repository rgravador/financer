<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">
              Accounts
            </h1>
            <p class="text-subtitle-1 text-grey">
              Manage borrower accounts
            </p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" to="/accounts/create">
            Add Account
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-grey">
          Loading accounts...
        </p>
      </v-col>
    </v-row>

    <!-- Desktop Data Table -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="hide-on-mobile">
          <v-card-title class="d-flex align-center pa-4">
            <span class="text-h6 mr-4">Accounts</span>
            <v-spacer />
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              class="mr-3"
              style="max-width: 200px"
            />
            <v-text-field
              v-model="filters.search"
              prepend-inner-icon="mdi-magnify"
              label="Search table"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="search-field"
              style="max-width: 300px"
            />
          </v-card-title>
          <v-divider />
          <v-data-table
            :headers="headers"
            :items="filteredAccounts"
            :items-per-page="10"
            @click:row="handleRowClick"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center py-2">
                <v-avatar color="primary" size="32" class="mr-3">
                  <span class="text-white text-caption">{{ item.name.charAt(0).toUpperCase() }}</span>
                </v-avatar>
                <span class="font-weight-medium">{{ item.name }}</span>
              </div>
            </template>

            <template #item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small">
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.loans="{ item }">
              <v-chip size="small" variant="outlined">
                {{ item.loans?.length || 0 }} loans
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex gap-2">
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-eye"
                  :to="`/accounts/${item.id}`"
                />
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-file-document-plus"
                  color="primary"
                  :to="`/loans/create?account_id=${item.id}`"
                />
              </div>
            </template>
          </v-data-table>
        </v-card>

        <!-- Mobile Card View -->
        <div class="hide-on-desktop">
          <v-card
            v-for="account in filteredAccounts"
            :key="account.id"
            class="card-hover mb-4"
            :to="`/accounts/${account.id}`"
          >
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-truncate">{{ account.name }}</span>
              <v-chip :color="getStatusColor(account.status)" size="small">
                {{ account.status }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <div class="mb-2">
                <v-icon size="small" class="mr-2">
                  mdi-phone
                </v-icon>
                <span class="text-body-2">{{ account.contact_info || account.phone_number || 'Not provided' }}</span>
              </div>
              <div class="mb-2">
                <v-icon size="small" class="mr-2">
                  mdi-map-marker
                </v-icon>
                <span class="text-body-2 text-truncate">{{ account.address || account.current_address || 'Not provided' }}</span>
              </div>
              <div>
                <v-icon size="small" class="mr-2">
                  mdi-file-document
                </v-icon>
                <span class="text-body-2">{{ account.loans?.length || 0 }} loans</span>
              </div>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-btn
                size="small"
                variant="text"
                prepend-icon="mdi-eye"
                :to="`/accounts/${account.id}`"
              >
                View Details
              </v-btn>
              <v-spacer />
              <v-btn
                size="small"
                variant="text"
                color="primary"
                prepend-icon="mdi-file-document-plus"
                :to="`/loans/create?account_id=${account.id}`"
              >
                New Loan
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const accountsStore = useAccounts()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { loading, filteredAccounts, filters, fetchAccounts } = accountsStore

void loading
void filteredAccounts
void filters
void fetchAccounts

const uiStore = useUI()

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
  { title: 'Suspended', value: 'suspended' }
]

const headers = [
  { title: 'Name', value: 'name', sortable: true },
  { title: 'Contact', value: 'contact_info', sortable: false },
  { title: 'Address', value: 'address', sortable: false },
  { title: 'Status', value: 'status', sortable: true },
  { title: 'Loans', value: 'loans', sortable: false },
  { title: 'Actions', value: 'actions', sortable: false, align: 'end' as const }
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    inactive: 'grey',
    suspended: 'error'
  }
  return colors[status] || 'grey'
}

const handleRowClick = (_event: any, { item }: any) => {
  router.push(`/accounts/${item.id}`)
}

// Fetch accounts on mount
onMounted(async () => {
  try {
    await fetchAccounts()
  } catch (error: any) {
    uiStore.showError('Failed to load accounts')
  }
})
</script>

<style scoped>
.card-hover {
  transition: transform 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
}

/* Responsive display utilities */
@media (max-width: 959px) {
  .hide-on-mobile {
    display: none !important;
  }
}

@media (min-width: 960px) {
  .hide-on-desktop {
    display: none !important;
  }
}

/* Make data table rows clickable */
:deep(.v-data-table tbody tr) {
  cursor: pointer;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
