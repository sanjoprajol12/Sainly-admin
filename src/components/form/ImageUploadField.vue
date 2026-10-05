<script setup lang="ts">
import UploadService from '@/services/upload/UploadService'
import { resolveAssetUrl } from '@/utils/assetUrl'

interface Props {
  modelValue?: string | null
  label: string
  hint?: string
  accept?: string
  previewSize?: number
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  hint: 'PNG, JPG, WEBP, SVG or GIF up to 25MB',
  accept: 'image/*',
  previewSize: 72,
  rounded: false,
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const uploadService = new UploadService()

const isUploading = ref(false)
const hasPreviewError = ref(false)
const fileInputKey = ref(0)

const previewUrl = computed(() => resolveAssetUrl(props.modelValue))

watch(() => props.modelValue, () => {
  hasPreviewError.value = false
})

const handleFileSelection = async (file: File | File[] | null) => {
  const selectedFile = Array.isArray(file) ? (file[0] ?? null) : file
  if (!selectedFile) return

  isUploading.value = true
  try {
    const { url } = await uploadService.upload(selectedFile)

    emit('update:modelValue', url)
    showSuccess('Image uploaded')
  }
  catch (error) {
    showError(error)
  }
  finally {
    isUploading.value = false

    // Reset the picker so the same file can be chosen again
    fileInputKey.value++
  }
}

const clearImage = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <div>
    <div class="text-body-2 text-high-emphasis mb-2">
      {{ props.label }}
    </div>

    <div class="d-flex align-start gap-4">
      <VAvatar
        :size="props.previewSize"
        :rounded="props.rounded ? 'circle' : 'lg'"
        variant="tonal"
        color="secondary"
        class="image-upload-preview flex-shrink-0"
      >
        <VImg
          v-if="previewUrl && !hasPreviewError"
          :src="previewUrl"
          cover
          @error="hasPreviewError = true"
        />
        <VIcon
          v-else
          icon="image"
          size="28"
        />
      </VAvatar>

      <div class="flex-grow-1 d-flex flex-column gap-2">
        <VFileInput
          :key="fileInputKey"
          :accept="props.accept"
          :loading="isUploading"
          :disabled="isUploading"
          label="Upload new image"
          prepend-inner-icon="upload"
          density="compact"
          @update:model-value="handleFileSelection"
        />
        <VTextField
          :model-value="props.modelValue ?? ''"
          label="Image URL"
          density="compact"
          placeholder="/uploads/... or https://..."
          :clearable="!!props.modelValue"
          clear-icon="x"
          @update:model-value="(val: string | null) => emit('update:modelValue', val ?? '')"
          @click:clear="clearImage"
        />
        <div class="text-caption text-disabled">
          {{ props.hint }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-upload-preview {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
