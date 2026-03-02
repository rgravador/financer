<script setup lang="ts">
import { ref, computed } from 'vue'

interface DocumentRequest {
  documentName: string
  notes: string
  dueDate: string
}

interface Props {
  show: boolean
  applicationId: string
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', payload: {
    requestedDocuments: Array<{
      documentName: string
      notes: string
      dueDate?: string
    }>
    generalNotes?: string
  }): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const generalNotes = ref('')
const documentRequests = ref<DocumentRequest[]>([
  { documentName: '', notes: '', dueDate: '' },
])

const canSubmit = computed(() => {
  return documentRequests.value.every(
    (doc) => doc.documentName.trim() !== '' && doc.notes.trim() !== ''
  ) && documentRequests.value.length > 0
})

const addDocumentRequest = () => {
  documentRequests.value.push({
    documentName: '',
    notes: '',
    dueDate: '',
  })
}

const removeDocumentRequest = (index: number) => {
  if (documentRequests.value.length > 1) {
    documentRequests.value.splice(index, 1)
  }
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  const payload = {
    requestedDocuments: documentRequests.value.map((doc) => ({
      documentName: doc.documentName.trim(),
      notes: doc.notes.trim(),
      dueDate: doc.dueDate || undefined,
    })),
    generalNotes: generalNotes.value.trim() || undefined,
  }

  emit('submit', payload)
}

const handleClose = () => {
  // Reset form
  generalNotes.value = ''
  documentRequests.value = [{ documentName: '', notes: '', dueDate: '' }]
  emit('close')
}

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const commonDocumentTypes = [
  'Pay Stub',
  'Tax Return',
  'Bank Statement',
  'Employment Verification',
  'Proof of Address',
  'ID Document',
  'Credit Report',
  'Property Appraisal',
  'Insurance Policy',
  'Other',
]
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Request Additional Documents</h2>
        <button class="close-button" @click="handleClose" :disabled="loading">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="description">
          Specify which documents you need from the loan officer to continue processing this application.
        </p>

        <div class="document-requests">
          <div
            v-for="(doc, index) in documentRequests"
            :key="index"
            class="document-request-row"
          >
            <div class="row-header">
              <span class="row-number">Document {{ index + 1 }}</span>
              <button
                v-if="documentRequests.length > 1"
                class="remove-button"
                @click="removeDocumentRequest(index)"
                :disabled="loading"
              >
                Remove
              </button>
            </div>

            <div class="form-grid">
              <div class="form-field full-width">
                <label :for="`doc-name-${index}`">Document Name *</label>
                <input
                  :id="`doc-name-${index}`"
                  v-model="doc.documentName"
                  type="text"
                  placeholder="e.g., Recent Pay Stub"
                  :list="`doc-types-${index}`"
                  :disabled="loading"
                />
                <datalist :id="`doc-types-${index}`">
                  <option v-for="type in commonDocumentTypes" :key="type" :value="type" />
                </datalist>
              </div>

              <div class="form-field full-width">
                <label :for="`doc-notes-${index}`">Notes / Requirements *</label>
                <textarea
                  :id="`doc-notes-${index}`"
                  v-model="doc.notes"
                  rows="3"
                  placeholder="Explain what specific information or format is needed..."
                  :disabled="loading"
                />
              </div>

              <div class="form-field">
                <label :for="`doc-due-${index}`">Due Date (Optional)</label>
                <input
                  :id="`doc-due-${index}`"
                  v-model="doc.dueDate"
                  type="date"
                  :min="getTodayDate()"
                  :disabled="loading"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          class="add-document-button"
          @click="addDocumentRequest"
          :disabled="loading"
        >
          + Add Another Document
        </button>

        <div class="form-field">
          <label for="general-notes">General Notes (Optional)</label>
          <textarea
            id="general-notes"
            v-model="generalNotes"
            rows="3"
            placeholder="Any additional context or instructions for the officer..."
            :disabled="loading"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-button" @click="handleClose" :disabled="loading">
          Cancel
        </button>
        <button
          class="submit-button"
          @click="handleSubmit"
          :disabled="!canSubmit || loading"
        >
          {{ loading ? 'Submitting...' : 'Request Documents' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: background-color 0.2s;
}

.close-button:hover:not(:disabled) {
  background: #f3f4f6;
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.description {
  margin: 0 0 24px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.document-requests {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 16px;
}

.document-request-row {
  padding: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.row-number {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
}

.remove-button {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-button:hover:not(:disabled) {
  background: #ef4444;
  color: white;
}

.remove-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-field input,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-field input:disabled,
.form-field textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-field textarea {
  resize: vertical;
  font-family: inherit;
}

.add-document-button {
  width: 100%;
  padding: 12px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.add-document-button:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.add-document-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-button,
.submit-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.cancel-button:hover:not(:disabled) {
  background: #f9fafb;
}

.submit-button {
  background: #3b82f6;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #2563eb;
}

.cancel-button:disabled,
.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
