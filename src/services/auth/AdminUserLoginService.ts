import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseSuccess } from '@/types/APIResponse'
import type { LoginResponse, LoginSuccessResponse, VerifyResponse } from '@/types/admin-user/AdminUser'
import type { MfaLoginPayload } from '@/types/auth/Mfa'
import type { ChangeCredentialsPayload, UserCredentials } from '@/types/auth/UserCredentials'

export default class AdminUserLoginService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async checkLoginUser(data: UserCredentials) {
    return this.post<LoginResponse>(data, 'login')
  }

  async verifyMfaLogin(data: MfaLoginPayload) {
    return this.post<LoginSuccessResponse>(data, 'login/mfa')
  }

  async doVerify() {
    return this.get<VerifyResponse>('verify')
  }

  async logout() {
    return this.post<APIResponseSuccess>({}, 'logout')
  }

  async changeCredentials(data: ChangeCredentialsPayload) {
    // A password change returns a fresh token, because older tokens are revoked
    return this.post<APIResponseSuccess & { token?: string }>(data, 'change-password')
  }
}
