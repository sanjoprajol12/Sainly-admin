<script setup lang="ts">
import type { NavLinkItem, SiteSetting } from '@/types/site-setting/SiteSetting'

const props = defineProps<{ value: SiteSetting | null; saving?: boolean }>()
const emit = defineEmits<{ (e: 'save', payload: Partial<SiteSetting>): void }>()

const pickFooter = (settings: SiteSetting | null) => ({
  footer_title: settings?.footer_title ?? '',
  footer_tagline: settings?.footer_tagline ?? '',
  footer_description: settings?.footer_description ?? '',
  footer_availability_text: settings?.footer_availability_text ?? '',
  footer_copyright: settings?.footer_copyright ?? '',
  footer_tagline_bottom: settings?.footer_tagline_bottom ?? '',
  footer_nav_links: (settings?.footer_nav_links ?? []).map(link => ({ ...link })) as NavLinkItem[],
})

const footerForm = ref(pickFooter(props.value))

const saveFooter = () => {
  emit('save', {
    ...footerForm.value,
    footer_nav_links: footerForm.value.footer_nav_links.filter(link => link.label.trim() && link.href.trim()),
  })
}

watch(() => props.value, (settings: SiteSetting | null) => Object.assign(footerForm.value, pickFooter(settings)))
</script>

<template>
  <VCard flat>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="footerForm.footer_title"
            label="Title"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="footerForm.footer_tagline"
            label="Tagline"
          />
        </VCol>
        <VCol cols="12">
          <VTextarea
            v-model="footerForm.footer_description"
            label="Description"
            rows="3"
            auto-grow
          />
        </VCol>
        <VCol cols="12">
          <VTextField
            v-model="footerForm.footer_availability_text"
            label="Availability text"
            placeholder="e.g. Currently accepting new projects"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="footerForm.footer_copyright"
            label="Copyright text"
            placeholder="© 2026 Sainly Studio. All rights reserved."
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="footerForm.footer_tagline_bottom"
            label="Bottom line"
          />
        </VCol>
        <VCol cols="12">
          <NavLinksEditor
            v-model="footerForm.footer_nav_links"
            label="Footer menu"
          />
        </VCol>
        <VCol
          cols="12"
          class="d-flex justify-end"
        >
          <VBtn
            :loading="props.saving"
            @click="saveFooter"
          >
            Save
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
