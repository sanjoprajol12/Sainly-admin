<script setup lang="ts">
import ContentSectionService from '@/services/content/ContentSectionService'
import type { About } from '@/types/content/About'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

const aboutService = new ContentSectionService<About>('about')

const isLoading = ref(false)
const isSaving = ref(false)

const aboutFormData = reactive<Required<About>>({
  eyebrow: '',
  heading: '',
  founder_name: '',
  founder_title: '',
  founder_initials: '',
  founder_image: '',
  body: '',
  secondary_body: '',
  principles: [],
})

const formValidationRules = {
  heading: { required: rules.required },
  founder_name: { required: rules.required },
  body: { required: rules.required },
}

const { validationErrors, touchField, touch, hasError } = useFormValidation(formValidationRules, aboutFormData)

const getAbout = async () => {
  isLoading.value = true
  try {
    const data = await aboutService.show()

    Object.assign(aboutFormData, {
      eyebrow: data?.eyebrow ?? '',
      heading: data?.heading ?? '',
      founder_name: data?.founder_name ?? '',
      founder_title: data?.founder_title ?? '',
      founder_initials: data?.founder_initials ?? '',
      founder_image: data?.founder_image ?? '',
      body: data?.body ?? '',
      secondary_body: data?.secondary_body ?? '',
      principles: [...(data?.principles ?? [])],
    })
  }
  catch (error) {
    showError(error)
  }
  finally {
    isLoading.value = false
  }
}

const saveAbout = async () => {
  touch()
  if (hasError.value) return

  isSaving.value = true
  try {
    await aboutService.update({
      ...aboutFormData,
      principles: aboutFormData.principles.map(item => item.trim()).filter(Boolean),
    })
    showSuccess('About section saved')
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}

onMounted(getAbout)
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="About section"
        icon="user-round"
      >
        <template #subtitle>
          Introduce the studio and its founder.
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
              title="Studio story"
              icon="book-open"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="aboutFormData.eyebrow"
              label="Eyebrow"
              placeholder="e.g. Independent Studio"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="aboutFormData.heading"
              :error-messages="validationErrors('heading')"
              @input="touchField('heading')"
            >
              <template #label>
                Heading <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="aboutFormData.body"
              rows="4"
              auto-grow
              :error-messages="validationErrors('body')"
              @input="touchField('body')"
            >
              <template #label>
                Main paragraph <span class="text-red">*</span>
              </template>
            </VTextarea>
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="aboutFormData.secondary_body"
              label="Second paragraph"
              rows="3"
              auto-grow
            />
          </VCol>
          <VCol cols="12">
            <VCombobox
              v-model="aboutFormData.principles"
              label="Principles"
              placeholder="Type a principle and press Enter"
              chips
              multiple
              closable-chips
              clearable
            />
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="Founder"
              icon="user-round"
            />
          </VCol>
          <VCol
            cols="12"
            md="5"
          >
            <VTextField
              v-model="aboutFormData.founder_name"
              :error-messages="validationErrors('founder_name')"
              @input="touchField('founder_name')"
            >
              <template #label>
                Name <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>
          <VCol
            cols="12"
            md="5"
          >
            <VTextField
              v-model="aboutFormData.founder_title"
              label="Title"
              placeholder="e.g. Founder & Web Designer"
            />
          </VCol>
          <VCol
            cols="12"
            md="2"
          >
            <VTextField
              v-model="aboutFormData.founder_initials"
              label="Initials"
              maxlength="3"
              hint="Shown when there is no photo"
            />
          </VCol>
          <VCol cols="12">
            <ImageUploadField
              v-model="aboutFormData.founder_image"
              label="Founder photo"
              :preview-size="96"
              rounded
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
              @click="saveAbout"
            >
              Save changes
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </section>
</template>
