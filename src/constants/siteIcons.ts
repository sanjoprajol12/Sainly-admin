// Icon names the public website knows how to render (lucide-vue-next component names),
// paired with the same Lucide icon registered in plugins/vuetify/icons.ts, so the admin preview is exact.
export interface SiteIconOption {
  title: string
  value: string
  preview: string
}

// components/ui/ServiceCard.vue falls back to Briefcase for anything else
export const SERVICE_ICONS: SiteIconOption[] = [
  { title: 'Briefcase', value: 'Briefcase', preview: 'briefcase' },
  { title: 'Shopping bag', value: 'ShoppingBag', preview: 'shopping-bag' },
  { title: 'Layers', value: 'Layers', preview: 'layers' },
]

// components/sections/TrustStrip.vue falls back to Zap for anything else
export const TRUST_STRIP_ICONS: SiteIconOption[] = [
  { title: 'Smartphone', value: 'Smartphone', preview: 'smartphone' },
  { title: 'Zap', value: 'Zap', preview: 'zap' },
  { title: 'Trending up', value: 'TrendingUp', preview: 'trending-up' },
  { title: 'Shield', value: 'Shield', preview: 'shield' },
  { title: 'Sparkles', value: 'Sparkles', preview: 'sparkles' },
  { title: 'Check circle', value: 'CheckCircle', preview: 'check-circle' },
  { title: 'Star', value: 'Star', preview: 'star' },
  { title: 'Award', value: 'Award', preview: 'award' },
  { title: 'Globe', value: 'Globe', preview: 'globe' },
  { title: 'Clock', value: 'Clock', preview: 'clock' },
]

export const resolveIconPreview = (options: SiteIconOption[], value?: string) =>
  options.find(option => option.value === value)?.preview ?? options[0]?.preview ?? 'circle-help'
