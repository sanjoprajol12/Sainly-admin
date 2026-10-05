export interface WhySainlyItem {
  id: string
  title: string
  description: string
}

export interface WhySainly {
  eyebrow?: string
  heading?: string
  subtext?: string
  items: WhySainlyItem[]
}
