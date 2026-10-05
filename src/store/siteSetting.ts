import SiteSettingService from '@/services/site-setting/SiteSettingService'
import type { SiteSetting } from '@/types/site-setting/SiteSetting'

const settingService = new SiteSettingService()

export const useSiteSettingStore = defineStore('siteSetting', () => {
  const settingLoading = ref(false)
  const setting = ref<SiteSetting>({})

  const getSetting = async () => {
    settingLoading.value = true
    try {
      setting.value = await settingService.getSetting() ?? {}
    }
    catch (error) {
      showError(error)
    }
    finally {
      settingLoading.value = false
    }
  }

  const setSetting = (data: SiteSetting) => {
    setting.value = data
  }

  return { setting, settingLoading, getSetting, setSetting }
})
