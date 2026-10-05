import { ROLE_PERMISSIONS, SUPER_ADMIN_ROLE, type PermissionName } from '@/constants/rbac/permissions'
import { useAuthStore } from '@/store/auth'

export const usePermissions = () => {
  const authStore = useAuthStore()

  const roles = computed<string[]>(() => authStore.user?.role ? [authStore.user.role] : [])
  const permissions = computed<string[]>(() => roles.value.flatMap(role => ROLE_PERMISSIONS[role] ?? []))
  const isSuperAdmin = computed<boolean>(() => roles.value.includes(SUPER_ADMIN_ROLE))

  const can = (permission?: PermissionName | string | null) => {
    if (!permission) return true
    if (isSuperAdmin.value) return true

    return permissions.value.includes(permission)
  }

  const canAny = (list: Array<PermissionName | string>) => {
    if (!list?.length) return true
    if (isSuperAdmin.value) return true

    return list.some(permission => permissions.value.includes(permission))
  }

  const canAll = (list: Array<PermissionName | string>) => {
    if (!list?.length) return true
    if (isSuperAdmin.value) return true

    return list.every(permission => permissions.value.includes(permission))
  }

  const hasRole = (role: string) => roles.value.includes(role)

  return { permissions, roles, isSuperAdmin, can, canAny, canAll, hasRole }
}
