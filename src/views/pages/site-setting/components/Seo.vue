<script setup lang="ts">
import type { SiteSetting } from '@/types/site-setting/SiteSetting'

const props = defineProps<{ value: SiteSetting | null; saving?: boolean }>()
const emit = defineEmits<{ (e: 'save', payload: Partial<SiteSetting>): void }>()

const pickSeo = (settings: SiteSetting | null) => ({
  site_title: settings?.site_title ?? '',
  meta_description: settings?.meta_description ?? '',
})

const seoForm = ref(pickSeo(props.value))

const saveSeo = () => emit('save', { ...seoForm.value })

watch(() => props.value, (settings: SiteSetting | null) => Object.assign(seoForm.value, pickSeo(settings)))
</script>

<template>
  <VCard flat>
    <VCardText class="d-grid gap-4">
      <VTextField
        v-model="seoForm.site_title"
        label="Site title"
        hint="Shown in browser tabs and search results. Aim for under 60 characters."
        persistent-hint
        counter="60"
        class="mt-3"
      />
      <VTextarea
        v-model="seoForm.meta_description"
        label="Meta description"
        hint="Summary shown in search results. Aim for under 160 characters."
        persistent-hint
        counter="160"
        rows="3"
        auto-grow
        class="mt-3"
      />
      <div class="d-flex justify-end">
        <VBtn
          class="mt-3"
          :loading="props.saving"
          @click="saveSeo"
        >
          Save
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
