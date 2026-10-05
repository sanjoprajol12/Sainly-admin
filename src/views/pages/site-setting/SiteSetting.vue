<script setup lang="ts">
import SiteSettingService from '@/services/site-setting/SiteSettingService'
import { useSiteSettingStore } from '@/store/siteSetting'
import type { SiteSetting } from '@/types/site-setting/SiteSetting'

import SSGeneral from './components/General.vue'
import SSBranding from './components/Branding.vue'
import SSSeo from './components/Seo.vue'
import SSHeader from './components/Header.vue'
import SSFooter from './components/Footer.vue'

const siteSettingService = new SiteSettingService()
const siteSettingStore = useSiteSettingStore()

const tabs = [
  { value: 'general', title: 'General', icon: 'info' },
  { value: 'branding', title: 'Branding', icon: 'palette' },
  { value: 'seo', title: 'SEO', icon: 'search' },
  { value: 'header', title: 'Header', icon: 'panel-top' },
  { value: 'footer', title: 'Footer', icon: 'panel-bottom' },
]

const activeTab = ref('general')
const isLoading = ref(true)
const isSaving = ref(false)
const siteSettings = ref<SiteSetting | null>(null)

async function loadSettings() {
  isLoading.value = true
  try {
    siteSettings.value = await siteSettingService.getSetting() ?? {}
  }
  catch (error) {
    showError(error)
  }
  finally {
    isLoading.value = false
  }
}

async function saveSetting(partial: Partial<SiteSetting>) {
  isSaving.value = true
  try {
    const { data } = await siteSettingService.update(partial)

    siteSettings.value = data
    siteSettingStore.setSetting(data)
    showSuccess('Site settings updated successfully')
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}

// Lifecycle Hooks
onMounted(loadSettings)
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Site settings"
        subtitle="Applies to the whole public website."
        icon="settings"
      />

      <VDivider />

      <VCardText>
        <div
          v-if="isLoading"
          class="d-flex justify-center py-10"
        >
          <VProgressCircular indeterminate />
        </div>
        <VRow v-else>
          <VCol
            cols="12"
            md="3"
          >
            <VTabs
              v-model="activeTab"
              direction="vertical"
              class="site-settings-tabs"
            >
              <VTab
                v-for="tab in tabs"
                :key="tab.value"
                :value="tab.value"
                :prepend-icon="tab.icon"
              >
                {{ tab.title }}
              </VTab>
            </VTabs>
          </VCol>

          <VCol
            cols="12"
            md="9"
          >
            <VTabsWindow v-model="activeTab">
              <VTabsWindowItem value="general">
                <SSGeneral
                  :value="siteSettings"
                  :saving="isSaving"
                  @save="saveSetting"
                />
              </VTabsWindowItem>
              <VTabsWindowItem value="branding">
                <SSBranding
                  :value="siteSettings"
                  :saving="isSaving"
                  @save="saveSetting"
                />
              </VTabsWindowItem>
              <VTabsWindowItem value="seo">
                <SSSeo
                  :value="siteSettings"
                  :saving="isSaving"
                  @save="saveSetting"
                />
              </VTabsWindowItem>
              <VTabsWindowItem value="header">
                <SSHeader
                  :value="siteSettings"
                  :saving="isSaving"
                  @save="saveSetting"
                />
              </VTabsWindowItem>
              <VTabsWindowItem value="footer">
                <SSFooter
                  :value="siteSettings"
                  :saving="isSaving"
                  @save="saveSetting"
                />
              </VTabsWindowItem>
            </VTabsWindow>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </section>
</template>

<style scoped>
.site-settings-tabs :deep(.v-tab) {
  min-width: 100%;
  justify-content: flex-start;
  white-space: normal !important;
  text-align: left;
  height: auto !important;
  min-height: 48px;
  padding: 12px 16px;
}
</style>
