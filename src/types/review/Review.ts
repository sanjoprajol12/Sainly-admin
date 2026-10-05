export interface Review {
  name: string
  company: string
  role: string
  avatar: string
  rating: number
  review: string
  project: string
  featured: boolean
  published: boolean
}

export interface ReviewView extends Review {
  id: string
  sort_order: number
  createdAt: string
}
