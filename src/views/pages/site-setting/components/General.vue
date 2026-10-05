<script setup lang="ts">
import type { SiteSetting } from '@/types/site-setting/SiteSetting'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules as validationRules } from '@/composable/validation/useRules'

// Props & Emits
const props = defineProps<{ value: SiteSetting | null; saving?: boolean }>()
const emit = defineEmits<{ (e: 'save', payload: Partial<SiteSetting>): void }>()

const pickGeneral = (settings: SiteSetting | null) => ({
  studio_name: settings?.studio_name ?? '',
  studio_tagline: settings?.studio_tagline ?? '',
  contact_email: settings?.contact_email ?? '',
  whatsapp_number: settings?.whatsapp_number ?? '',
  instagram_url: settings?.instagram_url ?? '',
})

const generalSettingsForm = reactive(pickGeneral(props.value))

// Validations
const optionalUrl = validationRules.custom(
  (value: string) => !value || /^https?:\/\/\S+$/i.test(value),
  'Enter a full URL starting with https://',
)

const rules = {
  contact_email: { email: validationRules.email },
  whatsapp_number: { phoneFormat: validationRules.phoneFormat },
  instagram_url: { optionalUrl },
}

const { validationErrors, touchField, touch, hasError } = useFormValidation(rules, generalSettingsForm)

// Methods
const saveGeneralSettings = () => {
  touch()

  if (hasError.value)
    return

  emit('save', { ...generalSettingsForm })
}

// Watchers
watch(() => props.value, (settings: SiteSetting | null) => Object.assign(generalSettingsForm, pickGeneral(settings)))
</script>

<template>
  <VCard flat>
    <VCardText class="d-grid gap-4">
      <VTextField
        v-model="generalSettingsForm.studio_name"
        label="Studio name"
        class="mt-3"
      />
      <VTextField
        v-model="generalSettingsForm.studio_tagline"
        label="Studio tagline"
        placeholder="e.g. Web Design & Development"
        class="mt-3"
      />
      <VTextField
        v-model="generalSettingsForm.contact_email"
        label="Contact email"
        prepend-inner-icon="mail"
        class="mt-3"
        :error-messages="validationErrors('contact_email')"
        @input="touchField('contact_email')"
      />
      <VTextField
        v-model="generalSettingsForm.whatsapp_number"
        label="WhatsApp number"
        placeholder="+977 98XXXXXXXX"
        hint="Used for the floating WhatsApp chat button"
        persistent-hint
        prepend-inner-icon="message-square"
        class="mt-3"
        :error-messages="validationErrors('whatsapp_number')"
        @input="touchField('whatsapp_number')"
      />
      <VTextField
        v-model="generalSettingsForm.instagram_url"
        label="Instagram URL"
        prepend-inner-icon="instagram"
        class="mt-3"
        :error-messages="validationErrors('instagram_url')"
        @input="touchField('instagram_url')"
      />
      <div class="d-flex justify-end">
        <VBtn
          class="mt-3"
          :loading="props.saving"
          @click="saveGeneralSettings"
        >
          Save
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
