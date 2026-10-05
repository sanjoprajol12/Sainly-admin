<script setup lang="ts">
import type { ProcessStep } from '@/types/content/Process'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

type ProcessStepRow = ProcessStep & { _key: string }

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'save', value: ProcessStepRow): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isEditMode = ref(false)

const defaultForm = (): ProcessStepRow => ({ _key: '', step: '', title: '', description: '' })

const stepFormData = reactive<ProcessStepRow>(defaultForm())

const formValidationRules = {
  step: { required: rules.required },
  title: { required: rules.required },
}

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, stepFormData)

const resetForm = () => {
  Object.assign(stepFormData, defaultForm())
  nextTick(() => resetValidation())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const handleSubmit = () => {
  touch()
  if (hasError.value) return

  // Keep the key on the form so a repeated click updates this step instead of adding a duplicate
  if (!stepFormData._key)
    stepFormData._key = generateId()

  emit('save', { ...stepFormData, step: stepFormData.step.trim() })
}

const createStepData = (stepNumber: string) => {
  isEditMode.value = false
  stepFormData.step = stepNumber
}

const editStepData = (val: ProcessStepRow) => {
  isEditMode.value = true
  Object.assign(stepFormData, { ...defaultForm(), ...val })
}

defineExpose({ create: createStepData, edit: editStepData })

// Start every opening from a clean form; edit() fills it in right after (parents call it on nextTick).
// Resetting on open rather than on a timer after close means a quick close-then-reopen can't wipe the new data.
watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      isEditMode.value = false
      resetForm()
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="500"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="list-ordered"
      subtitle="Step in the process section"
      :title="isEditMode ? 'Edit step' : 'Add step'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField
              v-model="stepFormData.step"
              :error-messages="validationErrors('step')"
              @input="touchField('step')"
            >
              <template #label>
                Step <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>
          <VCol
            cols="12"
            md="8"
          >
            <VTextField
              v-model="stepFormData.title"
              :error-messages="validationErrors('title')"
              @input="touchField('title')"
            >
              <template #label>
                Title <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="stepFormData.description"
              label="Description"
              rows="3"
              auto-grow
            />
          </VCol>
          <VCol
            cols="12"
            class="d-flex justify-end gap-3"
          >
            <VBtn
              variant="text"
              color="secondary"
              prepend-icon="x"
              @click="closeDrawer"
            >
              Cancel
            </VBtn>
            <VBtn
              prepend-icon="save"
              @click="handleSubmit"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>
