import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseSuccess } from '@/types/APIResponse'
import type { MfaRecoveryCodesResponse, MfaSetupData, MfaStatus } from '@/types/auth/Mfa'

/** Two-factor authentication (authenticator app) for the signed-in admin. */
export default class MfaService extends BaseAPIService {
  constructor() {
    super('admin/mfa')
  }

  async status() {
    return this.get<MfaStatus>()
  }

  async setup() {
    return this.post<MfaSetupData>({}, 'setup')
  }

  async activate(code: string) {
    return this.post<MfaRecoveryCodesResponse>({ code }, 'activate')
  }

  async disable(currentPassword: string) {
    return this.post<APIResponseSuccess>({ current_password: currentPassword }, 'disable')
  }

  async regenerateRecoveryCodes(currentPassword: string) {
    return this.post<MfaRecoveryCodesResponse>({ current_password: currentPassword }, 'recovery-codes')
  }
}
