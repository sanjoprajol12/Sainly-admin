import BaseAPIService from '@/services/BaseAPIService'
import type { UploadResponse } from '@/types/upload/Upload'

export default class UploadService extends BaseAPIService {
  constructor() {
    super('upload')
  }

  async upload(file: File) {
    const formData = new FormData()

    formData.append('file', file, file.name)

    return this.post<UploadResponse>(formData)
  }
}
