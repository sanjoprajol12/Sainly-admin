import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseSuccess } from '@/types/APIResponse'
import type { MessageView } from '@/types/message/Message'

export default class MessageService extends BaseAPIService {
  constructor() {
    super('messages')
  }

  async list() {
    return this.get<MessageView[]>()
  }

  async markRead(id: string) {
    return this.patch<APIResponseSuccess>({}, `${encodeURIComponent(id)}/read`)
  }

  async markUnread(id: string) {
    return this.patch<APIResponseSuccess>({}, `${encodeURIComponent(id)}/unread`)
  }

  async destroy(id: string) {
    return this.delete<APIResponseSuccess>(encodeURIComponent(id))
  }
}
