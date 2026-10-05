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
  createdAt?: string
}

export interface LoginResponse {
  success: boolean
  token: string
  user: AdminUserView
}

export interface VerifyResponse {
  authenticated: boolean
  user?: AdminUserView
}
