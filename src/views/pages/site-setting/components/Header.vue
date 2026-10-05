<script setup lang="ts">
import type { NavLinkItem, SiteSetting } from '@/types/site-setting/SiteSetting'

const props = defineProps<{ value: SiteSetting | null; saving?: boolean }>()
const emit = defineEmits<{ (e: 'save', payload: Partial<SiteSetting>): void }>()

const pickHeader = (settings: SiteSetting | null) => ({
  header_cta_text: settings?.header_cta_text ?? '',
  header_cta_link: settings?.header_cta_link ?? '',
  header_nav_links: (settings?.header_nav_links ?? []).map(link => ({ ...link })) as NavLinkItem[],
})

const headerForm = ref(pickHeader(props.value))

const saveHeader = () => {
  emit('save', {
    ...headerForm.value,
    header_nav_links: headerForm.value.header_nav_links.filter(link => link.label.trim() && link.href.trim()),
  })
}

watch(() => props.value, (settings: SiteSetting | null) => Object.assign(headerForm.value, pickHeader(settings)))
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
            v-model="headerForm.header_cta_text"
            label="Button text"
            placeholder="e.g. Start a Project"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="headerForm.header_cta_link"
            label="Button link"
            placeholder="e.g. #contact"
          />
        </VCol>
        <VCol cols="12">
          <NavLinksEditor
            v-model="headerForm.header_nav_links"
            label="Header menu"
          />
        </VCol>
        <VCol
          cols="12"
          class="d-flex justify-end"
        >
          <VBtn
            :loading="props.saving"
            @click="saveHeader"
          >
            Save
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
