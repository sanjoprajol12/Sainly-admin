import type { App } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { setupGuards } from "./guards"
import { PERMISSIONS } from "@/constants/rbac/permissions"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
      component: () => import("@/layouts/DefaultLayout.vue"),
      meta: {
        middleware: "auth",
      },
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/views/pages/Dashboard.vue"),
          meta: {
            permission: PERMISSIONS.DASHBOARD_VIEW,
            title: "Dashboard",
            closable: false,
            icon: "layout-dashboard",
            key: "fullPath",
          },
        },

        // Inbox
        {
          path: "messages",
          name: "messages",
          component: () => import("@/views/pages/messages/Message.vue"),
          meta: {
            permission: PERMISSIONS.MESSAGE_VIEW,
            title: "Messages",
            icon: "mail",
            key: "fullPath",
          },
        },
        {
          path: "reviews",
          name: "reviews",
          component: () => import("@/views/pages/reviews/Review.vue"),
          meta: {
            permission: PERMISSIONS.REVIEW_MANAGE,
            title: "Reviews",
            icon: "star",
            key: "fullPath",
          },
        },

        // Website content
        {
          path: "hero",
          name: "hero",
          component: () => import("@/views/pages/hero/Hero.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "Hero",
            icon: "layout",
            key: "fullPath",
          },
        },
        {
          path: "trust-strip",
          name: "trust-strip",
          component: () => import("@/views/pages/trust-strip/TrustStrip.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "Trust strip",
            icon: "shield-check",
            key: "fullPath",
          },
        },
        {
          path: "services",
          name: "services",
          component: () => import("@/views/pages/services/ServiceItem.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "Services",
            icon: "briefcase",
            key: "fullPath",
          },
        },
        {
          path: "projects",
          name: "projects",
          component: () => import("@/views/pages/projects/Project.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "Projects",
            icon: "folder-git-2",
            key: "fullPath",
          },
        },
        {
          path: "process",
          name: "process",
          component: () => import("@/views/pages/process/Process.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "Process",
            icon: "list-ordered",
            key: "fullPath",
          },
        },
        {
          path: "why-sainly",
          name: "why-sainly",
          component: () => import("@/views/pages/why-sainly/WhySainly.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "Why Sainly",
            icon: "award",
            key: "fullPath",
          },
        },
        {
          path: "about",
          name: "about",
          component: () => import("@/views/pages/about/About.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "About",
            icon: "user-round",
            key: "fullPath",
          },
        },
        {
          path: "faq",
          name: "faq",
          component: () => import("@/views/pages/faq/Faq.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "FAQ",
            icon: "circle-help",
            key: "fullPath",
          },
        },
        {
          path: "business-types",
          name: "business-types",
          component: () => import("@/views/pages/business-types/BusinessType.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "Business types",
            icon: "tag",
            key: "fullPath",
          },
        },
        {
          path: "contact-section",
          name: "contact-section",
          component: () => import("@/views/pages/contact-section/ContactSection.vue"),
          meta: {
            permission: PERMISSIONS.CONTENT_MANAGE,
            title: "Contact section",
            icon: "contact",
            key: "fullPath",
          },
        },

        // Settings
        {
          path: "site-setting",
          name: "site-setting",
          component: () => import("@/views/pages/site-setting/SiteSetting.vue"),
          meta: {
            permission: PERMISSIONS.SITE_SETTING_UPDATE,
            title: "Site settings",
            icon: "settings",
            key: "fullPath",
          },
        },
        {
          path: "admin-users",
          name: "admin-users",
          component: () => import("@/views/pages/admin-users/AdminUser.vue"),
          meta: {
            permission: PERMISSIONS.ADMIN_USER_MANAGE,
            title: "Admin users",
            icon: "users",
            key: "fullPath",
          },
        },
        {
          path: "admin-profile",
          name: "admin-profile",
          component: () => import("@/views/pages/profile/ProfilePage.vue"),
          meta: {
            title: "My account",
            icon: "user-cog",
            key: "fullPath",
          },
        },

        // Error & Other
        {
          path: "/403",
          name: "forbidden",
          component: () => import("@/views/pages/Forbidden.vue"),
          meta: {
            title: "Access denied",
            icon: "lock",
            key: "fullPath",
          },
        },
        {
          path: "/404",
          name: "404",
          component: () => import("@/views/Error.vue"),
          meta: {
            title: "Error 404",
            icon: "alert-circle",
            key: "fullPath",
          },
        },
      ],
    },
    {
      path: "/",
      component: () => import("@/layouts/AuthLayout.vue"), // Auth layout wrapper
      children: [
        {
          path: "/login",
          name: "login",
          component: () => import("@/views/pages/auth/Login.vue"),
          meta: { unauthenticatedOnly: true }, // Redirect if logged in
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/404",
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 60 }

    return { top: 0 }
  },
})

setupGuards(router)

export { router }

export default function (app: App) {
  app.use(router)
}
