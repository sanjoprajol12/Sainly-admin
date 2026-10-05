import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseWithData } from '@/types/APIResponse'

/**
 * Website sections stored as a single document (or a whole array) that is
 * read with GET and replaced/merged with PUT, e.g. `hero`, `about`, `trust-strip`.
 */
export default class ContentSectionService<T> extends BaseAPIService {
  constructor(resource: string) {
    super(resource)
  }

  async show() {
    return this.get<T>()
  }

  async update(data: T) {
    return this.put<APIResponseWithData<T>>(data)
  }
}
