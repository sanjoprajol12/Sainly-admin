<script setup lang="ts">
import ProjectForm from './ProjectForm.vue'
import ProjectService from '@/services/project/ProjectService'
import type { ProjectView } from '@/types/project/Project'
import { resolveAssetUrl } from '@/utils/assetUrl'

const projectService = new ProjectService()

const $confirm = useConfirm()

const isDrawerVisible = ref(false)
const projectFormRef = ref()

const isLoading = ref(false)
const projectList = ref<ProjectView[]>([])

const projectsMetaFields = [
  { key: 'eyebrow', label: 'Eyebrow' },
  { key: 'heading', label: 'Heading' },
  { key: 'subtext', label: 'Subtext', multiline: true },
  { key: 'cta_label', label: 'Card call-to-action label' },
  { key: 'banner_heading', label: 'Bottom banner heading' },
  { key: 'banner_subtext', label: 'Bottom banner text', multiline: true },
  { key: 'banner_button_text', label: 'Bottom banner button text' },
]

const tableHeaders = [
  { title: 'Project', label: 'title' },
  { title: 'Category', label: 'category' },
  { title: 'Technologies', label: 'technologies' },
  { title: 'Links', label: 'links' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

// Suggest categories already in use so projects stay consistently grouped
const categoryOptions = computed(() =>
  [...new Set(projectList.value.map(project => project.category).filter(Boolean))],
)

const getAllProjects = async () => {
  isLoading.value = true
  try {
    projectList.value = (await projectService.list()).sort(bySortOrder)
  }
  catch (error) {
    showError(error)
    projectList.value = []
  }
  finally {
    isLoading.value = false
  }
}

const handleSort = async (sorted: ProjectView[]) => {
  try {
    await projectService.sortItems(sorted.map(item => item.id))
    showSuccess('Projects sorted successfully')
  }
  catch (error) {
    showError(error)
    getAllProjects()
  }
}

const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editProject = (item: ProjectView) => {
  isDrawerVisible.value = true
  nextTick(() => projectFormRef.value?.edit(item))
}

const deleteProject = (item: ProjectView) => {
  $confirm?.({
    message: `Delete the "${item.title}" project? Its case-study page will stop working.`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await projectService.destroy(item.id)
        showSuccess('Project deleted successfully')
        getAllProjects()
      }
      catch (error) {
        showError(error)
      }
    },
  })
}

onMounted(() => getAllProjects())
</script>

<template>
  <section>
    <SectionMetaCard
      resource="projects-meta"
      title="Work section heading"
      :fields="projectsMetaFields"
    />

    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Projects"
        icon="folder-git-2"
      >
        <template #subtitle>
          Portfolio work and case studies. Drag rows to reorder.
        </template>
        <template #actions>
          <VBtn @click="openAddDrawer">
            <VIcon
              start
              icon="plus"
            />
            Add project
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="projectList"
        :loading="isLoading"
        :paginate="false"
        empty-table-text="No projects yet"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #title="{ row: item }">
          <div
            class="d-flex align-center gap-3 cursor-pointer"
            @click="editProject(item)"
          >
            <VIcon
              size="small"
              icon="grip-vertical"
              class="text-disabled"
            />
            <VAvatar
              rounded
              size="48"
              variant="tonal"
              color="secondary"
            >
              <VImg
                v-if="item.image"
                :src="resolveAssetUrl(item.image)"
                cover
              />
              <VIcon
                v-else
                icon="image"
              />
            </VAvatar>
            <div>
              <div class="title-hover font-weight-medium">
                {{ item.title }}
              </div>
              <div class="text-caption text-disabled">
                /work/{{ item.slug }}
              </div>
            </div>
          </div>
        </template>

        <template #category="{ row: item }">
          {{ item.category || '-' }}
        </template>

        <template #technologies="{ row: item }">
          <div class="d-flex flex-wrap gap-1">
            <VChip
              v-for="tech in item.technologies"
              :key="tech"
              size="x-small"
              variant="tonal"
            >
              {{ tech }}
            </VChip>
          </div>
        </template>

        <template #links="{ row: item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="item.liveUrl"
              size="small"
              :href="item.liveUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <VIcon icon="external-link" />
              <VTooltip activator="parent">
                Live site
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="item.githubUrl"
              size="small"
              :href="item.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <VIcon icon="github" />
              <VTooltip activator="parent">
                Repository
              </VTooltip>
            </IconBtn>
            <span v-if="!item.liveUrl && !item.githubUrl">-</span>
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
                  @click="editProject(item)"
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
                  @click="deleteProject(item)"
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

    <ProjectForm
      ref="projectFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      :category-options="categoryOptions"
      @refresh="getAllProjects"
    />
  </section>
</template>
