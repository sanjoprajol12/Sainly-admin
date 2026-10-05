import { defineStore } from 'pinia'
import JwtService from '@/services/JwtService'
import AdminUserLoginService from '@/services/auth/AdminUserLoginService'
import type { AdminUserView } from '@/types/admin-user/AdminUser'
import type { UserCredentials } from '@/types/auth/UserCredentials'

export const useAuthStore = defineStore('auth', () => {
  const errors = ref<string[]>([])
  const user = ref<AdminUserView | null>(null)

  // Set between a correct password and a correct two-factor code; kept in memory only
  const pendingMfaToken = ref<string | null>(null)

  const jwtService = JwtService
  const adminUserService = new AdminUserLoginService()
  const isAuthenticated = ref(!!jwtService.getToken())

  const setAuth = (authUser: AdminUserView, token?: string) => {
    isAuthenticated.value = true
    user.value = authUser
    errors.value = []
    if (token)
      jwtService.saveToken(token)
  }

  const setError = (error: any) => {
    errors.value = [error?.message || 'Something went wrong']
  }

  // Clears local session state; navigation is left to the caller / router guard.
  const purgeAuth = () => {
    isAuthenticated.value = false
    user.value = null
    errors.value = []
    jwtService.destroyToken()
  }

  // Returns 'mfa' when the account needs a two-factor code before it is signed in
  const login = async (credentials: UserCredentials): Promise<boolean | 'mfa'> => {
    try {
      const response = await adminUserService.checkLoginUser(credentials)

      if ('mfa_required' in response && response.mfa_required) {
        pendingMfaToken.value = response.mfa_token
        errors.value = []

        return 'mfa'
      }

      if ('token' in response) {
        setAuth(response.user, response.token)

        return true
      }

      setError(null)

      return false
    }
    catch (error: any) {
      setError(error)

      return false
    }
  }

  const completeMfaLogin = async (code: string) => {
    if (!pendingMfaToken.value) {
      setError({ message: 'Your sign-in attempt expired. Please enter your password again.' })

      return false
    }

    try {
      const { token, user: authUser } = await adminUserService.verifyMfaLogin({
        mfa_token: pendingMfaToken.value,
        code: code.trim(),
      })

      pendingMfaToken.value = null
      setAuth(authUser, token)

      return true
    }
    catch (error: any) {
      // An expired challenge cannot be retried; send the user back to the password step
      if (error?.status === 401)
        pendingMfaToken.value = null
      setError(error)

      return false
    }
  }

  const cancelMfaLogin = () => {
    pendingMfaToken.value = null
    errors.value = []
  }

  const logout = async () => {
    try {
      await adminUserService.logout()
    }
    catch {
      // The server keeps no required session state; always clear locally.
    }
    finally {
      purgeAuth()

      const { router } = await import('@/plugins/2.router')

      await router.push({ name: 'login' })
    }
  }

  const verifyAuth = async () => {
    if (!jwtService.getToken()) {
      purgeAuth()

      return
    }

    try {
      const { authenticated, user: authUser } = await adminUserService.doVerify()

      if (authenticated && authUser)
        setAuth(authUser)
      else
        purgeAuth()
    }
    catch (error: any) {
      // Only a rejected token ends the session. A network error or a cold-starting API
      // keeps the token so the next navigation can verify it again.
      if (error?.status === 401) {
        purgeAuth()

        return
      }

      isAuthenticated.value = false
      user.value = null
    }
  }

  const setMfaEnabled = (enabled: boolean) => {
    if (user.value)
      user.value = { ...user.value, mfa_enabled: enabled }
  }

  // Keeps the header in sync after the user edits their own username
  const updateUsername = (username: string) => {
    if (user.value)
      user.value = { ...user.value, username }
  }

  return {
    errors,
    user,
    isAuthenticated,
    pendingMfaToken,
    login,
    completeMfaLogin,
    cancelMfaLogin,
    setMfaEnabled,
    logout,
    setAuth,
    purgeAuth,
    setError,
    verifyAuth,
    updateUsername,
  }
})
