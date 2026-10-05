<script setup lang="ts">
import DashboardService from '@/services/dashboard/DashboardService'
import type { DashboardStats } from '@/types/dashboard/DashboardStats'
import { PERMISSIONS } from '@/constants/rbac/permissions'
import { avatarText, formatDate } from '@/utils/formatters'

const dashboardService = new DashboardService()
const router = useRouter()
const authUser = useAuthUser().authUserData
const { can } = usePermissions()

const isLoading = ref(false)
const stats = ref<DashboardStats | null>(null)

const greeting = computed(() => {
  const hour = new Date().getHours()

  if (hour < 12)
    return { text: 'Good morning', icon: 'sun' }
  if (hour < 18)
    return { text: 'Good afternoon', icon: 'cloud-sun' }

  return { text: 'Good evening', icon: 'moon' }
})

const today = formatDate(new Date().toISOString(), { weekday: 'long', month: 'long', day: 'numeric' })

const statCards = computed(() => {
  const counts = stats.value?.counts

  return [
    {
      title: 'Unread messages',
      value: counts?.messages_unread ?? 0,
      desc: `${counts?.messages ?? 0} messages in total`,
      icon: 'mail',
      iconColor: 'error',
      to: 'messages',
    },
    {
      title: 'Reviews awaiting approval',
      value: counts?.reviews_pending ?? 0,
      desc: `${counts?.reviews_published ?? 0} published on the website`,
      icon: 'star',
      iconColor: 'warning',
      to: 'reviews',
    },
    {
      title: 'Projects',
      value: counts?.projects ?? 0,
      desc: 'Shown in "Our work"',
      icon: 'folder-git-2',
      iconColor: 'primary',
      to: 'projects',
    },
    {
      title: 'Services',
      value: counts?.services ?? 0,
      desc: `${counts?.faq ?? 0} FAQs, ${counts?.business_types ?? 0} business types`,
      icon: 'briefcase',
      iconColor: 'info',
      to: 'services',
    },
  ]
})

const quickLinks = [
  { title: 'Hero', subtitle: 'Headline and buttons', icon: 'layout', route: 'hero', permission: PERMISSIONS.CONTENT_MANAGE },
  { title: 'Trust strip', subtitle: 'Selling points', icon: 'shield-check', route: 'trust-strip', permission: PERMISSIONS.CONTENT_MANAGE },
  { title: 'Process', subtitle: 'How projects run', icon: 'list-ordered', route: 'process', permission: PERMISSIONS.CONTENT_MANAGE },
  { title: 'Why Sainly', subtitle: 'Reasons to choose us', icon: 'award', route: 'why-sainly', permission: PERMISSIONS.CONTENT_MANAGE },
  { title: 'About', subtitle: 'Founder story', icon: 'user-round', route: 'about', permission: PERMISSIONS.CONTENT_MANAGE },
  { title: 'FAQ', subtitle: 'Questions and answers', icon: 'message-circle-question', route: 'faq', permission: PERMISSIONS.CONTENT_MANAGE },
  { title: 'Contact section', subtitle: 'Contact details', icon: 'contact', route: 'contact-section', permission: PERMISSIONS.CONTENT_MANAGE },
  { title: 'Site settings', subtitle: 'Branding, SEO, menus', icon: 'settings', route: 'site-setting', permission: PERMISSIONS.SITE_SETTING_UPDATE },
]

const visibleQuickLinks = computed(() => quickLinks.filter(link => can(link.permission)))

