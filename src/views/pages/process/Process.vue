<script setup lang="ts">
import ProcessStepForm from './ProcessStepForm.vue'
import ContentSectionService from '@/services/content/ContentSectionService'
import type { ProcessStep } from '@/types/content/Process'

// Steps carry no id in the API, so a client-only _key identifies rows while editing.
type ProcessStepRow = ProcessStep & { _key: string }

const processService = new ContentSectionService<ProcessStep[]>('process')

const $confirm = useConfirm()

const isDrawerVisible = ref(false)
const processFormRef = ref()

const isLoading = ref(false)
const stepList = ref<ProcessStepRow[]>([])
const hasLoaded = ref(false)

const tableHeaders = [
  { title: 'Step', label: 'step' },
  { title: 'Title', label: 'title' },
  { title: 'Description', label: 'description' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const toPayload = (rows: ProcessStepRow[]): ProcessStep[] =>
  rows.map(({ step, title, description }) => ({ step, title, description }))

// Keep "01, 02, 03…" numbering in sync with the order when steps use plain numbers
const renumber = (rows: ProcessStepRow[]) => {
  if (!rows.every(row => /^\d+$/.test(String(row.step).trim())))
    return rows

  return rows.map((row, index) => ({ ...row, step: String(index + 1).padStart(2, '0') }))
}

const nextStepNumber = computed(() => String(stepList.value.length + 1).padStart(2, '0'))

const getProcess = async () => {
  isLoading.value = true
  try {
    const data = await processService.show()

    stepList.value = (Array.isArray(data) ? data : []).map(step => ({ ...step, step: String(step.step ?? ''), _key: generateId() }))
    hasLoaded.value = true
  }
  catch (error) {
    showError(error)
    stepList.value = []
  }
  finally {
    isLoading.value = false
  }
}

const persist = async (rows: ProcessStepRow[], message: string) => {
  // The whole list is replaced on save; saving after a failed load would wipe what is stored
  if (!hasLoaded.value) {
    showErrorMsg('The current list could not be loaded, so nothing was saved. Refresh the page and try again.')

    return false
  }

  try {
    await processService.update(toPayload(rows))
    stepList.value = rows
    showSuccess(message)

    return true
  }
  catch (error) {
    showError(error)
    getProcess()

    return false
  }
}

const handleSort = (sorted: ProcessStepRow[]) => persist(renumber([...sorted]), 'Steps sorted successfully')

const handleSaveStep = async (row: ProcessStepRow) => {
  const exists = stepList.value.some(existing => existing._key === row._key)

  const rows = exists
    ? stepList.value.map(existing => (existing._key === row._key ? row : existing))
    : [...stepList.value, row]

  if (await persist(rows, exists ? 'Step updated successfully' : 'Step added successfully'))
    isDrawerVisible.value = false
}

const openAddDrawer = () => {
  isDrawerVisible.value = true
  nextTick(() => processFormRef.value?.create(nextStepNumber.value))
}

const editStep = (row: ProcessStepRow) => {
  isDrawerVisible.value = true
  nextTick(() => processFormRef.value?.edit(row))
}

const deleteStep = (row: ProcessStepRow) => {
  $confirm?.({
    message: `Remove the "${row.title}" step?`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      await persist(renumber(stepList.value.filter(existing => existing._key !== row._key)), 'Step removed successfully')
    },
  })
}

onMounted(getProcess)
</script>

<template>
  <section>
    <SectionMetaCard
      resource="process-meta"
      title="Process section heading"
    />

    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Process steps"
        icon="list-ordered"
      >
        <template #subtitle>
          How a project runs, step by step. Drag rows to reorder — numbered steps renumber automatically.
        </template>
        <template #actions>
          <VBtn @click="openAddDrawer">
            <VIcon
              start
              icon="plus"
            />
            Add step
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="stepList"
        :loading="isLoading"
        :paginate="false"
        checkbox-label="_key"
        empty-table-text="No steps yet"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #step="{ row: item }">
          <VChip
            color="primary"
            variant="tonal"
            size="small"
          >
            {{ item.step }}
          </VChip>
        </template>

        <template #title="{ row: item }">
          <span
            class="cursor-pointer title-hover"
            @click="editStep(item)"
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
              @click="editStep(item)"
            >
              <VIcon icon="pencil" />
            </IconBtn>
            <IconBtn
              size="small"
              color="error"
              @click="deleteStep(item)"
            >
              <VIcon icon="trash-2" />
            </IconBtn>
          </div>
        </template>
      </CustomTable>
    </VCard>

    <ProcessStepForm
      ref="processFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @save="handleSaveStep"
    />
  </section>
</template>
