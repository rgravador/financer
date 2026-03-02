<template>
  <div class="new-borrower-page">
    <a-page-header
      title="Add New Borrower"
      @back="() => navigateTo('/borrowers')"
    />

    <a-card>
      <a-form
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 14 }"
        @finish="handleSubmit"
      >
        <a-divider orientation="left">Personal Information</a-divider>

        <a-form-item
          label="First Name"
          name="firstName"
          :rules="[{ required: true, message: 'Please enter first name' }]"
        >
          <a-input v-model:value="formState.firstName" />
        </a-form-item>

        <a-form-item
          label="Last Name"
          name="lastName"
          :rules="[{ required: true, message: 'Please enter last name' }]"
        >
          <a-input v-model:value="formState.lastName" />
        </a-form-item>

        <a-form-item
          label="Email"
          name="email"
          :rules="[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]"
        >
          <a-input v-model:value="formState.email" type="email" />
        </a-form-item>

        <a-form-item
          label="Contact Number"
          name="contactNumber"
          :rules="[{ required: true, message: 'Please enter contact number' }]"
        >
          <a-input v-model:value="formState.contactNumber" />
        </a-form-item>

        <a-form-item
          label="Address"
          name="address"
          :rules="[{ required: true, message: 'Please enter address' }]"
        >
          <a-textarea v-model:value="formState.address" :rows="3" />
        </a-form-item>

        <a-form-item label="Date of Birth" name="dateOfBirth">
          <a-date-picker v-model:value="formState.dateOfBirth" style="width: 100%" />
        </a-form-item>

        <a-divider orientation="left">Employment Information</a-divider>

        <a-form-item
          label="Employment Type"
          name="employmentType"
          :rules="[{ required: true, message: 'Please select employment type' }]"
        >
          <a-select v-model:value="formState.employmentType">
            <a-select-option value="employed">Employed</a-select-option>
            <a-select-option value="self_employed">Self-Employed</a-select-option>
            <a-select-option value="business_owner">Business Owner</a-select-option>
            <a-select-option value="ofw">OFW</a-select-option>
            <a-select-option value="other">Other</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Employer" name="employer">
          <a-input v-model:value="formState.employer" />
        </a-form-item>

        <a-form-item
          label="Monthly Income"
          name="monthlyIncome"
          :rules="[
            { required: true, message: 'Please enter monthly income' },
            { type: 'number', min: 0, message: 'Income must be a positive number' },
          ]"
        >
          <a-input-number
            v-model:value="formState.monthlyIncome"
            :min="0"
            :formatter="(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/₱\s?|(,*)/g, '')"
            style="width: 100%"
          />
        </a-form-item>

        <a-divider orientation="left">Additional Notes</a-divider>

        <a-form-item label="Notes" name="notes">
          <a-textarea v-model:value="formState.notes" :rows="4" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
          <a-space>
            <a-button type="primary" html-type="submit" :loading="borrowersStore.loading">
              Create Borrower
            </a-button>
            <a-button @click="navigateTo('/borrowers')">Cancel</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useBorrowersStore } from '~/stores/borrowers'
import type { Dayjs } from 'dayjs'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const borrowersStore = useBorrowersStore()

const formState = reactive({
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  address: '',
  dateOfBirth: null as Dayjs | null,
  employmentType: '',
  employer: '',
  monthlyIncome: 0,
  notes: '',
})

const handleSubmit = async () => {
  try {
    const payload = {
      ...formState,
      dateOfBirth: formState.dateOfBirth?.format('YYYY-MM-DD'),
    }

    const borrower = await borrowersStore.createBorrower(payload)

    message.success('Borrower created successfully')
    navigateTo(`/borrowers/${borrower.id}`)
  } catch (error: any) {
    message.error(error.message || 'Failed to create borrower')
  }
}
</script>

<style scoped>
.new-borrower-page {
  padding: 24px;
}
</style>
