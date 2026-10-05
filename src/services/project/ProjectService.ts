import CrudAPIService from '@/services/CrudAPIService'
import type { Project, ProjectView } from '@/types/project/Project'

export default class ProjectService extends CrudAPIService<Project, ProjectView> {
  constructor() {
    super('projects')
  }
}
