<template>
  <div class="borrowers-page">
    <a-page-header
      title="Borrowers"
      sub-title="Manage borrower information"
    >
      <template #extra>
        <a-button type="primary" @click="navigateTo('/borrowers/new')">
          <plus-outlined />
          Add Borrower
        </a-button>
      </template>
    </a-page-header>

    <a-card>
      <a-space direction="vertical" :size="16" style="width: 100%">
        <a-input-search
          v-model:value="searchQuery"
          placeholder="Search by name, email, or contact number"
          :loading="borrowersStore.loading"
          @search="handleSearch"
          allow-clear
          style="max-width: 400px"
        />

        <a-table
          :columns="columns"
          :data-source="borrowersStore.borrowers"
          :loading="borrowersStore.loading"
          :pagination="{
            current: borrowersStore.pagination.page,
            pageSize: borrowersStore.pagination.limit,
            total: borrowersStore.pagination.total,
            showTotal: (total) => `Total ${total} borrowers`,
          }"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fullName'">
              <a @click="navigateTo(`/borrowers/${record.id}`)">
                {{ record.firstName }} {{ record.lastName }}
              </a>
            </template>

            <template v-if="column.key === 'employmentType'">
              <a-tag :color="getEmploymentTypeColor(record.employmentType)">
                {{ formatEmploymentType(record.employmentType) }}
              </a-tag>
            </template>

            <template v-if="column.key === 'monthlyIncome'">
              {{ formatCurrency(record.monthlyIncome) }}
            </template>

            <template v-if="column.key === 'isActive'">
              <a-tag :color="record.isActive ? 'green' : 'red'">
                {{ record.isActive ? 'Active' : 'Inactive' }}
              </a-tag>
            </template>

            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button
                  type="link"
                  size="small"
                  @click="navigateTo(`/borrowers/${record.id}`)"
                >
                  View
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  @click="navigateTo(`/loans/applications/new?borrowerId=${record.id}`)"
                >
                  New Application
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useBorrowersStore } from '~/stores/borrowers'

definePageMeta({
  // Auth handled by auth.global.ts middleware
  layout: 'default',
})

const borrowersStore = useBorrowersStore()
const searchQuery = ref('')

const columns = [
  {
    title: 'Name',
    key: 'fullName',
    dataIndex: 'fullName',
  },
  {
    title: 'Email',
    key: 'email',
    dataIndex: 'email',
  },
  {
    title: 'Contact Number',
    key: 'contactNumber',
    dataIndex: 'contactNumber',
  },
  {
    title: 'Employment Type',
    key: 'employmentType',
    dataIndex: 'employmentType',
  },
  {
    title: 'Monthly Income',
    key: 'monthlyIncome',
    dataIndex: 'monthlyIncome',
  },
  {
    title: 'Status',
    key: 'isActive',
    dataIndex: 'isActive',
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

const handleSearch = () => {
  borrowersStore.fetchBorrowers({
    search: searchQuery.value,
    page: 1,
  })
}

const handleTableChange = (pagination: any) => {
  borrowersStore.fetchBorrowers({
    search: searchQuery.value,
    page: pagination.current,
    limit: pagination.pageSize,
  })
}

onMounted(() => {
  borrowersStore.fetchBorrowers()
})
</script>

<style scoped>
.borrowers-page {
  padding: 24px;
}
</style>
