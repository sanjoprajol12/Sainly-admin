import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseSuccess } from '@/types/APIResponse'
import type { AdminUser, AdminUserView } from '@/types/admin-user/AdminUser'

export default class AdminUserService extends BaseAPIService {
  constructor() {
    super('admin/users')
  }

  async list() {
    return this.get<AdminUserView[]>()
  }

  async store(data: AdminUser) {
    return this.post<AdminUserView>(data)
  }

  async update(id: string, data: Partial<AdminUser>) {
    return this.put<AdminUserView>(data, encodeURIComponent(id))
  }

  async destroy(id: string) {
    return this.delete<APIResponseSuccess>(encodeURIComponent(id))
  }
}
