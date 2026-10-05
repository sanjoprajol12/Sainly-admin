<script setup lang="ts">
import ContentSectionService from '@/services/content/ContentSectionService'
import type { ContactInfo } from '@/types/content/ContactInfo'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

const contactInfoService = new ContentSectionService<ContactInfo>('contact-info')

const isLoading = ref(false)
const isSaving = ref(false)

const contactFormData = reactive<Required<ContactInfo>>({
  eyebrow: '',
  heading: '',
  subtext: '',
  chat_label: '',
  email: '',
  instagram_handle: '',
  whatsapp_display: '',
})

const formValidationRules = {
  heading: { required: rules.required },
  email: { email: rules.email },
}

const { validationErrors, touchField, touch, hasError } = useFormValidation(formValidationRules, contactFormData)

const getContactInfo = async () => {
  isLoading.value = true
  try {
    const data = await contactInfoService.show()

    Object.assign(contactFormData, Object.fromEntries(
      Object.keys(contactFormData).map(key => [key, data?.[key as keyof ContactInfo] ?? '']),
    ))
  }
  catch (error) {
    showError(error)
  }
  finally {
    isLoading.value = false
  }
}

const saveContactInfo = async () => {
  touch()
  if (hasError.value) return

  isSaving.value = true
  try {
    await contactInfoService.update({ ...contactFormData })
    showSuccess('Contact section saved')
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}

onMounted(getContactInfo)
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card"
    >
      <PageHeader
        title="Contact section"
        icon="contact"
      >
        <template #subtitle>
          Text and contact details shown next to the contact form.
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
              title="Section text"
              icon="type"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactFormData.eyebrow"
              label="Eyebrow"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactFormData.heading"
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
              v-model="contactFormData.subtext"
              label="Subtext"
              rows="2"
              auto-grow
            />
          </VCol>

          <VCol cols="12">
            <SectionLabel
              title="Contact details"
              icon="book-user"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactFormData.email"
              label="Email"
              prepend-inner-icon="mail"
              :error-messages="validationErrors('email')"
              @input="touchField('email')"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactFormData.instagram_handle"
              label="Instagram handle"
              placeholder="@sainly_studio"
              prepend-inner-icon="instagram"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactFormData.whatsapp_display"
              label="WhatsApp number (as displayed)"
              placeholder="+977 98XXXXXXXX"
              prepend-inner-icon="message-square"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="contactFormData.chat_label"
              label="Chat button label"
              placeholder="e.g. Chat on WhatsApp"
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
              @click="saveContactInfo"
            >
              Save changes
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </section>
</template>
