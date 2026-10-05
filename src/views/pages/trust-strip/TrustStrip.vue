<script setup lang="ts">
import TrustStripForm from './TrustStripForm.vue'
import ContentSectionService from '@/services/content/ContentSectionService'
import type { TrustStripItem } from '@/types/content/TrustStrip'
import { TRUST_STRIP_ICONS, resolveIconPreview } from '@/constants/siteIcons'

// The trust strip is stored as one array; every change saves the whole list.
const trustStripService = new ContentSectionService<TrustStripItem[]>('trust-strip')

const $confirm = useConfirm()

const isDrawerVisible = ref(false)
const trustStripFormRef = ref()

const isLoading = ref(false)
const trustStripList = ref<TrustStripItem[]>([])
const hasLoaded = ref(false)

const tableHeaders = [
  { title: 'Title', label: 'title' },
  { title: 'Icon', label: 'icon' },
  { title: 'Description', label: 'desc' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const getTrustStrip = async () => {
  isLoading.value = true
  try {
    const data = await trustStripService.show()

    trustStripList.value = (Array.isArray(data) ? data : []).map(item => ({ ...item, id: item.id || generateId() }))
    hasLoaded.value = true
  }
  catch (error) {
    showError(error)
    trustStripList.value = []
  }
  finally {
    isLoading.value = false
  }
}

const persist = async (items: TrustStripItem[], message: string) => {
  // The whole list is replaced on save; saving after a failed load would wipe what is stored
  if (!hasLoaded.value) {
    showErrorMsg('The current list could not be loaded, so nothing was saved. Refresh the page and try again.')

    return false
  }

  try {
    await trustStripService.update(items)
    trustStripList.value = items
    showSuccess(message)

    return true
  }
  catch (error) {
    showError(error)
    getTrustStrip()

    return false
  }
}

const handleSort = (sorted: TrustStripItem[]) => persist([...sorted], 'Trust strip sorted successfully')

const handleSaveItem = async (item: TrustStripItem) => {
  const exists = trustStripList.value.some(existing => existing.id === item.id)

  const items = exists
    ? trustStripList.value.map(existing => (existing.id === item.id ? item : existing))
    : [...trustStripList.value, item]

  if (await persist(items, exists ? 'Item updated successfully' : 'Item added successfully'))
    isDrawerVisible.value = false
}

const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editTrustItem = (item: TrustStripItem) => {
  isDrawerVisible.value = true
  nextTick(() => trustStripFormRef.value?.edit(item))
}

const deleteTrustItem = (item: TrustStripItem) => {
  $confirm?.({
    message: `Remove "${item.title}" from the trust strip?`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      await persist(trustStripList.value.filter(existing => existing.id !== item.id), 'Item removed successfully')
    },
  })
}

onMounted(getTrustStrip)
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Trust strip"
        icon="shield-check"
      >
        <template #subtitle>
          Short selling points shown under the hero. Drag rows to reorder.
        </template>
        <template #actions>
          <VBtn @click="openAddDrawer">
            <VIcon
              start
              icon="plus"
            />
            Add item
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="trustStripList"
        :loading="isLoading"
        :paginate="false"
        empty-table-text="No items yet"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #title="{ row: item }">
          <span
            class="cursor-pointer title-hover"
            @click="editTrustItem(item)"
          >
            <VIcon
              size="small"
              icon="grip-vertical"
            />
            {{ item.title }}
          </span>
        </template>

        <template #icon="{ row: item }">
          <div class="d-flex align-center gap-2">
            <VIcon :icon="resolveIconPreview(TRUST_STRIP_ICONS, item.icon)" />
            <span class="text-body-2">{{ item.icon }}</span>
          </div>
        </template>

        <template #desc="{ row: item }">
          <div class="text-truncate-2 text-body-2">
            {{ item.desc || '-' }}
          </div>
        </template>

        <template #actions="{ row: item }">
          <div class="d-flex justify-center gap-1">
            <IconBtn
              size="small"
              @click="editTrustItem(item)"
            >
              <VIcon icon="pencil" />
            </IconBtn>
            <IconBtn
              size="small"
              color="error"
              @click="deleteTrustItem(item)"
            >
              <VIcon icon="trash-2" />
            </IconBtn>
          </div>
        </template>
      </CustomTable>
    </VCard>

    <TrustStripForm
      ref="trustStripFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @save="handleSaveItem"
    />
  </section>
</template>
