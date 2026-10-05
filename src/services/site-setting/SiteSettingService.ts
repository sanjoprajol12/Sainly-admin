import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseWithData } from '@/types/APIResponse'
import type { SiteSetting } from '@/types/site-setting/SiteSetting'

export default class SiteSettingService extends BaseAPIService {
  constructor() {
    super('site-settings')
  }

  async getSetting() {
    return this.get<SiteSetting>()
  }

  async update(data: Partial<SiteSetting>) {
    return this.put<APIResponseWithData<SiteSetting>>(data)
  }
}
