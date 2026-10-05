<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import ProjectService from '@/services/project/ProjectService'
import type { Project, ProjectView } from '@/types/project/Project'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

interface Props {
  isDrawerOpen: boolean
  categoryOptions?: string[]
}
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  categoryOptions: () => [],
})

const emit = defineEmits<Emit>()

const projectService = new ProjectService()

const isEditMode = ref(false)
const isSaving = ref(false)
const currentProjectId = ref<string | null>(null)

const defaultCategories = ['Business website', 'E-commerce', 'Web application', 'Admin Dashboard', 'Landing page']

const categoryItems = computed(() => [...new Set([...props.categoryOptions, ...defaultCategories])])

const defaultForm = (): Project => ({
  title: '',
  slug: '',
  category: '',
  description: '',
  image: '',
  technologies: [],
  liveUrl: '',
  githubUrl: '',
  challenge: '',
  solution: '',
  features: [],
})

const projectFormData = reactive<Project>(defaultForm())

const optionalUrl = rules.custom(
  (value: string) => !value || /^https?:\/\/\S+$/i.test(value),
  'Enter a full URL starting with http:// or https://',
)

const formValidationRules = {
  title: { required: rules.required },
  category: { required: rules.required },
  description: { required: rules.required },
  liveUrl: { optionalUrl },
  githubUrl: { optionalUrl },
}

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, projectFormData)

const resetForm = () => {
  Object.assign(projectFormData, defaultForm())
  nextTick(() => resetValidation())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const cleanList = (list: string[]) => list.map(item => item.trim()).filter(Boolean)

const buildPayload = (): Partial<Project> => ({
  ...projectFormData,
  title: projectFormData.title.trim(),
  slug: projectFormData.slug.trim(),
  technologies: cleanList(projectFormData.technologies),
  features: cleanList(projectFormData.features),
})

const handleSubmitProject = async () => {
  touch()

  if (hasError.value) return

  try {
    isSaving.value = true

    const payload = buildPayload()

    // An empty slug lets the API derive one from the title
    if (!payload.slug)
      delete payload.slug

    if (isEditMode.value && currentProjectId.value) {
      await projectService.update(currentProjectId.value, payload)
      showSuccess('Project updated successfully')
    }
    else {
      await projectService.store(payload)
      showSuccess('Project created successfully')
    }
    emit('refresh')
    closeDrawer()
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}

const editProjectData = (val: ProjectView) => {
  isEditMode.value = true
  currentProjectId.value = val.id

  Object.assign(projectFormData, {
    title: val.title ?? '',
    slug: val.slug ?? '',
    category: val.category ?? '',
    description: val.description ?? '',
    image: val.image ?? '',
    technologies: [...(val.technologies ?? [])],
    liveUrl: val.liveUrl ?? '',
    githubUrl: val.githubUrl ?? '',
    challenge: val.challenge ?? '',
    solution: val.solution ?? '',
    features: [...(val.features ?? [])],
  })
}

defineExpose({ edit: editProjectData })

// Start every opening from a clean form; edit() fills it in right after (parents call it on nextTick).
// Resetting on open rather than on a timer after close means a quick close-then-reopen can't wipe the new data.
watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      isEditMode.value = false
      currentProjectId.value = null
      resetForm()
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="760"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="folder-git-2"
      subtitle="Portfolio card and case-study page"
      :title="isEditMode ? 'Edit project' : 'Add project'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <PerfectScrollbar
      :options="{ wheelPropagation: false }"
      class="h-100"
    >
      <VCard flat>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <SectionLabel
                title="Overview"
                icon="file-text"
              />
            </VCol>

            <!-- Title -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="projectFormData.title"
                :error-messages="validationErrors('title')"
                @input="touchField('title')"
              >
                <template #label>
                  Title <span class="text-red">*</span>
                </template>
              </VTextField>
            </VCol>

            <!-- Slug -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="projectFormData.slug"
                label="URL slug"
                placeholder="Generated from the title when empty"
                prefix="/work/"
              />
            </VCol>

            <!-- Category -->
            <VCol cols="12">
              <VCombobox
                v-model="projectFormData.category"
                :items="categoryItems"
                :error-messages="validationErrors('category')"
                @update:model-value="touchField('category')"
              >
                <template #label>
                  Category <span class="text-red">*</span>
                </template>
              </VCombobox>
            </VCol>

            <!-- Description -->
            <VCol cols="12">
              <VTextarea
                v-model="projectFormData.description"
                rows="3"
                auto-grow
                :error-messages="validationErrors('description')"
                @input="touchField('description')"
              >
                <template #label>
                  Short description <span class="text-red">*</span>
                </template>
              </VTextarea>
            </VCol>

            <!-- Image -->
            <VCol cols="12">
              <ImageUploadField
                v-model="projectFormData.image"
                label="Cover image"
                hint="Screenshot shown on the project card and case-study page"
                :preview-size="96"
              />
            </VCol>

            <!-- Technologies -->
            <VCol cols="12">
              <VCombobox
                v-model="projectFormData.technologies"
                label="Technologies"
                placeholder="Type and press Enter to add"
                chips
                multiple
                closable-chips
                clearable
              />
            </VCol>

            <!-- Links -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="projectFormData.liveUrl"
                label="Live site URL"
                placeholder="https://"
                prepend-inner-icon="globe"
                :error-messages="validationErrors('liveUrl')"
                @input="touchField('liveUrl')"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="projectFormData.githubUrl"
                label="Repository URL"
                placeholder="https://github.com/..."
                prepend-inner-icon="github"
                :error-messages="validationErrors('githubUrl')"
                @input="touchField('githubUrl')"
              />
            </VCol>

            <VCol cols="12">
              <SectionLabel
                title="Case study"
                icon="lightbulb"
              />
            </VCol>

            <!-- Challenge -->
            <VCol cols="12">
              <VTextarea
                v-model="projectFormData.challenge"
                label="The challenge"
                rows="3"
                auto-grow
              />
            </VCol>

            <!-- Solution -->
            <VCol cols="12">
              <VTextarea
                v-model="projectFormData.solution"
                label="Our solution"
                rows="3"
                auto-grow
              />
            </VCol>

            <!-- Features -->
            <VCol cols="12">
              <VCombobox
                v-model="projectFormData.features"
                label="Key features"
                placeholder="Type a feature and press Enter"
                chips
                multiple
                closable-chips
                clearable
              />
            </VCol>

            <!-- Actions -->
            <VCol
              cols="12"
              class="d-flex justify-end gap-3"
            >
              <VBtn
                variant="text"
                color="secondary"
                prepend-icon="x"
                :disabled="isSaving"
                @click="closeDrawer"
              >
                Cancel
              </VBtn>
              <VBtn
                :loading="isSaving"
                prepend-icon="save"
                @click="handleSubmitProject"
              >
                {{ isEditMode ? 'Update' : 'Save' }}
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
