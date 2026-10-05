<script setup lang="ts">
import ServiceItemForm from './ServiceItemForm.vue'
import ServiceItemService from '@/services/service/ServiceItemService'
import type { ServiceItemView } from '@/types/service/ServiceItem'
import { SERVICE_ICONS, resolveIconPreview } from '@/constants/siteIcons'

const serviceItemService = new ServiceItemService()

const $confirm = useConfirm()

const isDrawerVisible = ref(false)
const serviceFormRef = ref()

const isLoading = ref(false)
const serviceList = ref<ServiceItemView[]>([])

const tableHeaders = [
  { title: 'Title', label: 'title' },
  { title: 'Icon', label: 'icon' },
  { title: 'Badge', label: 'badge' },
  { title: 'Description', label: 'description' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const getAllServices = async () => {
  isLoading.value = true
  try {
    serviceList.value = (await serviceItemService.list()).sort(bySortOrder)
  }
  catch (error) {
    showError(error)
    serviceList.value = []
  }
  finally {
    isLoading.value = false
  }
}

// ========================================
// Table Event Handlers
// ========================================
const handleSort = async (sorted: ServiceItemView[]) => {
  try {
    await serviceItemService.sortItems(sorted.map(item => item.id))
    showSuccess('Services sorted successfully')
  }
  catch (error) {
    showError(error)
    getAllServices()
  }
}

// ========================================
// CRUD Handlers
// ========================================
const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editServiceItem = (item: ServiceItemView) => {
  isDrawerVisible.value = true
  nextTick(() => serviceFormRef.value?.edit(item))
}

const deleteServiceItem = (item: ServiceItemView) => {
  $confirm?.({
    message: `Delete the "${item.title}" service?`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await serviceItemService.destroy(item.id)
        showSuccess('Service deleted successfully')
        getAllServices()
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
onMounted(() => getAllServices())
</script>

<template>
  <section>
    <SectionMetaCard
      resource="services-meta"
      title="Services section heading"
    />

    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Services"
        icon="briefcase"
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
            Add service
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <!-- Table -->
      <CustomTable
        :header="tableHeaders"
        :data="serviceList"
        :loading="isLoading"
        :paginate="false"
        empty-table-text="No services yet"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #title="{ row: item }">
          <span
            class="cursor-pointer title-hover"
            @click="editServiceItem(item)"
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
            <VIcon :icon="resolveIconPreview(SERVICE_ICONS, item.icon)" />
            <span class="text-body-2">{{ item.icon }}</span>
          </div>
        </template>

        <template #badge="{ row: item }">
          <VChip
            v-if="item.badge"
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ item.badge }}
          </VChip>
          <span v-else>-</span>
        </template>

        <template #description="{ row: item }">
          <div class="text-truncate-2 text-body-2">
            {{ item.description || '-' }}
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
                  @click="editServiceItem(item)"
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
                  @click="deleteServiceItem(item)"
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

    <ServiceItemForm
      ref="serviceFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllServices"
    />
  </section>
</template>
