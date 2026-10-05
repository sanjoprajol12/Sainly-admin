import { useSiteSettingStore } from '@/store/siteSetting'

export function useSiteSetting() {
  const storeSetting = useSiteSettingStore()

  return computed(() => storeSetting.setting)
}

export function useSiteSettingLoader() {
  const storeSetting = useSiteSettingStore()

  return computed(() => storeSetting.settingLoading)
}
