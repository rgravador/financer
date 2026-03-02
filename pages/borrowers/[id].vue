<template>
  <div class="borrower-detail-page">
    <a-page-header
      :title="`${borrower?.firstName} ${borrower?.lastName}`"
      :sub-title="borrower?.email"
      @back="() => navigateTo('/borrowers')"
    >
      <template #extra>
        <a-space>
          <a-button
            type="primary"
            @click="navigateTo(`/loans/applications/new?borrowerId=${route.params.id}`)"
          >
            <plus-outlined />
            New Application
          </a-button>
          <a-button @click="editMode = true">
            <edit-outlined />
            Edit
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-spin :spinning="borrowersStore.loading">
      <a-row :gutter="[16, 16]">
        <a-col :span="24" :md="12">
          <a-card title="Personal Information">
            <a-descriptions :column="1" bordered>
              <a-descriptions-item label="Full Name">
                {{ borrower?.firstName }} {{ borrower?.lastName }}
              </a-descriptions-item>
              <a-descriptions-item label="Email">
                {{ borrower?.email }}
              </a-descriptions-item>
              <a-descriptions-item label="Contact Number">
                {{ borrower?.contactNumber }}
              </a-descriptions-item>
              <a-descriptions-item label="Address">
                {{ borrower?.address }}
              </a-descriptions-item>
              <a-descriptions-item label="Date of Birth">
                {{ borrower?.dateOfBirth ? formatDate(borrower.dateOfBirth) : 'N/A' }}
              </a-descriptions-item>
              <a-descriptions-item label="Status">
                <a-tag :color="borrower?.isActive ? 'green' : 'red'">
                  {{ borrower?.isActive ? 'Active' : 'Inactive' }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>

        <a-col :span="24" :md="12">
          <a-card title="Employment Information">
            <a-descriptions :column="1" bordered>
              <a-descriptions-item label="Employment Type">
                <a-tag :color="getEmploymentTypeColor(borrower?.employmentType || '')">
                  {{ formatEmploymentType(borrower?.employmentType || '') }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="Employer">
                {{ borrower?.employer || 'N/A' }}
              </a-descriptions-item>
              <a-descriptions-item label="Monthly Income">
                {{ formatCurrency(borrower?.monthlyIncome || 0) }}
              </a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <a-descriptions :column="1" bordered>
              <a-descriptions-item label="Notes">
                {{ borrower?.notes || 'No notes' }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>

        <a-col :span="24">
          <a-card title="Loan History">
            <a-table
              :columns="loanColumns"
              :data-source="borrowersStore.loanHistory"
              :pagination="false"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'loanType'">
                  {{ record.loanTypeId.name || 'N/A' }}
                </template>

                <template v-if="column.key === 'requestedAmount'">
                  {{ formatCurrency(record.loanDetails.requestedAmount) }}
                </template>

                <template v-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ formatStatus(record.status) }}
                  </a-tag>
                </template>

                <template v-if="column.key === 'createdAt'">
                  {{ formatDate(record.createdAt) }}
                </template>

                <template v-if="column.key === 'actions'">
                  <a-button
                    type="link"
                    size="small"
                    @click="navigateTo(`/loans/applications/${record.id}`)"
                  >
                    View
                  </a-button>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { PlusOutlined, EditOutlined } from '@ant-design/icons-vue'
import { useBorrowersStore } from '~/stores/borrowers'

definePageMeta({
  // Auth handled by auth.global.ts middleware
  layout: 'default',
})

const route = useRoute()
const borrowersStore = useBorrowersStore()
const editMode = ref(false)

const borrower = computed(() => borrowersStore.currentBorrower)

const loanColumns = [
  {
    title: 'Loan Type',
    key: 'loanType',
  },
  {
    title: 'Amount',
    key: 'requestedAmount',
  },
  {
    title: 'Status',
    key: 'status',
  },
  {
    title: 'Date Applied',
    key: 'createdAt',
  },
  {
    title: 'Actions',
    key: 'actions',
  },
]

const getEmploymentTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    employed: 'blue',
    self_employed: 'green',
    business_owner: 'purple',
    ofw: 'orange',
    other: 'gray',
  }
  return colors[type] || 'gray'
}

const formatEmploymentType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'gray',
    submitted: 'blue',
    under_review: 'orange',
    pending_documents: 'gold',
    approved: 'green',
    rejected: 'red',
    disbursed: 'purple',
  }
  return colors[status] || 'gray'
}

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(() => {
  const borrowerId = route.params.id as string
  borrowersStore.fetchBorrowerById(borrowerId)
})
</script>

<style scoped>
.borrower-detail-page {
  padding: 24px;
}
</style>
