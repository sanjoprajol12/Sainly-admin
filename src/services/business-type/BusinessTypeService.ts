import CrudAPIService from '@/services/CrudAPIService'
import type { BusinessType, BusinessTypeView } from '@/types/business-type/BusinessType'

export default class BusinessTypeService extends CrudAPIService<BusinessType, BusinessTypeView> {
  constructor() {
    super('business-types')
  }
}
