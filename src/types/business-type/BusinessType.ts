export interface BusinessType {
  name: string
}

export interface BusinessTypeView extends BusinessType {
  id: string
  sort_order: number
}
