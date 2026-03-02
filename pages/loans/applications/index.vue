<template>
  <div class="applications-page">
    <a-page-header
      title="Loan Applications"
      sub-title="Manage loan applications"
    >
      <template #extra>
        <a-button type="primary" @click="navigateTo('/loans/applications/new')">
          <plus-outlined />
          New Application
        </a-button>
      </template>
    </a-page-header>

    <a-card>
      <a-space direction="vertical" :size="16" style="width: 100%">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-select
              v-model:value="filters.status"
              placeholder="Filter by status"
              allow-clear
              style="width: 100%"
              @change="handleFilterChange"
            >
              <a-select-option value="">All Statuses</a-select-option>
              <a-select-option value="draft">Draft</a-select-option>
              <a-select-option value="submitted">Submitted</a-select-option>
              <a-select-option value="under_review">Under Review</a-select-option>
              <a-select-option value="pending_documents">Pending Documents</a-select-option>
              <a-select-option value="approved">Approved</a-select-option>
              <a-select-option value="rejected">Rejected</a-select-option>
              <a-select-option value="disbursed">Disbursed</a-select-option>
            </a-select>
          </a-col>
        </a-row>

        <a-table
          :columns="columns"
          :data-source="loansStore.applications"
          :loading="loansStore.loading"
          :pagination="{
            current: loansStore.pagination.page,
            pageSize: loansStore.pagination.limit,
            total: loansStore.pagination.total,
            showTotal: (total) => `Total ${total} applications`,
          }"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'borrower'">
              <a @click="navigateTo(`/borrowers/${record.borrowerId}`)">
                {{ getBorrowerName(record) }}
              </a>
            </template>

            <template v-if="column.key === 'loanType'">
              {{ getLoanTypeName(record) }}
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
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useLoansStore } from '~/stores/loans'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const loansStore = useLoansStore()

const filters = reactive({
  status: '',
})

const columns = [
  {
    title: 'Borrower',
    key: 'borrower',
  },
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

const getBorrowerName = (record: any): string => {
  if (record.borrower) {
    return `${record.borrower.firstName} ${record.borrower.lastName}`
  }
  return 'N/A'
}

const getLoanTypeName = (record: any): string => {
  if (record.loanType) {
    return record.loanType.name
  }
  return 'N/A'
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

const handleFilterChange = () => {
  loansStore.fetchApplications({
    status: filters.status || undefined,
    page: 1,
  })
}

const handleTableChange = (pagination: any) => {
  loansStore.fetchApplications({
    status: filters.status || undefined,
    page: pagination.current,
    limit: pagination.pageSize,
  })
}

onMounted(() => {
  loansStore.fetchApplications()
})
</script>

<style scoped>
.applications-page {
  padding: 24px;
}
</style>
