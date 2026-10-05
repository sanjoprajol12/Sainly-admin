<script setup lang="ts">
import ContentSectionService from '@/services/content/ContentSectionService'
import type { SectionMetaField } from '@/types/content/SectionMeta'

interface Props {
  resource: string
  title?: string
  subtitle?: string
  fields?: SectionMetaField[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Section heading',
  subtitle: 'Text shown above this section on the website',
  fields: () => [
    { key: 'eyebrow', label: 'Eyebrow' },
    { key: 'heading', label: 'Heading' },
    { key: 'subtext', label: 'Subtext', multiline: true },
  ],
})

const sectionService = new ContentSectionService<Record<string, string>>(props.resource)

const isLoading = ref(false)
const isSaving = ref(false)
const formData = ref<Record<string, string>>({})

// The API replaces the whole document on PUT, so keys this form doesn't show
// (e.g. older names the website still falls back to) are sent back untouched.
const storedData = ref<Record<string, string> | null>(null)

const getSection = async () => {
  isLoading.value = true
  try {
    const data = await sectionService.show()

    storedData.value = data && typeof data === 'object' && !Array.isArray(data) ? data : {}
    formData.value = Object.fromEntries(props.fields.map(field => [field.key, data?.[field.key] ?? '']))
  }
  catch (error) {
    showError(error)
  }
  finally {
    isLoading.value = false
  }
}

const saveSection = async () => {
  // Saving after a failed load would overwrite the stored section with blanks
  if (!storedData.value) {
    showErrorMsg('This section could not be loaded, so it was not saved. Refresh the page and try again.')

    return
  }

  isSaving.value = true
  try {
    const { data } = await sectionService.update({ ...storedData.value, ...formData.value })

    storedData.value = data ?? { ...storedData.value, ...formData.value }
    showSuccess(`${props.title} saved`)
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}

onMounted(getSection)
</script>

<template>
  <VExpansionPanels
    variant="accordion"
    class="section-meta-card mb-6"
  >
    <VExpansionPanel
      elevation="0"
      rounded="lg"
    >
      <VExpansionPanelTitle>
        <div class="d-flex align-center gap-4">
          <VAvatar
            color="info"
            variant="tonal"
            rounded="lg"
            size="38"
          >
            <VIcon
              icon="heading"
              size="20"
            />
          </VAvatar>
          <div>
            <div class="text-h6">
              {{ props.title }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ props.subtitle }}
            </div>
          </div>
        </div>
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <VProgressLinear
          v-if="isLoading"
          indeterminate
          class="mb-4"
        />
        <VRow>
          <VCol
            v-for="field in props.fields"
            :key="field.key"
            cols="12"
            :md="field.multiline ? 12 : 6"
          >
            <VTextarea
              v-if="field.multiline"
              v-model="formData[field.key]"
              :label="field.label"
              rows="2"
              auto-grow
            />
            <VTextField
              v-else
              v-model="formData[field.key]"
              :label="field.label"
            />
          </VCol>
          <VCol
            cols="12"
            class="d-flex justify-end"
          >
            <VBtn
              :loading="isSaving"
              :disabled="isLoading"
              prepend-icon="save"
              @click="saveSection"
            >
              Save heading
            </VBtn>
          </VCol>
        </VRow>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

<style scoped>
.section-meta-card :deep(.v-expansion-panel) {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
