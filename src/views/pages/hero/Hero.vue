<script setup lang="ts">
import ContentSectionService from '@/services/content/ContentSectionService'
import type { Hero } from '@/types/content/Hero'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

const heroService = new ContentSectionService<Hero>('hero')

const isLoading = ref(false)
const isSaving = ref(false)

const heroFormData = reactive<Required<Hero>>({
  eyebrow: '',
  headline: '',
  subtext: '',
  primary_cta_text: '',
  secondary_cta_text: '',
  crafted_for_label: '',
  crafted_for_tags: [],
})

const formValidationRules = {
  headline: { required: rules.required },
}

const { validationErrors, touchField, touch, hasError } = useFormValidation(formValidationRules, heroFormData)

const getHero = async () => {
  isLoading.value = true
  try {
    const data = await heroService.show()

    Object.assign(heroFormData, {
      eyebrow: data?.eyebrow ?? '',
      headline: data?.headline ?? '',
      subtext: data?.subtext ?? '',
      primary_cta_text: data?.primary_cta_text ?? '',
      secondary_cta_text: data?.secondary_cta_text ?? '',
      crafted_for_label: data?.crafted_for_label ?? '',
      crafted_for_tags: [...(data?.crafted_for_tags ?? [])],
    })
  }
  catch (error) {
    showError(error)
  }
  finally {
    isLoading.value = false
  }
}

const saveHero = async () => {
  touch()
  if (hasError.value) return

  isSaving.value = true
  try {
    await heroService.update({
      ...heroFormData,
      crafted_for_tags: heroFormData.crafted_for_tags.map(tag => tag.trim()).filter(Boolean),
    })
    showSuccess('Hero section saved')
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}

onMounted(getHero)
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="Hero section"
        icon="layout"
      >
        <template #subtitle>
          The first thing visitors see on the home page.
        </template>
      </PageHeader>

      <VDivider />

      <VProgressLinear
        v-if="isLoading"
        indeterminate
      />

      <VCardText>
        <VRow>
          <VCol cols="12">
            <SectionLabel
              title="Headline"
              icon="type"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="heroFormData.eyebrow"
              label="Eyebrow"
              placeholder="e.g. Web Design Studio"
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="heroFormData.headline"
              :error-messages="validationErrors('headline')"
              @input="touchField('headline')"
            >
              <template #label>
                Headline <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="heroFormData.subtext"
              label="Subtext"
              rows="3"
              auto-grow
            />
          </VCol>
          <VCol cols="12">
            <SectionLabel
              title="Buttons"
              icon="mouse-pointer-click"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="heroFormData.primary_cta_text"
              label="Primary button text"
              placeholder="e.g. Start a project"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="heroFormData.secondary_cta_text"
              label="Secondary button text"
              placeholder="e.g. View our work"
            />
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="&quot;Crafted for&quot; strip"
              icon="tag"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField
              v-model="heroFormData.crafted_for_label"
              label="Label"
              placeholder="e.g. Crafted for"
            />
          </VCol>
          <VCol
            cols="12"
            md="8"
          >
            <VCombobox
              v-model="heroFormData.crafted_for_tags"
              label="Business types"
              placeholder="Type and press Enter to add"
              chips
              multiple
              closable-chips
              clearable
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
              @click="saveHero"
            >
              Save changes
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </section>
</template>
