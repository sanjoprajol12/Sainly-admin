import CrudAPIService from '@/services/CrudAPIService'
import type { Faq, FaqView } from '@/types/faq/Faq'

export default class FaqService extends CrudAPIService<Faq, FaqView> {
  constructor() {
    super('faq')
  }
}
