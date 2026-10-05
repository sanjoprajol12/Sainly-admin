import { PERMISSIONS } from '@/constants/rbac/permissions'
import { filterNavByPermission } from '@/navigation/permissionFilter'
import type { NavGroup, NavLink, NavSectionTitle } from '@/types/layouts'

type NavItem = (NavLink | NavGroup | NavSectionTitle) & { permission?: string | string[] }

export const useNavItems = () => {
  const { canAny } = usePermissions()

  const allItems: NavItem[] = [
    {
      title: 'Dashboard',
      icon: { icon: 'layout-dashboard' },
      to: 'dashboard',
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },

    { heading: 'Inbox' },
    {
      title: 'Messages',
      icon: { icon: 'mail' },
      to: 'messages',
      permission: PERMISSIONS.MESSAGE_VIEW,
    },
    {
      title: 'Reviews',
      icon: { icon: 'star' },
      to: 'reviews',
      permission: PERMISSIONS.REVIEW_MANAGE,
    },

    { heading: 'Website content' },
    {
      title: 'Hero',
      icon: { icon: 'layout' },
      to: 'hero',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },
    {
      title: 'Trust strip',
      icon: { icon: 'shield-check' },
      to: 'trust-strip',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },
    {
      title: 'Services',
      icon: { icon: 'briefcase' },
      to: 'services',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },
    {
      title: 'Projects',
      icon: { icon: 'folder-git-2' },
      to: 'projects',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },
    {
      title: 'Process',
      icon: { icon: 'list-ordered' },
      to: 'process',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },
    {
      title: 'Why Sainly',
      icon: { icon: 'award' },
      to: 'why-sainly',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },
    {
      title: 'About',
      icon: { icon: 'user-round' },
      to: 'about',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },
    {
      title: 'FAQ',
      icon: { icon: 'circle-help' },
      to: 'faq',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },
    {
      title: 'Business types',
      icon: { icon: 'tag' },
      to: 'business-types',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },
    {
      title: 'Contact section',
      icon: { icon: 'contact' },
      to: 'contact-section',
      permission: PERMISSIONS.CONTENT_MANAGE,
    },

    { heading: 'Settings' },
    {
      title: 'Site settings',
      icon: { icon: 'settings' },
      to: 'site-setting',
      permission: PERMISSIONS.SITE_SETTING_UPDATE,
    },
    {
      title: 'Admin users',
      icon: { icon: 'users' },
      to: 'admin-users',
      permission: PERMISSIONS.ADMIN_USER_MANAGE,
    },
    {
      title: 'Security',
      icon: { icon: 'shield-check' },
      to: 'admin-security',
    },
  ]

  const mainItems = computed(() => filterNavByPermission(allItems, canAny))

  return { mainItems }
}
