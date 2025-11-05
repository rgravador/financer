<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <span class="text-h6 mr-4">Companies / Tenants</span>
        <v-spacer />
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Status"
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
          Add Company
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="companiesStore.filteredCompanies"
        :loading="companiesStore.loading"
        :search="searchQuery"
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
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #[`item.creator`]="{ item }">
          {{ item.creator?.full_name || '-' }}
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
              <v-list-item @click="viewCompany(item)">
                <template #prepend>
                  <v-icon>mdi-eye</v-icon>
                </template>
                <v-list-item-title>View</v-list-item-title>
              </v-list-item>
              <v-list-item @click="editCompany(item)">
                <template #prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item
                v-if="item.status === 'active'"
                @click="updateStatus(item.id, 'inactive')"
              >
                <template #prepend>
                  <v-icon>mdi-pause</v-icon>
                </template>
                <v-list-item-title>Deactivate</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.status === 'inactive'"
                @click="updateStatus(item.id, 'active')"
              >
                <template #prepend>
                  <v-icon>mdi-play</v-icon>
                </template>
                <v-list-item-title>Activate</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.status !== 'archived'"
                @click="updateStatus(item.id, 'archived')"
              >
                <template #prepend>
                  <v-icon>mdi-archive</v-icon>
                </template>
                <v-list-item-title>Archive</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="deleteCompany(item)" class="text-error">
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
          <span class="text-h6">{{ isEditing ? 'Edit Company' : 'Create Company' }}</span>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveCompany">
            <v-row>
              <v-col cols="12">
                <label for="company-name" class="font-weight-medium">Company Name *</label>
                <v-text-field
                  id="company-name"
                  v-model="formData.name"
                  :rules="[rules.required]"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Description"
                  rows="3"
                />
              </v-col>

              <v-col cols="12">
                <label for="company-address" class="font-weight-medium">Address</label>
                <v-text-field
                  id="company-address"
                  v-model="formData.address"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label for="company-email" class="font-weight-medium">Contact Email</label>
                <v-text-field
                  id="company-email"
                  v-model="formData.contact_email"
                  type="email"
                  :rules="[rules.email]"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label for="company-phone" class="font-weight-medium">Contact Phone</label>
                <v-text-field
                  id="company-phone"
                  v-model="formData.contact_phone"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label for="company-reg-number" class="font-weight-medium">Registration Number</label>
                <v-text-field
                  id="company-reg-number"
                  v-model="formData.registration_number"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label for="company-tax-id" class="font-weight-medium">Tax ID</label>
                <v-text-field
                  id="company-tax-id"
                  v-model="formData.tax_id"
                  variant="solo"
                  flat
                  hide-details="auto"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12">
                <v-file-input
                  v-model="logoFile"
                  label="Company Logo"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  show-size
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
          <v-btn color="primary" :loading="companiesStore.loading" @click="saveCompany">
            {{ isEditing ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card v-if="selectedCompany">
        <v-card-title class="d-flex align-center pa-4">
          <v-avatar v-if="selectedCompany.logo_url" size="60" class="mr-4">
            <v-img :src="selectedCompany.logo_url" />
          </v-avatar>
          <div>
            <div class="text-h6">
              {{ selectedCompany.name }}
            </div>
            <v-chip :color="getStatusColor(selectedCompany.status)" size="small" class="mt-2">
              {{ selectedCompany.status }}
            </v-chip>
          </div>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 text-grey">
                Description
              </div>
              <div class="text-body-1">
                {{ selectedCompany.description || '-' }}
              </div>
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 text-grey">
                Address
              </div>
              <div class="text-body-1">
                {{ selectedCompany.address || '-' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">
                Contact Email
              </div>
              <div class="text-body-1">
                {{ selectedCompany.contact_email || '-' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">
                Contact Phone
              </div>
              <div class="text-body-1">
                {{ selectedCompany.contact_phone || '-' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">
                Registration Number
              </div>
              <div class="text-body-1">
                {{ selectedCompany.registration_number || '-' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">
                Tax ID
              </div>
              <div class="text-body-1">
                {{ selectedCompany.tax_id || '-' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">
                Created By
              </div>
              <div class="text-body-1">
                {{ selectedCompany.creator?.full_name || '-' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">
                Created At
              </div>
              <div class="text-body-1">
                {{ formatDate(selectedCompany.created_at) }}
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
          Are you sure you want to delete this company? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" :loading="companiesStore.loading" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { CompanyWithRelations, CompanyForm, CompanyStatus } from '~/types'
import { formatDate } from '~/utils/formatters'

export default defineComponent({
  name: 'CompaniesPage',

  middleware: ['internal-admin'],

  data () {
    return {
      dialog: false,
      viewDialog: false,
      deleteDialog: false,
      isEditing: false,
      selectedCompany: null as CompanyWithRelations | null,
      companyToDelete: null as CompanyWithRelations | null,
      logoFile: [] as File[],
      searchQuery: '',
      statusFilter: null as CompanyStatus | null,
      formData: {
        name: '',
        description: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        registration_number: '',
        tax_id: ''
      } as CompanyForm,
      headers: [
        { title: 'Logo', key: 'logo_url', sortable: false },
        { title: 'Name', key: 'name' },
        { title: 'Contact Email', key: 'contact_email' },
        { title: 'Contact Phone', key: 'contact_phone' },
        { title: 'Status', key: 'status' },
        { title: 'Created By', key: 'creator' },
        { title: 'Created At', key: 'created_at' },
        { title: 'Actions', key: 'actions', sortable: false }
      ],
      statusOptions: [
        { title: 'Active', value: 'active' },
        { title: 'Inactive', value: 'inactive' },
        { title: 'Archived', value: 'archived' }
      ],
      rules: {
        required: (v: any) => !!v || 'This field is required',
        email: (v: string) => !v || /.+@.+\..+/.test(v) || 'Email must be valid'
      }
    }
  },

  computed: {
    companiesStore () {
      return useCompaniesStore()
    }
  },

  watch: {
    searchQuery (val) {
      this.companiesStore.setFilters({ search: val })
    },
    statusFilter (val) {
      this.companiesStore.setFilters({ status: val })
    }
  },

  async mounted () {
    await this.companiesStore.fetchCompanies()
  },

  methods: {
    formatDate,

    getStatusColor (status: CompanyStatus): string {
      const colors: Record<CompanyStatus, string> = {
        active: 'success',
        inactive: 'warning',
        archived: 'grey'
      }
      return colors[status] || 'grey'
    },

    openCreateDialog () {
      this.isEditing = false
      this.selectedCompany = null
      this.resetForm()
      this.dialog = true
    },

    viewCompany (company: CompanyWithRelations) {
      this.selectedCompany = company
      this.viewDialog = true
    },

    editCompany (company: CompanyWithRelations) {
      this.isEditing = true
      this.selectedCompany = company
      this.formData = {
        name: company.name,
        description: company.description || '',
        address: company.address || '',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        registration_number: company.registration_number || '',
        tax_id: company.tax_id || ''
      }
      this.logoFile = []
      this.dialog = true
    },

    async saveCompany () {
      const form = this.$refs.form as any
      const { valid } = await form.validate()

      if (!valid) { return }

      const formDataToSubmit: CompanyForm = {
        ...this.formData,
        logo_file: this.logoFile[0] || null
      }

      let result
      if (this.isEditing && this.selectedCompany) {
        result = await this.companiesStore.updateCompany(this.selectedCompany.id, formDataToSubmit)
      } else {
        result = await this.companiesStore.createCompany(formDataToSubmit)
      }

      if (result.success) {
        this.closeDialog()
      }
    },

    async updateStatus (id: string, status: CompanyStatus) {
      await this.companiesStore.updateCompanyStatus(id, status)
    },

    deleteCompany (company: CompanyWithRelations) {
      this.companyToDelete = company
      this.deleteDialog = true
    },

    async confirmDelete () {
      if (!this.companyToDelete) { return }

      const result = await this.companiesStore.deleteCompany(this.companyToDelete.id)
      if (result.success) {
        this.deleteDialog = false
        this.companyToDelete = null
      }
    },

    resetForm () {
      this.formData = {
        name: '',
        description: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        registration_number: '',
        tax_id: ''
      }
      this.logoFile = []
      const form = this.$refs.form as any
      if (form) {
        form.reset()
      }
    },

    closeDialog () {
      this.dialog = false
      this.resetForm()
      this.selectedCompany = null
    }
  }
})
</script>
