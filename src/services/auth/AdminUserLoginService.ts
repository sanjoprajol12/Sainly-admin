import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseSuccess } from '@/types/APIResponse'
import type { LoginResponse, VerifyResponse } from '@/types/admin-user/AdminUser'
import type { ChangeCredentialsPayload, UserCredentials } from '@/types/auth/UserCredentials'

export default class AdminUserLoginService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async checkLoginUser(data: UserCredentials) {
    return this.post<LoginResponse>(data, 'login')
  }

  async doVerify() {
    return this.get<VerifyResponse>('verify')
  }

  async logout() {
    return this.post<APIResponseSuccess>({}, 'logout')
  }

  async changeCredentials(data: ChangeCredentialsPayload) {
    return this.post<APIResponseSuccess>(data, 'change-password')
  }
}
