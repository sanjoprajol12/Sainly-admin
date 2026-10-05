import type { Router } from 'vue-router'
import JwtService from '@/services/JwtService'
import { useAuthStore } from '@/store/auth'
import { usePermissions } from '@/composable/rbac/usePermissions'

export const setupGuards = (router: Router) => {
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // The store is only really hydrated once the user payload is in it — the token
    // survives a reload via localStorage while user (and so role/permissions) is still empty.
    if (JwtService.getToken() && !authStore.user?.id)
      await authStore.verifyAuth()

    const isLoggedIn = authStore.isAuthenticated && !!authStore.user?.id

    if (to.meta.unauthenticatedOnly && isLoggedIn)
      return next({ name: 'dashboard' })

    if (to.matched.some(record => record.meta.middleware === 'auth') && !isLoggedIn) {
      return next({
        name: 'login',
        query: { to: to.fullPath !== '/' ? to.fullPath : undefined },
      })
    }

    // Backend enforces the same rules; this only keeps the SPA from rendering a page that would 403.
    if (isLoggedIn && to.meta.permission) {
      const { canAny } = usePermissions()
      const required = Array.isArray(to.meta.permission) ? to.meta.permission : [to.meta.permission]

      if (!canAny(required as string[]))
        return next({ name: 'forbidden' })
    }

    return next()
  })
}
