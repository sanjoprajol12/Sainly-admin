<script setup lang="ts">
import type { WhySainlyItem } from '@/types/content/WhySainly'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'save', value: WhySainlyItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isEditMode = ref(false)

const defaultForm = (): WhySainlyItem => ({ id: '', title: '', description: '' })

const itemFormData = reactive<WhySainlyItem>(defaultForm())

const formValidationRules = {
  title: { required: rules.required },
  description: { required: rules.required },
}

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, itemFormData)

const resetForm = () => {
  Object.assign(itemFormData, defaultForm())
  nextTick(() => resetValidation())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const handleSubmit = () => {
  touch()
  if (hasError.value) return

  // Keep the id on the form so a repeated click updates this item instead of adding a duplicate
  if (!itemFormData.id)
    itemFormData.id = generateId()

  emit('save', { ...itemFormData })
}

const editItemData = (val: WhySainlyItem) => {
  isEditMode.value = true
  Object.assign(itemFormData, { ...defaultForm(), ...val })
}

defineExpose({ edit: editItemData })

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
      icon="award"
      subtitle="Reason in the &quot;Why Sainly&quot; section"
      :title="isEditMode ? 'Edit reason' : 'Add reason'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="itemFormData.title"
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
              v-model="itemFormData.description"
              rows="4"
              auto-grow
              :error-messages="validationErrors('description')"
              @input="touchField('description')"
            >
              <template #label>
                Description <span class="text-red">*</span>
              </template>
            </VTextarea>
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
