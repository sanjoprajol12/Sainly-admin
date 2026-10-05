import CrudAPIService from '@/services/CrudAPIService'
import type { Review, ReviewView } from '@/types/review/Review'

export default class ReviewService extends CrudAPIService<Review, ReviewView> {
  constructor() {
    super('reviews')
  }
}
