import BaseAPIService from '@/services/BaseAPIService'
import type { DashboardStats } from '@/types/dashboard/DashboardStats'

export default class DashboardService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async getStats() {
    return this.get<DashboardStats>('dashboard')
  }
}
