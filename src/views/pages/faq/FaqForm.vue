<script setup lang="ts">
import FaqService from '@/services/faq/FaqService'
import type { Faq, FaqView } from '@/types/faq/Faq'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const faqService = new FaqService()

const isEditMode = ref(false)
const isSaving = ref(false)
const currentFaqId = ref<string | null>(null)

const faqFormData = reactive<Faq>({
  question: '',
  answer: '',
})

const formValidationRules = {
  question: { required: rules.required },
  answer: { required: rules.required },
}

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, faqFormData)

const resetForm = () => {
  Object.assign(faqFormData, { question: '', answer: '' })
  nextTick(() => resetValidation())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const handleSubmitFaq = async () => {
  touch()

  if (hasError.value) return

  try {
    isSaving.value = true
    if (isEditMode.value && currentFaqId.value) {
      await faqService.update(currentFaqId.value, { ...faqFormData })
      showSuccess('FAQ updated successfully')
    }
    else {
      await faqService.store({ ...faqFormData })
      showSuccess('FAQ created successfully')
    }
    emit('refresh')
    closeDrawer()
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}

const editFaqData = (val: FaqView) => {
  isEditMode.value = true
  currentFaqId.value = val.id

  Object.assign(faqFormData, {
    question: val.question?.trim() ?? '',
    answer: val.answer ?? '',
  })
}

defineExpose({ edit: editFaqData })

// Start every opening from a clean form; edit() fills it in right after (parents call it on nextTick).
// Resetting on open rather than on a timer after close means a quick close-then-reopen can't wipe the new data.
watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      isEditMode.value = false
      currentFaqId.value = null
      resetForm()
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="600"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="message-circle-question"
      subtitle="Shown in the FAQ section"
      :title="isEditMode ? 'Edit FAQ' : 'Add FAQ'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Question -->
          <VCol cols="12">
            <VTextField
              v-model="faqFormData.question"
              :error-messages="validationErrors('question')"
              @input="touchField('question')"
            >
              <template #label>
                Question <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>

          <!-- Answer -->
          <VCol cols="12">
            <VTextarea
              v-model="faqFormData.answer"
              rows="5"
              auto-grow
              :error-messages="validationErrors('answer')"
              @input="touchField('answer')"
            >
              <template #label>
                Answer <span class="text-red">*</span>
              </template>
            </VTextarea>
          </VCol>

          <!-- Actions -->
          <VCol
            cols="12"
            class="d-flex justify-end gap-3"
          >
            <VBtn
              variant="text"
              color="secondary"
              prepend-icon="x"
              :disabled="isSaving"
              @click="closeDrawer"
            >
              Cancel
            </VBtn>
            <VBtn
              :loading="isSaving"
              prepend-icon="save"
              @click="handleSubmitFaq"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>
