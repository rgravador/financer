<template>
  <div class="document-uploader">
    <a-upload
      :file-list="fileList"
      :before-upload="beforeUpload"
      :custom-request="handleUpload"
      :remove="handleRemove"
      list-type="picture"
      accept="image/*,.pdf,.doc,.docx"
    >
      <a-button :loading="uploading">
        <upload-outlined />
        {{ uploading ? 'Uploading...' : 'Select File' }}
      </a-button>
    </a-upload>

    <a-form-item
      v-if="showDocumentName"
      label="Document Name"
      :rules="[{ required: true, message: 'Please enter document name' }]"
    >
      <a-input
        v-model:value="documentName"
        placeholder="Enter document name (e.g., Valid ID, Proof of Income)"
      />
    </a-form-item>

    <a-button
      v-if="selectedFile && documentName"
      type="primary"
      :loading="uploading"
      @click="uploadDocument"
    >
      <upload-outlined />
      Upload Document
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'

interface Props {
  applicationId: string
  showDocumentName?: boolean
}

interface Emits {
  (e: 'uploaded', document: any): void
  (e: 'removed', docId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showDocumentName: true,
})

const emit = defineEmits<Emits>()

const fileList = ref<any[]>([])
const selectedFile = ref<File | null>(null)
const documentName = ref('')
const uploading = ref(false)

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // Check file size (max 10MB)
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('File must be smaller than 10MB')
    return false
  }

  selectedFile.value = file
  return false // Prevent auto upload
}

const handleUpload = () => {
  // Custom upload handled by uploadDocument
  return
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

const uploadDocument = async () => {
  if (!selectedFile.value || !documentName.value) {
    message.error('Please select a file and enter document name')
    return
  }

  uploading.value = true

  try {
    const base64 = await convertFileToBase64(selectedFile.value)

    const { data, error } = await useFetch(`/api/loans/${props.applicationId}/documents`, {
      method: 'POST',
      body: {
        documentName: documentName.value,
        fileBase64: base64,
      },
    })

    if (error.value) {
      throw new Error(error.value.message || 'Failed to upload document')
    }

    message.success('Document uploaded successfully')
    emit('uploaded', data.value)

    // Reset form
    selectedFile.value = null
    documentName.value = ''
    fileList.value = []
  } catch (error: any) {
    message.error(error.message || 'Failed to upload document')
  } finally {
    uploading.value = false
  }
}

const handleRemove = async (file: any) => {
  if (file.id) {
    try {
      await useFetch(`/api/loans/${props.applicationId}/documents/${file.id}`, {
        method: 'DELETE',
      })

      message.success('Document removed successfully')
      emit('removed', file.id)
    } catch (error) {
      message.error('Failed to remove document')
    }
  }

  fileList.value = fileList.value.filter((f) => f.uid !== file.uid)
  selectedFile.value = null
}
</script>

<style scoped>
.document-uploader {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
