export interface ServiceItem {
  title: string
  description: string
  icon: string
  badge: string
}

export interface ServiceItemView extends ServiceItem {
  id: string
  sort_order: number
}
