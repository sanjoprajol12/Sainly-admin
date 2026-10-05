export type AdminRole = 'super_admin' | 'admin'

export interface AdminUser {
  username: string
  password?: string
  role: AdminRole
}

export interface AdminUserView {
  id: string
  username: string
  role: AdminRole
  mfa_enabled?: boolean
  createdAt?: string
}

// Changing your own password returns a fresh token, because older tokens are revoked
export interface AdminUserUpdateResponse extends AdminUserView {
  token?: string
}

export interface LoginSuccessResponse {
  success: boolean
  token: string
  user: AdminUserView
}

// The password was right but the account has two-factor authentication:
// exchange mfa_token plus a code for a session at admin/login/mfa
export interface LoginMfaRequiredResponse {
  success: boolean
  mfa_required: true
  mfa_token: string
}

export type LoginResponse = LoginSuccessResponse | LoginMfaRequiredResponse

export interface VerifyResponse {
  authenticated: boolean
  user?: AdminUserView
}
