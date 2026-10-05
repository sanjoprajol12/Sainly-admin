<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import ReviewService from '@/services/review/ReviewService'
import type { Review, ReviewView } from '@/types/review/Review'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const reviewService = new ReviewService()

const isEditMode = ref(false)
const isSaving = ref(false)
const currentReviewId = ref<string | null>(null)

const defaultForm = (): Review => ({
  name: '',
  company: '',
  role: '',
  avatar: '',
  rating: 5,
  review: '',
  project: '',
  featured: false,
  published: true,
})

const reviewFormData = reactive<Review>(defaultForm())

const formValidationRules = {
  name: { required: rules.required },
  review: { required: rules.required },
  rating: { between: rules.between(1, 5) },
}

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, reviewFormData)

const resetForm = () => {
  Object.assign(reviewFormData, defaultForm())
  nextTick(() => resetValidation())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const handleSubmitReview = async () => {
  touch()

  if (hasError.value) return

  try {
    isSaving.value = true

    const payload = { ...reviewFormData, rating: Number(reviewFormData.rating) || 5 }

    if (isEditMode.value && currentReviewId.value) {
      await reviewService.update(currentReviewId.value, payload)
      showSuccess('Review updated successfully')
    }
    else {
      await reviewService.store(payload)
      showSuccess('Review created successfully')
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

const editReviewData = (val: ReviewView) => {
  isEditMode.value = true
  currentReviewId.value = val.id

  Object.assign(reviewFormData, {
    name: val.name ?? '',
    company: val.company ?? '',
    role: val.role ?? '',
    avatar: val.avatar ?? '',
    rating: Number(val.rating) || 5,
    review: val.review ?? '',
    project: val.project ?? '',
    featured: Boolean(val.featured),
    published: Boolean(val.published),
  })
}

defineExpose({ edit: editReviewData })

// Start every opening from a clean form; edit() fills it in right after (parents call it on nextTick).
// Resetting on open rather than on a timer after close means a quick close-then-reopen can't wipe the new data.
watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      isEditMode.value = false
      currentReviewId.value = null
      resetForm()
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="640"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      icon="star"
      subtitle="Client testimonial"
      :title="isEditMode ? 'Edit review' : 'Add review'"
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
            <!-- Name -->
            <VCol cols="12">
              <VTextField
                v-model="reviewFormData.name"
                :error-messages="validationErrors('name')"
                @input="touchField('name')"
              >
                <template #label>
                  Client name <span class="text-red">*</span>
                </template>
              </VTextField>
            </VCol>

            <!-- Role / Company -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="reviewFormData.role"
                label="Role"
                placeholder="e.g. Founder"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="reviewFormData.company"
                label="Company"
              />
            </VCol>

            <!-- Project -->
            <VCol cols="12">
              <VTextField
                v-model="reviewFormData.project"
                label="Project"
                placeholder="What we built for them"
              />
            </VCol>

            <!-- Rating -->
            <VCol cols="12">
              <div class="text-body-2 text-high-emphasis mb-1">
                Rating
              </div>
              <VRating
                v-model="reviewFormData.rating"
                hover
                length="5"
              />
            </VCol>

            <!-- Review -->
            <VCol cols="12">
              <VTextarea
                v-model="reviewFormData.review"
                rows="4"
                auto-grow
                :error-messages="validationErrors('review')"
                @input="touchField('review')"
              >
                <template #label>
                  Review <span class="text-red">*</span>
                </template>
              </VTextarea>
            </VCol>

            <!-- Avatar -->
            <VCol cols="12">
              <ImageUploadField
                v-model="reviewFormData.avatar"
                label="Client photo (optional)"
                rounded
              />
            </VCol>

            <!-- Flags -->
            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="reviewFormData.published"
                :label="reviewFormData.published ? 'Published on website' : 'Draft'"
                color="success"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="reviewFormData.featured"
                label="Featured"
                color="info"
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
                @click="handleSubmitReview"
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
