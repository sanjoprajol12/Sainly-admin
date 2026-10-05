export interface MfaStatus {
  is_mfa_enabled: boolean
  recovery_codes_remaining: number
}

export interface MfaSetupData {
  account: string
  issuer: string
  secret_key: string
  otpauth_url: string
  image_url: string
}

export interface MfaRecoveryCodesResponse {
  success: boolean
  message?: string
  recovery_codes: string[]
}

export interface MfaLoginPayload {
  mfa_token: string
  code: string
}
