<script setup lang="ts">
import WhySainlyItemForm from './WhySainlyItemForm.vue'
import ContentSectionService from '@/services/content/ContentSectionService'
import type { WhySainly, WhySainlyItem } from '@/types/content/WhySainly'

// Heading and reasons are stored as a single document; every change saves all of it.
const whySainlyService = new ContentSectionService<WhySainly>('why-sainly')

const $confirm = useConfirm()

const isDrawerVisible = ref(false)
const itemFormRef = ref()

const isLoading = ref(false)
const isSavingHeading = ref(false)

const headingFormData = reactive({ eyebrow: '', heading: '', subtext: '' })
const itemList = ref<WhySainlyItem[]>([])

// Fields of the stored document this page doesn't edit; sent back as-is because PUT replaces the document
const storedDoc = ref<Partial<WhySainly>>({})
const hasLoaded = ref(false)

const tableHeaders = [
  { title: 'Reason', label: 'title' },
  { title: 'Description', label: 'description' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const getWhySainly = async () => {
  isLoading.value = true
  try {
    const data = await whySainlyService.show() as WhySainly | WhySainlyItem[] | null

    // Older data stored only the list of reasons
    const doc: Partial<WhySainly> = Array.isArray(data) ? { items: data } : (data ?? {})

    Object.assign(headingFormData, {
      eyebrow: doc.eyebrow ?? '',
      heading: doc.heading ?? '',
      subtext: doc.subtext ?? '',
    })
    itemList.value = (doc.items ?? []).map(item => ({ ...item, id: item.id || generateId() }))
    storedDoc.value = doc
    hasLoaded.value = true
  }
  catch (error) {
    showError(error)
  }
  finally {
    isLoading.value = false
  }
}

const persist = async (items: WhySainlyItem[], message: string) => {
  // The whole list is replaced on save; saving after a failed load would wipe what is stored
  if (!hasLoaded.value) {
    showErrorMsg('The current list could not be loaded, so nothing was saved. Refresh the page and try again.')

    return false
  }

  try {
    await whySainlyService.update({ ...storedDoc.value, ...headingFormData, items })
    itemList.value = items
    showSuccess(message)

    return true
  }
  catch (error) {
    showError(error)

    return false
  }
}

const saveHeading = async () => {
  isSavingHeading.value = true
  await persist(itemList.value, 'Section heading saved')
  isSavingHeading.value = false
}

const handleSort = (sorted: WhySainlyItem[]) => persist([...sorted], 'Reasons sorted successfully')

const handleSaveItem = async (item: WhySainlyItem) => {
  const exists = itemList.value.some(existing => existing.id === item.id)

  const items = exists
    ? itemList.value.map(existing => (existing.id === item.id ? item : existing))
    : [...itemList.value, item]

  if (await persist(items, exists ? 'Reason updated successfully' : 'Reason added successfully'))
    isDrawerVisible.value = false
}

const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editItem = (item: WhySainlyItem) => {
  isDrawerVisible.value = true
  nextTick(() => itemFormRef.value?.edit(item))
}

const deleteItem = (item: WhySainlyItem) => {
  $confirm?.({
    message: `Remove "${item.title}"?`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      await persist(itemList.value.filter(existing => existing.id !== item.id), 'Reason removed successfully')
    },
  })
}

onMounted(getWhySainly)
</script>

<template>
  <section>
    <!-- Section heading -->
    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Why Sainly"
        icon="award"
      >
        <template #subtitle>
          The "Why businesses choose us" section.
        </template>
      </PageHeader>

      <VDivider />

      <VProgressLinear
        v-if="isLoading"
        indeterminate
      />

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="headingFormData.eyebrow"
              label="Eyebrow"
              placeholder="e.g. The Advantage"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="headingFormData.heading"
              label="Heading"
            />
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="headingFormData.subtext"
              label="Subtext"
              rows="2"
              auto-grow
            />
          </VCol>
          <VCol
            cols="12"
            class="d-flex justify-end"
          >
            <VBtn
              :loading="isSavingHeading"
              :disabled="isLoading"
              prepend-icon="save"
              @click="saveHeading"
            >
              Save heading
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Reasons -->
    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Reasons"
        icon="list-checks"
        size="small"
      >
        <template #subtitle>
          Drag rows to reorder.
        </template>
        <template #actions>
          <VBtn @click="openAddDrawer">
            <VIcon
              start
              icon="plus"
            />
            Add reason
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="itemList"
        :loading="isLoading"
        :paginate="false"
        empty-table-text="No reasons yet"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #title="{ row: item }">
          <span
            class="cursor-pointer title-hover"
            @click="editItem(item)"
          >
            <VIcon
              size="small"
              icon="grip-vertical"
            />
            {{ item.title }}
          </span>
        </template>

        <template #description="{ row: item }">
          <div class="text-truncate-2 text-body-2">
            {{ item.description || '-' }}
          </div>
        </template>

        <template #actions="{ row: item }">
          <div class="d-flex justify-center gap-1">
            <IconBtn
              size="small"
              @click="editItem(item)"
            >
              <VIcon icon="pencil" />
            </IconBtn>
            <IconBtn
              size="small"
              color="error"
              @click="deleteItem(item)"
            >
              <VIcon icon="trash-2" />
            </IconBtn>
          </div>
        </template>
      </CustomTable>
    </VCard>

    <WhySainlyItemForm
      ref="itemFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @save="handleSaveItem"
    />
  </section>
</template>
