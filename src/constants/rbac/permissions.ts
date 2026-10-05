export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  CONTENT_MANAGE: 'content.manage',
  MESSAGE_VIEW: 'message.view',
  REVIEW_MANAGE: 'review.manage',
  SITE_SETTING_UPDATE: 'site-setting.update',
  ADMIN_USER_MANAGE: 'admin-user.manage',
} as const

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const SUPER_ADMIN_ROLE = 'super_admin'

/**
 * The API knows two roles. Super admins can do everything; regular admins can
 * manage all website content but not other admin accounts (the API returns 403).
 */
export const ROLE_PERMISSIONS: Record<string, PermissionName[]> = {
  admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.MESSAGE_VIEW,
    PERMISSIONS.REVIEW_MANAGE,
    PERMISSIONS.SITE_SETTING_UPDATE,
  ],
}
