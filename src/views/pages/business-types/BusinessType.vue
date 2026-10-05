<script setup lang="ts">
import BusinessTypeForm from './BusinessTypeForm.vue'
import BusinessTypeService from '@/services/business-type/BusinessTypeService'
import type { BusinessTypeView } from '@/types/business-type/BusinessType'

const businessTypeService = new BusinessTypeService()

const $confirm = useConfirm()

const isDrawerVisible = ref(false)
const businessTypeFormRef = ref()

const isLoading = ref(false)
const businessTypeList = ref<BusinessTypeView[]>([])

const tableHeaders = [
  { title: 'Business type', label: 'name' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const getAllBusinessTypes = async () => {
  isLoading.value = true
  try {
    businessTypeList.value = (await businessTypeService.list()).sort(bySortOrder)
  }
  catch (error) {
    showError(error)
    businessTypeList.value = []
  }
  finally {
    isLoading.value = false
  }
}

const handleSort = async (sorted: BusinessTypeView[]) => {
  try {
    await businessTypeService.sortItems(sorted.map(item => item.id))
    showSuccess('Business types sorted successfully')
  }
  catch (error) {
    showError(error)
    getAllBusinessTypes()
  }
}

const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editBusinessType = (item: BusinessTypeView) => {
  isDrawerVisible.value = true
  nextTick(() => businessTypeFormRef.value?.edit(item))
}

const deleteBusinessType = (item: BusinessTypeView) => {
  $confirm?.({
    message: `Delete "${item.name}"?`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await businessTypeService.destroy(item.id)
        showSuccess('Business type deleted successfully')
        getAllBusinessTypes()
      }
      catch (error) {
        showError(error)
      }
    },
  })
}

onMounted(() => getAllBusinessTypes())
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Business types"
        icon="tag"
      >
        <template #subtitle>
          Options in the contact form's "Business type" dropdown. Drag rows to reorder.
        </template>
        <template #actions>
          <VBtn @click="openAddDrawer">
            <VIcon
              start
              icon="plus"
            />
            Add business type
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="businessTypeList"
        :loading="isLoading"
        :paginate="false"
        empty-table-text="No business types yet — the contact form dropdown stays empty until you add some"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #name="{ row: item }">
          <span
            class="cursor-pointer title-hover"
            @click="editBusinessType(item)"
          >
            <VIcon
              size="small"
              icon="grip-vertical"
            />
            {{ item.name }}
          </span>
        </template>

        <template #actions="{ row: item }">
          <div class="d-flex justify-center gap-1">
            <IconBtn
              size="small"
              @click="editBusinessType(item)"
            >
              <VIcon icon="pencil" />
            </IconBtn>
            <IconBtn
              size="small"
              color="error"
              @click="deleteBusinessType(item)"
            >
              <VIcon icon="trash-2" />
            </IconBtn>
          </div>
        </template>
      </CustomTable>
    </VCard>

    <BusinessTypeForm
      ref="businessTypeFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllBusinessTypes"
    />
  </section>
</template>
