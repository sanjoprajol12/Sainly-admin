import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseSuccess, APIResponseWithData } from '@/types/APIResponse'

/**
 * Shared CRUD + drag-sort calls for the API's array collections
 * (services, projects, faq, business-types, reviews).
 */
export default class CrudAPIService<TPayload, TView> extends BaseAPIService {
  async list() {
    return this.get<TView[]>()
  }

  async store(data: Partial<TPayload>) {
    return this.post<TView>(data)
  }

  async update(id: string, data: Partial<TPayload>) {
    return this.put<TView>(data, encodeURIComponent(id))
  }

  async destroy(id: string) {
    return this.delete<APIResponseSuccess>(encodeURIComponent(id))
  }

  async sortItems(orderedIds: string[]) {
    return this.put<APIResponseWithData<TView[]>>({ orderedIds }, 'reorder')
  }
}