const getStats = async () => {
  isLoading.value = true
  try {
    stats.value = await dashboardService.getStats()
  }
  catch (error) {
    showError(error)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(getStats)
</script>

<template>
  <section>
    <!-- Welcome banner -->
    <VCard
      flat
      class="welcome-banner mb-6"
    >
      <VCardText class="d-flex flex-wrap align-center justify-space-between gap-4 pa-6">
        <div class="d-flex align-center gap-4">
          <VAvatar
            size="56"
            rounded="lg"
            class="welcome-banner__icon"
          >
            <VIcon
              :icon="greeting.icon"
              size="30"
            />
          </VAvatar>
          <div>
            <div class="welcome-banner__date">
              <VIcon
                icon="calendar"
                size="14"
                class="me-1"
              />
              {{ today }}
            </div>
            <h1 class="welcome-banner__title">
              {{ greeting.text }}{{ authUser?.username ? `, ${authUser.username}` : '' }}
            </h1>
            <p class="welcome-banner__text">
              Here's what's happening on the Sainly Studio website.
            </p>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <VBtn
            variant="flat"
            color="white"
            class="welcome-banner__primary-btn"
            prepend-icon="mail"
            @click="router.push({ name: 'messages' })"
          >
            Open inbox
          </VBtn>
          <VBtn
            variant="outlined"
            class="welcome-banner__outline"
            prepend-icon="refresh-cw"
            :loading="isLoading"
            @click="getStats"
          >
            Refresh
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- Stats -->
    <VRow class="mb-2">
      <VCol
        v-for="card in statCards"
        :key="card.title"
        cols="12"
        sm="6"
        lg="3"
      >
        <VSkeletonLoader
          v-if="isLoading && !stats"
          type="article"
          class="admin-card"
        />
        <CardStatisticsWithIcon
          v-else
          v-bind="card"
        />
      </VCol>
    </VRow>

    <VRow>
      <!-- Recent messages -->
      <VCol
        cols="12"
        lg="7"
      >
        <VCard
          flat
          class="admin-card h-100"
        >
          <PageHeader
            title="Recent messages"
            subtitle="Latest enquiries from the contact form"
            icon="mail"
            size="small"
          >
            <template #actions>
              <VBtn
                variant="text"
                size="small"
                append-icon="arrow-right"
                @click="router.push({ name: 'messages' })"
              >
                View all
              </VBtn>
            </template>
          </PageHeader>
          <VDivider />
          <VList
            v-if="stats?.recent_messages?.length"
            lines="two"
            class="py-2"
          >
            <VListItem
              v-for="message in stats.recent_messages"
              :key="message.id"
              link
              class="px-5"
              @click="router.push({ name: 'messages', query: { id: message.id } })"
            >
              <template #prepend>
                <VBadge
                  dot
                  color="error"
                  :model-value="!message.read"
                  location="top start"
                  offset-x="2"
                  offset-y="2"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    {{ avatarText(message.name) }}
                  </VAvatar>
                </VBadge>
              </template>
              <VListItemTitle :class="{ 'font-weight-bold': !message.read }">
                {{ message.name }}
              </VListItemTitle>
              <VListItemSubtitle>{{ message.message }}</VListItemSubtitle>
              <template #append>
                <span class="text-caption text-disabled text-no-wrap ms-2">{{ formatDate(message.createdAt) }}</span>
              </template>
            </VListItem>
          </VList>
          <div
            v-else-if="isLoading"
            class="pa-5"
          >
            <VSkeletonLoader type="list-item-avatar-two-line@3" />
          </div>
          <EmptyState
            v-else
            icon="mail-open"
            title="No messages yet"
            text="Enquiries from the website's contact form will appear here."
            compact
          />
        </VCard>
      </VCol>

      <!-- Reviews awaiting approval -->
      <VCol
        cols="12"
        lg="5"
      >
        <VCard
          flat
          class="admin-card h-100"
        >
          <PageHeader
            title="Awaiting approval"
            subtitle="Reviews submitted on the website"
            icon="star"
            color="warning"
            size="small"
          >
            <template #actions>
              <VBtn
                variant="text"
                size="small"
                append-icon="arrow-right"
                @click="router.push({ name: 'reviews' })"
              >
                Moderate
              </VBtn>
            </template>
          </PageHeader>
          <VDivider />
          <VList
            v-if="stats?.pending_reviews?.length"
            lines="two"
            class="py-2"
          >
            <VListItem
              v-for="review in stats.pending_reviews"
              :key="review.id"
              link
              class="px-5"
              @click="router.push({ name: 'reviews' })"
            >
              <VListItemTitle>
                {{ review.name }}
                <span
                  v-if="review.company"
                  class="text-medium-emphasis font-weight-regular"
                >, {{ review.company }}</span>
              </VListItemTitle>
              <VListItemSubtitle>{{ review.review }}</VListItemSubtitle>
              <template #append>
                <VRating
                  :model-value="review.rating"
                  readonly
                  density="compact"
                  size="x-small"
                />
              </template>
            </VListItem>
          </VList>
          <div
            v-else-if="isLoading"
            class="pa-5"
          >
            <VSkeletonLoader type="list-item-two-line@3" />
          </div>
          <EmptyState
            v-else
            icon="check-circle-2"
            title="All caught up"
            text="There are no reviews waiting for approval."
            compact
          />
        </VCard>
      </VCol>

      <!-- Quick links -->
      <VCol
        v-if="visibleQuickLinks.length"
        cols="12"
      >
        <VCard
          flat
          class="admin-card"
        >
          <PageHeader
            title="Edit website content"
            subtitle="Jump straight to a section of the public site"
            icon="layout-grid"
            size="small"
          />
          <VDivider />
          <VCardText class="pa-5">
            <VRow>
              <VCol
                v-for="link in visibleQuickLinks"
                :key="link.route"
                cols="12"
                sm="6"
                md="4"
                xl="3"
              >
                <div
                  class="quick-link hover-tint d-flex align-center gap-3 pa-3 rounded-lg cursor-pointer"
                  role="link"
                  tabindex="0"
                  @click="router.push({ name: link.route })"
                  @keydown.enter="router.push({ name: link.route })"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                    rounded="lg"
                    size="40"
                  >
                    <VIcon
                      :icon="link.icon"
                      size="22"
                    />
                  </VAvatar>
                  <div class="flex-grow-1">
                    <div class="text-body-1 text-high-emphasis font-weight-medium">
                      {{ link.title }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ link.subtitle }}
                    </div>
                  </div>
                  <VIcon
                    icon="chevron-right"
                    class="quick-link__chevron text-disabled"
                  />
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>

<style lang="scss" scoped>
.welcome-banner {
  overflow: hidden;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%) !important;
  color: rgb(var(--v-theme-on-primary));

  // Global heading/text colours would otherwise win over the inherited white
  &__icon,
  &__date,
  &__title,
  &__text {
    color: #fff !important;
  }

  &__icon {
    background-color: rgba(255, 255, 255, 0.16) !important;
  }

  &__date {
    display: flex;
    align-items: center;
    font-size: 0.8125rem;
    opacity: 0.85;
  }

  &__title {
    margin: 0.125rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 2rem;
  }

  &__text {
    margin: 0;
    font-size: 0.9375rem;
    opacity: 0.9;
  }

  &__primary-btn {
    color: rgb(var(--v-theme-primary-darken-1)) !important;
  }

  &__outline {
    border-color: rgba(255, 255, 255, 0.5) !important;
    color: #fff !important;
  }
}

.quick-link {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &:hover .quick-link__chevron {
    color: rgb(var(--v-theme-primary)) !important;
    transform: translateX(2px);
  }

  &__chevron {
    transition: transform 0.2s ease;
  }
}
</style>
