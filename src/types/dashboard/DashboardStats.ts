import type { MessageView } from '@/types/message/Message'
import type { ReviewView } from '@/types/review/Review'

export interface DashboardCounts {
  services: number
  projects: number
  faq: number
  business_types: number
  reviews: number
  reviews_published: number
  reviews_pending: number
  messages: number
  messages_unread: number
}

export interface DashboardStats {
  counts: DashboardCounts
  recent_messages: MessageView[]
  pending_reviews: ReviewView[]
}
