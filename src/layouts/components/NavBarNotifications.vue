<script lang="ts" setup>
import MessageService from '@/services/message/MessageService'
import type { MessageView } from '@/types/message/Message'
import type { Notification } from '@/types/layouts'
import { formatDateToMonthShort } from '@/utils/formatters'

const messageService = new MessageService()
const router = useRouter()
const route = useRoute()

const MAX_ITEMS = 8

const messages = ref<MessageView[]>([])
const hiddenIds = ref<string[]>([])

// Newest contact-form messages, shown as notifications in the navbar
const notifications = computed<Notification[]>(() =>
  messages.value
    .filter(message => !hiddenIds.value.includes(message.id))
    .slice(0, MAX_ITEMS)
    .map(message => ({
      id: message.id,
      text: message.name,
      title: message.name,
      subtitle: (message.message ?? '').length > 70 ? `${message.message.slice(0, 70)}…` : (message.message ?? ''),
      time: message.createdAt ? formatDateToMonthShort(message.createdAt) : '',
      isSeen: message.read,
      color: 'primary',
    })),
)

const getMessages = async () => {
  try {
    const list = await messageService.list()

    messages.value = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  catch {
    // Navbar badge is best-effort; the Messages page reports errors.
  }
}

const setRead = async (ids: Notification['id'][], read: boolean) => {
  const targets = messages.value.filter(message => ids.includes(message.id) && message.read !== read)

  try {
    await Promise.all(targets.map(message =>
      read ? messageService.markRead(message.id) : messageService.markUnread(message.id),
    ))
    targets.forEach(message => { message.read = read })
  }
  catch (error) {
    showError(error)
  }
}

const removeNotification = (id: Notification['id']) => {
  hiddenIds.value.push(String(id))
}

const handleNotificationClick = (notification: Notification) => {
  router.push({ name: 'messages', query: { id: String(notification.id) } })
}

// Refresh after navigating so the badge reflects changes made on the Messages page
watch(() => route.fullPath, getMessages)
onMounted(getMessages)
</script>

<template>
  <Notifications
    :notifications="notifications"
    title="Messages"
    empty-text="No messages yet"
    view-all-text="View all messages"
    @remove="removeNotification"
    @read="ids => setRead(ids, true)"
    @unread="ids => setRead(ids, false)"
    @click:notification="handleNotificationClick"
    @view-all="router.push({ name: 'messages' })"
  />
</template>
