<script setup lang="ts">
import type { SiteSetting } from '@/types/site-setting/SiteSetting'

const props = defineProps<{ value: SiteSetting | null; saving?: boolean }>()
const emit = defineEmits<{ (e: 'save', payload: Partial<SiteSetting>): void }>()

const pickBranding = (settings: SiteSetting | null) => ({
  logo: settings?.logo ?? '',
  favicon: settings?.favicon ?? '',
  og_image: settings?.og_image ?? '',
  primary_color: settings?.primary_color || '#0F6E56',
})

const brandingForm = ref(pickBranding(props.value))

const isHexColor = computed(() => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(brandingForm.value.primary_color))

const saveBranding = () => {
  if (!isHexColor.value) {
    showErrorMsg('Primary colour must be a hex value such as #0F6E56')

    return
  }

  emit('save', { ...brandingForm.value })
}

watch(() => props.value, (settings: SiteSetting | null) => Object.assign(brandingForm.value, pickBranding(settings)))
</script>

<template>
  <VCard flat>
    <VCardText>
      <VRow class="gy-6">
        <VCol cols="12">
          <ImageUploadField
            v-model="brandingForm.logo"
            label="Logo"
            hint="Shown in the website header. PNG or SVG with a transparent background works best."
          />
        </VCol>
        <VCol cols="12">
          <ImageUploadField
            v-model="brandingForm.favicon"
            label="Favicon"
            accept="image/*,.ico"
            hint="Browser tab icon. Square PNG or ICO, at least 64×64px."
            :preview-size="56"
          />
        </VCol>
        <VCol cols="12">
          <ImageUploadField
            v-model="brandingForm.og_image"
            label="Social share image"
            hint="Preview image when the site is shared on social media. 1200×630px recommended."
          />
        </VCol>

        <VCol cols="12">
          <div class="text-body-2 text-high-emphasis mb-2">
            Primary colour
          </div>
          <div class="d-flex align-center gap-4 flex-wrap">
            <VMenu :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <div
                  v-bind="menuProps"
                  class="color-swatch cursor-pointer rounded"
                  :style="{ backgroundColor: isHexColor ? brandingForm.primary_color : 'transparent' }"
                />
              </template>
              <VColorPicker
                v-model="brandingForm.primary_color"
                mode="hex"
                :modes="['hex']"
              />
            </VMenu>
            <VTextField
              v-model="brandingForm.primary_color"
              label="Hex value"
              style="max-inline-size: 200px;"
              :error-messages="isHexColor ? [] : ['Use a hex value such as #0F6E56']"
            />
          </div>
        </VCol>

        <VCol
          cols="12"
          class="d-flex justify-end"
        >
          <VBtn
            :loading="props.saving"
            @click="saveBranding"
          >
            Save
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style scoped>
.color-swatch {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  block-size: 48px;
  inline-size: 48px;
}
</style>
