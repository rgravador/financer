<template>
  <div class="document-uploader">
    <!-- Drag and Drop Zone -->
    <div
      class="upload-zone"
      :class="{
        'upload-zone--active': isDragging,
        'upload-zone--disabled': disabled || loading,
      }"
      role="button"
      tabindex="0"
      :aria-label="`Upload files. ${hint || `Supported: ${acceptedTypes}`}`"
      :aria-disabled="disabled || loading"
      @dragenter.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @dragover.prevent
      @drop.prevent="onDrop"
      @click="triggerFileInput"
      @keydown.enter="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="acceptedTypes"
        :multiple="multiple"
        class="hidden-input"
        @change="onFileSelect"
      />

      <div v-if="loading" class="upload-loading">
        <v-progress-circular indeterminate color="primary" size="48" width="4" />
        <span>Uploading {{ progress }}%</span>
      </div>

      <div v-else class="upload-content">
        <div class="upload-icon">
          <v-icon size="48" :color="isDragging ? 'primary' : 'grey'">
            {{ isDragging ? 'mdi-file-move' : 'mdi-cloud-upload-outline' }}
          </v-icon>
        </div>
        <p class="upload-text">
          <span class="highlight">Click to upload</span> or drag and drop
        </p>
        <p class="upload-hint">
          {{ hint || `Supported: ${acceptedTypes}` }}
        </p>
      </div>
    </div>

    <!-- File Preview (for single file) -->
    <div v-if="previewFile && !multiple" class="file-preview">
      <div class="preview-icon">
        <v-icon v-if="isImage(previewFile)" size="32" color="primary">mdi-file-image</v-icon>
        <v-icon v-else-if="isPdf(previewFile)" size="32" color="error">mdi-file-pdf-box</v-icon>
        <v-icon v-else size="32" color="grey">mdi-file-document</v-icon>
      </div>
      <div class="preview-info">
        <span class="preview-name">{{ previewFile.name }}</span>
        <span class="preview-size">{{ formatFileSize(previewFile.size) }}</span>
      </div>
      <v-btn
        variant="text"
        icon="mdi-close"
        size="small"
        aria-label="Remove file"
        @click.stop="clearFile"
      />
    </div>

    <!-- Multiple Files List -->
    <div v-if="multiple && selectedFiles.length > 0" class="files-list">
      <div
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="file-item"
      >
        <div class="file-icon">
          <v-icon v-if="isImage(file)" size="20" color="primary">mdi-file-image</v-icon>
          <v-icon v-else-if="isPdf(file)" size="20" color="error">mdi-file-pdf-box</v-icon>
          <v-icon v-else size="20" color="grey">mdi-file-document</v-icon>
        </div>
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <v-btn
          variant="text"
          icon="mdi-close"
          size="x-small"
          :aria-label="`Remove ${file.name}`"
          @click.stop="removeFile(index)"
        />
      </div>
    </div>

    <!-- Progress Bar -->
    <v-progress-linear
      v-if="loading && progress > 0"
      :model-value="progress"
      color="primary"
      height="6"
      rounded
      class="upload-progress"
    />

    <!-- Error Message -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      class="upload-error"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: File | File[] | null
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
  hint?: string
  disabled?: boolean
  loading?: boolean
  progress?: number
}

interface Emits {
  (e: 'update:modelValue', value: File | File[] | null): void
  (e: 'upload', file: File | File[]): void
  (e: 'error', message: string): void
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  accept: 'image/*,.pdf,.doc,.docx',
  maxSize: 10, // 10MB
  hint: '',
  disabled: false,
  loading: false,
  progress: 0,
})

const emit = defineEmits<Emits>()

// Refs
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const errorMessage = ref('')

// State
const selectedFiles = ref<File[]>([])

// Computed
const acceptedTypes = computed(() => props.accept)

const previewFile = computed(() => {
  if (props.multiple) return null
  return selectedFiles.value[0] || null
})

// Methods
const triggerFileInput = () => {
  if (props.disabled || props.loading) return
  fileInputRef.value?.click()
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(Array.from(target.files))
  }
  // Reset input
  target.value = ''
}

const onDragEnter = () => {
  if (props.disabled || props.loading) return
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (event: DragEvent) => {
  if (props.disabled || props.loading) return
  isDragging.value = false

  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files))
  }
}

const handleFiles = (files: File[]) => {
  errorMessage.value = ''

  // Validate files
  const validFiles: File[] = []
  for (const file of files) {
    // Check size
    if (file.size > props.maxSize * 1024 * 1024) {
      errorMessage.value = `File "${file.name}" exceeds maximum size of ${props.maxSize}MB`
      emit('error', errorMessage.value)
      continue
    }

    // Check type
    if (!isValidType(file)) {
      errorMessage.value = `File "${file.name}" is not a supported file type`
      emit('error', errorMessage.value)
      continue
    }

    validFiles.push(file)
  }

  if (validFiles.length === 0) return

  if (props.multiple) {
    selectedFiles.value = [...selectedFiles.value, ...validFiles]
    emit('update:modelValue', selectedFiles.value)
    emit('upload', selectedFiles.value)
  } else {
    selectedFiles.value = [validFiles[0]]
    emit('update:modelValue', validFiles[0])
    emit('upload', validFiles[0])
  }
}

const isValidType = (file: File): boolean => {
  const acceptedList = props.accept.split(',').map(t => t.trim())

  for (const accepted of acceptedList) {
    if (accepted.startsWith('.')) {
      // Extension match
      if (file.name.toLowerCase().endsWith(accepted.toLowerCase())) {
        return true
      }
    } else if (accepted.includes('/*')) {
      // MIME type wildcard
      const [type] = accepted.split('/')
      if (file.type.startsWith(type)) {
        return true
      }
    } else {
      // Exact MIME type match
      if (file.type === accepted) {
        return true
      }
    }
  }

  return false
}

const clearFile = () => {
  selectedFiles.value = []
  emit('update:modelValue', null)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  emit('update:modelValue', selectedFiles.value.length > 0 ? selectedFiles.value : null)
}

const isImage = (file: File): boolean => {
  return file.type.startsWith('image/')
}

const isPdf = (file: File): boolean => {
  return file.type === 'application/pdf'
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Watch for external model value changes
watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      selectedFiles.value = []
    } else if (Array.isArray(value)) {
      selectedFiles.value = value
    } else {
      selectedFiles.value = [value]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.document-uploader {
  width: 100%;
}

/* Upload Zone */
.upload-zone {
  position: relative;
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.upload-zone:hover:not(.upload-zone--disabled) {
  border-color: rgba(var(--v-theme-primary), 0.4);
  background: rgba(var(--v-theme-primary), 0.04);
}

.upload-zone:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.upload-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.upload-zone--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hidden-input {
  display: none;
}

/* Upload Content */
.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  width: 80px;
  height: 80px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-text {
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.upload-text .highlight {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.upload-hint {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0;
}

/* Loading State */
.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-loading span {
  font-size: 14px;
  color: rgb(var(--v-theme-primary));
}

/* File Preview */
.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 12px;
}

.preview-icon {
  width: 48px;
  height: 48px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-name {
  font-weight: 600;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.preview-size {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* Files List */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 10px;
}

.file-icon {
  width: 32px;
  height: 32px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* Progress */
.upload-progress {
  margin-top: 16px;
}

/* Error */
.upload-error {
  margin-top: 16px;
}
</style>
