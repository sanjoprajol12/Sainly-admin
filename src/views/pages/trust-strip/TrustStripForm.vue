<script setup lang="ts">
import type { TrustStripItem } from '@/types/content/TrustStrip'
import { TRUST_STRIP_ICONS } from '@/constants/siteIcons'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'save', value: TrustStripItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isEditMode = ref(false)

const defaultForm = (): TrustStripItem => ({ id: '', icon: 'Zap', title: '', desc: '' })

const trustFormData = reactive<TrustStripItem>(defaultForm())

const formValidationRules = {
  title: { required: rules.required },
}

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, trustFormData)

const resetForm = () => {
  Object.assign(trustFormData, defaultForm())
  nextTick(() => resetValidation())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const handleSubmit = () => {
  touch()
  if (hasError.value) return

  // Keep the id on the form so a repeated click updates this item instead of adding a duplicate
  if (!trustFormData.id)
    trustFormData.id = generateId()

  emit('save', { ...trustFormData })
}

const editTrustData = (val: TrustStripItem) => {
  isEditMode.value = true
  Object.assign(trustFormData, { ...defaultForm(), ...val })
}

defineExpose({ edit: editTrustData })

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
      icon="shield-check"
      subtitle="Selling point shown under the hero"
      :title="isEditMode ? 'Edit item' : 'Add item'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VSelect
              v-model="trustFormData.icon"
              :items="TRUST_STRIP_ICONS"
              label="Icon"
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
          <VCol cols="12">
            <VTextField
              v-model="trustFormData.title"
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
              v-model="trustFormData.desc"
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
