<script setup lang="ts">
import FaqForm from './FaqForm.vue'
import FaqService from '@/services/faq/FaqService'
import type { FaqView } from '@/types/faq/Faq'

const faqService = new FaqService()

const $confirm = useConfirm()

const isDrawerVisible = ref(false)
const faqFormRef = ref()

const isLoading = ref(false)
const faqList = ref<FaqView[]>([])

const faqMetaFields = [
  { key: 'eyebrow', label: 'Eyebrow' },
  { key: 'heading', label: 'Heading' },
  { key: 'subtext', label: 'Subtext', multiline: true },
  { key: 'extra_text', label: 'Footer text (e.g. "Have a different question?")' },
  { key: 'extra_cta', label: 'Footer link text' },
]

const tableHeaders = [
  { title: 'Question', label: 'question' },
  { title: 'Answer', label: 'answer' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const getAllFaqs = async () => {
  isLoading.value = true
  try {
    faqList.value = (await faqService.list()).sort(bySortOrder)
  }
  catch (error) {
    showError(error)
    faqList.value = []
  }
  finally {
    isLoading.value = false
  }
}

// ========================================
// Table Event Handlers
// ========================================
const handleSort = async (sorted: FaqView[]) => {
  try {
    await faqService.sortItems(sorted.map(item => item.id))
    showSuccess('FAQs sorted successfully')
  }
  catch (error) {
    showError(error)
    getAllFaqs()
  }
}

// ========================================
// CRUD Handlers
// ========================================
const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editFaqItem = (item: FaqView) => {
  isDrawerVisible.value = true
  nextTick(() => faqFormRef.value?.edit(item))
}

const deleteFaqItem = (id: string) => {
  $confirm?.({
    message: 'Are you sure you want to delete this FAQ?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await faqService.destroy(id)
        showSuccess('FAQ deleted successfully')
        getAllFaqs()
      }
      catch (error) {
        showError(error)
      }
    },
  })
}

// ========================================
// Lifecycle
// ========================================
onMounted(() => getAllFaqs())
</script>

<template>
  <section>
    <SectionMetaCard
      resource="faq-meta"
      title="FAQ section heading"
      :fields="faqMetaFields"
    />

    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="FAQs"
        icon="message-circle-question"
      >
        <template #subtitle>
          Drag rows to change the order shown on the website.
        </template>
        <template #actions>
          <VBtn @click="openAddDrawer">
            <VIcon
              start
              icon="plus"
            />
            Add FAQ
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <!-- Table -->
      <CustomTable
        :header="tableHeaders"
        :data="faqList"
        :loading="isLoading"
        :paginate="false"
        empty-table-text="No FAQs yet"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #question="{ row: item }">
          <span
            class="cursor-pointer title-hover"
            @click="editFaqItem(item)"
          >
            <VIcon
              size="small"
              icon="grip-vertical"
            />
            {{ item.question }}
          </span>
        </template>

        <template #answer="{ row: item }">
          <div class="text-truncate-2 text-body-2">
            {{ item.answer || '-' }}
          </div>
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
                  @click="editFaqItem(item)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      icon="pencil"
                    />
                  </template>
                  <VListItemTitle>Edit</VListItemTitle>
                </VListItem>

                <VListItem
                  link
                  @click="deleteFaqItem(item.id)"
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

    <FaqForm
      ref="faqFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllFaqs"
    />
  </section>
</template>
