<script setup lang="ts">
import ServiceItemService from '@/services/service/ServiceItemService'
import type { ServiceItem, ServiceItemView } from '@/types/service/ServiceItem'
import { SERVICE_ICONS } from '@/constants/siteIcons'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const serviceItemService = new ServiceItemService()

const isEditMode = ref(false)
const isSaving = ref(false)
const currentServiceId = ref<string | null>(null)

const defaultForm = (): ServiceItem => ({
  title: '',
  description: '',
  icon: 'Briefcase',
  badge: '',
})

const serviceFormData = reactive<ServiceItem>(defaultForm())

const formValidationRules = {
  title: { required: rules.required },
  description: { required: rules.required },
}

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, serviceFormData)

const resetForm = () => {
  Object.assign(serviceFormData, defaultForm())
  nextTick(() => resetValidation())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const handleSubmitService = async () => {
  touch()

  if (hasError.value) return

  try {
    isSaving.value = true
    if (isEditMode.value && currentServiceId.value) {
      await serviceItemService.update(currentServiceId.value, { ...serviceFormData })
      showSuccess('Service updated successfully')
    }
    else {
      await serviceItemService.store({ ...serviceFormData })
      showSuccess('Service created successfully')
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

const editServiceData = (val: ServiceItemView) => {
  isEditMode.value = true
  currentServiceId.value = val.id

  Object.assign(serviceFormData, {
    title: val.title ?? '',
    description: val.description ?? '',
    icon: val.icon || 'Briefcase',
    badge: val.badge ?? '',
  })
}

defineExpose({ edit: editServiceData })

// Start every opening from a clean form; edit() fills it in right after (parents call it on nextTick).
// Resetting on open rather than on a timer after close means a quick close-then-reopen can't wipe the new data.
watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      isEditMode.value = false
      currentServiceId.value = null
      resetForm()
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="560"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="briefcase"
      subtitle="Shown in the Services section of the website"
      :title="isEditMode ? 'Edit service' : 'Add service'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Title -->
          <VCol cols="12">
            <VTextField
              v-model="serviceFormData.title"
              :error-messages="validationErrors('title')"
              @input="touchField('title')"
            >
              <template #label>
                Title <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>

          <!-- Icon -->
          <VCol cols="12">
            <VSelect
              v-model="serviceFormData.icon"
              :items="SERVICE_ICONS"
              label="Icon"
              hint="Icons supported by the website's service cards"
              persistent-hint
            >
              <template #item="{ props: itemProps, item }">
                <VListItem
                  v-bind="itemProps"
                  :prepend-icon="item.raw.preview"
                />
              </template>
              <template #selection="{ item }">
                <VIcon
                  :icon="item.raw.preview"
                  class="me-2"
                />
                {{ item.raw.title }}
              </template>
            </VSelect>
          </VCol>

          <!-- Badge -->
          <VCol cols="12">
            <VTextField
              v-model="serviceFormData.badge"
              label="Badge"
              placeholder="e.g. Most Popular"
            />
          </VCol>

          <!-- Description -->
          <VCol cols="12">
            <VTextarea
              v-model="serviceFormData.description"
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
              @click="handleSubmitService"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>
