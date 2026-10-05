<script setup lang="ts">
import BusinessTypeService from '@/services/business-type/BusinessTypeService'
import type { BusinessType, BusinessTypeView } from '@/types/business-type/BusinessType'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const businessTypeService = new BusinessTypeService()

const isEditMode = ref(false)
const isSaving = ref(false)
const currentBusinessTypeId = ref<string | null>(null)

const businessTypeFormData = reactive<BusinessType>({ name: '' })

const formValidationRules = {
  name: { required: rules.required },
}

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, businessTypeFormData)

const resetForm = () => {
  businessTypeFormData.name = ''
  nextTick(() => resetValidation())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const handleSubmitBusinessType = async () => {
  touch()

  if (hasError.value) return

  try {
    isSaving.value = true

    const payload = { name: businessTypeFormData.name.trim() }

    if (isEditMode.value && currentBusinessTypeId.value) {
      await businessTypeService.update(currentBusinessTypeId.value, payload)
      showSuccess('Business type updated successfully')
    }
    else {
      await businessTypeService.store(payload)
      showSuccess('Business type created successfully')
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

const editBusinessTypeData = (val: BusinessTypeView) => {
  isEditMode.value = true
  currentBusinessTypeId.value = val.id
  businessTypeFormData.name = val.name ?? ''
}

defineExpose({ edit: editBusinessTypeData })

// Start every opening from a clean form; edit() fills it in right after (parents call it on nextTick).
// Resetting on open rather than on a timer after close means a quick close-then-reopen can't wipe the new data.
watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      isEditMode.value = false
      currentBusinessTypeId.value = null
      resetForm()
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="460"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="tag"
      subtitle="Option in the contact form dropdown"
      :title="isEditMode ? 'Edit business type' : 'Add business type'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="businessTypeFormData.name"
              placeholder="e.g. Restaurants & Cafés"
              :error-messages="validationErrors('name')"
              @input="touchField('name')"
              @keyup.enter="handleSubmitBusinessType"
            >
              <template #label>
                Name <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>

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
              @click="handleSubmitBusinessType"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>
