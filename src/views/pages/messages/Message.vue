<script setup lang="ts">
import MessageService from '@/services/message/MessageService'
import type { MessageView } from '@/types/message/Message'
import { avatarText, formatDate } from '@/utils/formatters'

const messageService = new MessageService()

const $confirm = useConfirm()
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const messageList = ref<MessageView[]>([])
const page = ref(1)
const itemsPerPage = ref(10)

const isDetailVisible = ref(false)
const selectedMessage = ref<MessageView | null>(null)

const searchQuery = reactive({
  keyword: '',
  status: null as 'unread' | 'read' | null,
})

const statusOptions = [
  { title: 'Unread', value: 'unread' },
  { title: 'Read', value: 'read' },
]

const tableHeaders = [
  { title: 'From', label: 'name' },
  { title: 'Business type', label: 'businessType' },
  { title: 'Message', label: 'message' },
  { title: 'Received', label: 'createdAt' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const dateTimeFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }

const unreadCount = computed(() => messageList.value.filter(message => !message.read).length)

const filteredMessages = computed(() => {
  const keyword = searchQuery.keyword?.trim().toLowerCase()

  return messageList.value.filter(message => {
    if (searchQuery.status === 'unread' && message.read) return false
    if (searchQuery.status === 'read' && !message.read) return false
    if (!keyword) return true

    return [message.name, message.email, message.message, message.businessType]
      .some(value => value?.toLowerCase().includes(keyword))
  })
})

// The API returns the whole inbox, so pagination happens client-side
const pagedMessages = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value

  return filteredMessages.value.slice(start, start + itemsPerPage.value)
})

watch(() => [searchQuery.keyword, searchQuery.status], () => {
  page.value = 1
})

// Deleting the last message on the last page would otherwise leave an empty page
watch(() => filteredMessages.value.length, (total: number) => {
  const lastPage = Math.max(1, Math.ceil(total / itemsPerPage.value))

  if (page.value > lastPage)
    page.value = lastPage
})

const getAllMessages = async () => {
  isLoading.value = true
  try {
    const list = await messageService.list()

    messageList.value = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  catch (error) {
    showError(error)
    messageList.value = []
  }
  finally {
    isLoading.value = false
  }
}

const handlePageChange = (p: number) => {
  page.value = p
}

const handleItemsPerPageChange = (perPage: number) => {
  itemsPerPage.value = perPage
  page.value = 1
}

const setReadState = async (item: MessageView, read: boolean) => {
  if (item.read === read) return

  try {
    if (read)
      await messageService.markRead(item.id)
    else
      await messageService.markUnread(item.id)
    item.read = read
  }
  catch (error) {
    showError(error)
  }
}

const openMessage = (item: MessageView) => {
  selectedMessage.value = item
  isDetailVisible.value = true
  setReadState(item, true)
}

const replyLink = (item: MessageView) =>
  `mailto:${item.email}?subject=${encodeURIComponent('Re: Your enquiry to Sainly Studio')}`

const deleteMessage = (item: MessageView) => {
  $confirm?.({
    message: `Delete the message from ${item.name}? This cannot be undone.`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await messageService.destroy(item.id)
        showSuccess('Message deleted successfully')
        if (selectedMessage.value?.id === item.id)
          isDetailVisible.value = false
        messageList.value = messageList.value.filter(message => message.id !== item.id)
      }
      catch (error) {
        showError(error)
      }
    },
  })
}

// Deep link from the dashboard / navbar: /messages?id=<message id>
const openFromQuery = () => {
  const id = route.query.id
  if (typeof id !== 'string') return

  const message = messageList.value.find(item => item.id === id)
  if (message) openMessage(message)
}

watch(isDetailVisible, (visible: boolean) => {
  if (!visible && route.query.id)
    router.replace({ query: {} })
})

watch(() => route.query.id, openFromQuery)

