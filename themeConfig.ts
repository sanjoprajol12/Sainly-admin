import { breakpointsVuetifyV3 } from '@vueuse/core'
import { VIcon } from 'vuetify/components/VIcon'
import { Skins } from '@/types/enums'
import { ContentWidth, FooterType, NavbarType } from '@/types/enums'

import logoImg from '@/assets/logo-mark.png'
import { defineLayoutThemeConfig } from '@/core'

export const { appConfig } = defineLayoutThemeConfig({
  app: {
    title: 'sainly studio',
    tagline: 'Admin portal',

    logo: h('img', {
      src: logoImg,
      alt: 'Sainly Studio logo',
      style: 'height: 34px; width: 34px; display: block; border-radius: 8px;',
    }),
    contentWidth: ContentWidth.Fluid,
    overlayNavFromBreakpoint: breakpointsVuetifyV3.md + 16,
    theme: 'light',
    skin: Skins.Bordered,
    iconRenderer: VIcon,
  },
  navbar: {
    type: NavbarType.Sticky,
    navbarBlur: true,
    isVerticalNavCollapsed: false,
    defaultNavItemIconProps: { icon: 'circle' },
    isVerticalNavSemiDark: false,
  },
  topNavbar: {
    transition: 'slide-y-reverse-transition',
    popoverOffset: 4,
  },
  footer: { type: FooterType.Static },
  icons: {
    chevronDown: { icon: 'chevron-down' },
    chevronRight: { icon: 'chevron-right' },
    close: { icon: 'x' },
    verticalNavPinned: { icon: 'chevron-left' },
    verticalNavUnPinned: { icon: 'chevron-right' },
    sectionTitlePlaceholder: { icon: 'minus' },
  },
})
