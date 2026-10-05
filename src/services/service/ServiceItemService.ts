import CrudAPIService from '@/services/CrudAPIService'
import type { ServiceItem, ServiceItemView } from '@/types/service/ServiceItem'

export default class ServiceItemService extends CrudAPIService<ServiceItem, ServiceItemView> {
  constructor() {
    super('services')
  }
}
