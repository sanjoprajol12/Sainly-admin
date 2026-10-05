export interface Faq {
  question: string
  answer: string
}

export interface FaqView extends Faq {
  id: string
  sort_order: number
}