onMounted(async () => {
  await getAllMessages()
  openFromQuery()
})
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Messages"
        icon="mail"
      >
        <template #badge>
          <VChip
            v-if="unreadCount"
            size="small"
            color="error"
          >
            {{ unreadCount }} unread
          </VChip>
        </template>
        <template #subtitle>
          Enquiries sent through the website's contact form.
        </template>
        <template #actions>
          <VBtn
            variant="outlined"
            color="secondary"
            :loading="isLoading"
            @click="getAllMessages"
          >
            <VIcon
              start
              icon="refresh-cw"
            />
            Refresh
          </VBtn>
        </template>
      </PageHeader>

      <!-- Filters -->
      <VCardText>
        <VRow align="center">
          <VCol
            cols="12"
            md="8"
          >
            <VTextField
              v-model="searchQuery.keyword"
              label="Search by name, email or message"
              prepend-inner-icon="search"
              clearable
              clear-icon="x"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VSelect
              v-model="searchQuery.status"
              label="Status"
              :items="statusOptions"
              clearable
              clear-icon="x"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="pagedMessages"
        :loading="isLoading"
        paginate
        :current-page="page"
        :items-per-page="itemsPerPage"
        :total="filteredMessages.length"
        items-per-page-dropdown-enabled
        empty-table-text="No messages found"
        @page-change="handlePageChange"
        @on-items-per-page-change="handleItemsPerPageChange"
      >
        <template #name="{ row: item }">
          <div
            class="d-flex align-center gap-3 cursor-pointer"
            @click="openMessage(item)"
          >
            <VBadge
              dot
              color="error"
              :model-value="!item.read"
              location="top start"
            >
              <VAvatar
                color="primary"
                variant="tonal"
                size="38"
              >
                {{ avatarText(item.name) }}
              </VAvatar>
            </VBadge>
            <div>
              <div
                class="title-hover"
                :class="{ 'font-weight-bold': !item.read }"
              >
                {{ item.name }}
              </div>
              <div class="text-caption text-disabled">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <template #businessType="{ row: item }">
          {{ item.businessType || '-' }}
        </template>

        <template #message="{ row: item }">
          <div
            class="text-truncate-2 text-body-2"
            :class="{ 'text-high-emphasis': !item.read }"
          >
            {{ item.message }}
          </div>
        </template>

        <template #createdAt="{ row: item }">
          <span class="text-no-wrap">{{ item.createdAt ? formatDate(item.createdAt, dateTimeFormat) : '-' }}</span>
        </template>

        <template #actions="{ row: item }">
          <IconBtn
            size="small"
            color="medium-emphasis"
          >
            <VIcon
              size="24"
              icon="ellipsis"
            />
            <VMenu activator="parent">
              <VList>
                <VListItem
                  link
                  @click="openMessage(item)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      icon="eye"
                    />
                  </template>
                  <VListItemTitle>View</VListItemTitle>
                </VListItem>

                <VListItem
                  link
                  @click="setReadState(item, !item.read)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      :icon="item.read ? 'mail' : 'mail-open'"
                    />
                  </template>
                  <VListItemTitle>{{ item.read ? 'Mark as unread' : 'Mark as read' }}</VListItemTitle>
                </VListItem>

                <VListItem
                  link
                  :href="replyLink(item)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      icon="reply"
                    />
                  </template>
                  <VListItemTitle>Reply by email</VListItemTitle>
                </VListItem>

                <VListItem
                  link
                  @click="deleteMessage(item)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      color="error"
                      icon="trash-2"
                    />
                  </template>
                  <VListItemTitle class="text-error">
                    Delete
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </IconBtn>
        </template>
      </CustomTable>
    </VCard>

    <!-- Message detail -->
    <VDialog
      v-model="isDetailVisible"
      max-width="640"
    >
      <VCard v-if="selectedMessage">
        <DrawerHeaderSection
          :title="selectedMessage.name"
          @cancel="isDetailVisible = false"
        />
        <VDivider />
        <VCardText>
          <VList
            density="compact"
            class="mb-4 pa-0"
          >
            <VListItem
              prepend-icon="mail"
              :title="selectedMessage.email"
              :href="replyLink(selectedMessage)"
            />
            <VListItem
              prepend-icon="tag"
              :title="selectedMessage.businessType || 'Not specified'"
            />
            <VListItem
              prepend-icon="clock"
              :title="selectedMessage.createdAt ? formatDate(selectedMessage.createdAt, dateTimeFormat) : '-'"
            />
          </VList>
          <div class="message-body text-body-1 text-high-emphasis pa-4 rounded">
            {{ selectedMessage.message }}
          </div>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4 flex-wrap gap-2">
          <VBtn
            color="error"
            variant="text"
            prepend-icon="trash-2"
            @click="deleteMessage(selectedMessage)"
          >
            Delete
          </VBtn>
          <VSpacer />
          <VBtn
            variant="outlined"
            color="secondary"
            @click="setReadState(selectedMessage, false); isDetailVisible = false"
          >
            Mark as unread
          </VBtn>
          <VBtn
            variant="elevated"
            prepend-icon="reply"
            :href="replyLink(selectedMessage)"
          >
            Reply
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </section>
</template>

<style scoped>
.message-body {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
