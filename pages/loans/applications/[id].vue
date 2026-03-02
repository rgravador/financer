<template>
  <div class="application-detail-page">
    <a-page-header
      title="Loan Application Details"
      :sub-title="`Application #${route.params.id}`"
      @back="() => navigateTo('/loans/applications')"
    >
      <template #extra>
        <a-space>
          <a-button
            v-if="application?.status === 'draft'"
            type="primary"
            :loading="loansStore.loading"
            @click="handleSubmit"
          >
            <send-outlined />
            Submit Application
          </a-button>
          <a-tag :color="getStatusColor(application?.status || '')">
            {{ formatStatus(application?.status || '') }}
          </a-tag>
        </a-space>
      </template>
    </a-page-header>

    <a-spin :spinning="loansStore.loading">
      <a-row :gutter="[16, 16]">
        <!-- Borrower Information -->
        <a-col :span="24" :md="12">
          <a-card title="Borrower Information">
            <a-descriptions :column="1" bordered>
              <a-descriptions-item label="Name">
                <a @click="navigateTo(`/borrowers/${application?.borrowerId}`)">
                  {{ application?.borrower ? `${application.borrower.firstName} ${application.borrower.lastName}` : 'N/A' }}
                </a>
              </a-descriptions-item>
              <a-descriptions-item label="Email">
                {{ application?.borrower?.email || 'N/A' }}
              </a-descriptions-item>
              <a-descriptions-item label="Contact">
                {{ application?.borrower?.contactNumber || 'N/A' }}
              </a-descriptions-item>
              <a-descriptions-item label="Employment">
                {{ formatEmploymentType(application?.borrower?.employmentType || '') }}
              </a-descriptions-item>
              <a-descriptions-item label="Monthly Income">
                {{ formatCurrency(application?.borrower?.monthlyIncome || 0) }}
              </a-descriptions-item>
            </a-descriptions>

            <template v-if="application?.coBorrower">
              <a-divider>Co-Borrower</a-divider>
              <a-descriptions :column="1" bordered>
                <a-descriptions-item label="Name">
                  <a @click="navigateTo(`/borrowers/${application?.coBorrowerId}`)">
                    {{ `${application.coBorrower.firstName} ${application.coBorrower.lastName}` }}
                  </a>
                </a-descriptions-item>
                <a-descriptions-item label="Email">
                  {{ application.coBorrower.email }}
                </a-descriptions-item>
                <a-descriptions-item label="Contact">
                  {{ application.coBorrower.contactNumber }}
                </a-descriptions-item>
              </a-descriptions>
            </template>
          </a-card>
        </a-col>

        <!-- Loan Details -->
        <a-col :span="24" :md="12">
          <a-card title="Loan Details">
            <a-descriptions :column="1" bordered>
              <a-descriptions-item label="Loan Type">
                {{ application?.loanType?.name || 'N/A' }}
              </a-descriptions-item>
              <a-descriptions-item label="Requested Amount">
                {{ formatCurrency(application?.loanDetails.requestedAmount || 0) }}
              </a-descriptions-item>
              <a-descriptions-item label="Loan Term">
                {{ application?.loanDetails.requestedTerm }} months
              </a-descriptions-item>
              <a-descriptions-item label="Interest Rate">
                {{ application?.loanDetails.suggestedInterestRate }}%
              </a-descriptions-item>
              <a-descriptions-item v-if="application?.finalInterestRate" label="Final Interest Rate">
                {{ application.finalInterestRate }}%
              </a-descriptions-item>
              <a-descriptions-item label="Officer Notes">
                {{ application?.loanDetails.officerNotes || 'No notes' }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>

        <!-- Documents -->
        <a-col :span="24">
          <a-card title="Documents">
            <a-list
              :data-source="application?.documents || []"
              :locale="{ emptyText: 'No documents uploaded' }"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <template #actions>
                    <a :href="item.fileUrl" target="_blank">View</a>
                    <a
                      v-if="application?.status === 'draft'"
                      @click="handleDeleteDocument(item.id)"
                    >
                      Delete
                    </a>
                  </template>
                  <a-list-item-meta>
                    <template #title>{{ item.documentName }}</template>
                    <template #description>
                      Uploaded: {{ formatDate(item.uploadedAt) }}
                      <a-tag :color="item.status === 'uploaded' ? 'green' : 'orange'" style="margin-left: 8px">
                        {{ item.status }}
                      </a-tag>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>

            <a-divider />

            <DocumentUploader
              v-if="application?.status === 'draft' && application?.id"
              :application-id="application.id"
              @uploaded="handleDocumentUploaded"
            />
          </a-card>
        </a-col>

        <!-- Status Timeline -->
        <a-col :span="24">
          <a-card title="Application Timeline">
            <StatusTimeline
              v-if="application?.statusHistory"
              :status-history="application.statusHistory"
            />
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { SendOutlined } from '@ant-design/icons-vue'
import { useLoansStore } from '~/stores/loans'
import DocumentUploader from '~/components/DocumentUploader.vue'
import StatusTimeline from '~/components/StatusTimeline.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const route = useRoute()
const loansStore = useLoansStore()

const application = computed(() => loansStore.currentApplication)

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
  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleDocumentUploaded = () => {
  // Refresh application to show new document
  loansStore.fetchApplicationById(route.params.id as string)
}

const handleDeleteDocument = (docId: string) => {
  Modal.confirm({
    title: 'Delete Document',
    content: 'Are you sure you want to delete this document?',
    onOk: async () => {
      try {
        await loansStore.deleteDocument(route.params.id as string, docId)
        message.success('Document deleted successfully')
      } catch (error: any) {
        message.error(error.message || 'Failed to delete document')
      }
    },
  })
}

const handleSubmit = () => {
  Modal.confirm({
    title: 'Submit Application',
    content: 'Are you sure you want to submit this application for review? You will not be able to make changes after submission.',
    onOk: async () => {
      try {
        await loansStore.submitApplication(route.params.id as string)
        message.success('Application submitted successfully')
      } catch (error: any) {
        message.error(error.message || 'Failed to submit application')
      }
    },
  })
}

onMounted(() => {
  const applicationId = route.params.id as string
  loansStore.fetchApplicationById(applicationId)
})
</script>

<style scoped>
.application-detail-page {
  padding: 24px;
}
</style>
