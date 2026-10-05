<script setup lang="ts">
import ReviewForm from './ReviewForm.vue'
import ReviewService from '@/services/review/ReviewService'
import type { ReviewView } from '@/types/review/Review'
import { avatarText, formatDate } from '@/utils/formatters'
import { resolveAssetUrl } from '@/utils/assetUrl'

const reviewService = new ReviewService()

const $confirm = useConfirm()

const isDrawerVisible = ref(false)
const reviewFormRef = ref()

const isLoading = ref(false)
const reviewList = ref<ReviewView[]>([])

const searchQuery = reactive({
  keyword: '',
  status: null as 'published' | 'draft' | 'featured' | null,
})

const statusOptions = [
  { title: 'Published', value: 'published' },
  { title: 'Draft (awaiting approval)', value: 'draft' },
  { title: 'Featured', value: 'featured' },
]

const tableHeaders = [
  { title: 'Client', label: 'name' },
  { title: 'Rating', label: 'rating' },
  { title: 'Review', label: 'review' },
  { title: 'Status', label: 'status' },
  { title: 'Submitted', label: 'createdAt' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const isFiltered = computed(() => !!searchQuery.keyword?.trim() || !!searchQuery.status)

const filteredReviews = computed(() => {
  const keyword = searchQuery.keyword?.trim().toLowerCase()

  return reviewList.value.filter(review => {
    if (searchQuery.status === 'published' && !review.published) return false
    if (searchQuery.status === 'draft' && review.published) return false
    if (searchQuery.status === 'featured' && !review.featured) return false
    if (!keyword) return true

    return [review.name, review.company, review.role, review.review, review.project]
      .some(value => value?.toLowerCase().includes(keyword))
  })
})

const pendingCount = computed(() => reviewList.value.filter(review => !review.published).length)

const getAllReviews = async () => {
  isLoading.value = true
  try {
    reviewList.value = (await reviewService.list()).sort(bySortOrder)
  }
  catch (error) {
    showError(error)
    reviewList.value = []
  }
  finally {
    isLoading.value = false
  }
}

// Dragging is only enabled on the unfiltered list, so the emitted order is the full order
const handleSort = async (sorted: ReviewView[]) => {
  try {
    await reviewService.sortItems(sorted.map(item => item.id))
    showSuccess('Reviews sorted successfully')
  }
  catch (error) {
    showError(error)
    getAllReviews()
  }
}

const toggleFlag = async (item: ReviewView, field: 'published' | 'featured') => {
  const nextValue = !item[field]

  try {
    await reviewService.update(item.id, { [field]: nextValue })
    item[field] = nextValue
    if (field === 'published')
      showSuccess(nextValue ? 'Review published on the website' : 'Review moved to drafts')
    else
      showSuccess(nextValue ? 'Review marked as featured' : 'Review removed from featured')
  }
  catch (error) {
    showError(error)
  }
}

const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editReview = (item: ReviewView) => {
  isDrawerVisible.value = true
  nextTick(() => reviewFormRef.value?.edit(item))
}

const deleteReview = (item: ReviewView) => {
  $confirm?.({
    message: `Delete the review from ${item.name}?`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await reviewService.destroy(item.id)
        showSuccess('Review deleted successfully')
        getAllReviews()
      }
      catch (error) {
        showError(error)
      }
    },
  })
}

onMounted(() => getAllReviews())
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Reviews"
        icon="star"
      >
        <template #badge>
          <VChip
            v-if="pendingCount"
            size="small"
            color="warning"
          >
            {{ pendingCount }} awaiting approval
          </VChip>
        </template>
        <template #subtitle>
          Client feedback. Reviews submitted on the website arrive as drafts — publish them to show them.
        </template>
        <template #actions>
          <VBtn @click="openAddDrawer">
            <VIcon
              start
              icon="plus"
            />
            Add review
          </VBtn>
        </template>
      </PageHeader>

      <!-- Filters -->
      <VCardText>
        <VRow align="center">
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="searchQuery.keyword"
              label="Search by client, company or text"
              prepend-inner-icon="search"
              clearable
              clear-icon="x"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <VSelect
              v-model="searchQuery.status"
              label="Status"
              :items="statusOptions"
              clearable
              clear-icon="x"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
            class="text-body-2 text-medium-emphasis"
          >
            {{ isFiltered ? 'Clear filters to reorder reviews.' : 'Drag rows to reorder.' }}
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="isFiltered ? filteredReviews : reviewList"
        :loading="isLoading"
        :paginate="false"
        :draggable-sort="!isFiltered"
        empty-table-text="No reviews found"
        @sort-items="handleSort"
      >
        <template #name="{ row: item }">
          <div
            class="d-flex align-center gap-3 cursor-pointer"
            @click="editReview(item)"
          >
            <VIcon
              v-if="!isFiltered"
              size="small"
              icon="grip-vertical"
              class="text-disabled"
            />
            <VAvatar
              color="primary"
              variant="tonal"
              size="38"
            >
              <VImg
                v-if="item.avatar"
                :src="resolveAssetUrl(item.avatar)"
                cover
              />
              <span v-else>{{ avatarText(item.name) }}</span>
            </VAvatar>
            <div>
              <div class="title-hover font-weight-medium">
                {{ item.name }}
              </div>
              <div class="text-caption text-disabled">
                {{ [item.role, item.company].filter(Boolean).join(' · ') || '-' }}
              </div>
            </div>
          </div>
        </template>

        <template #rating="{ row: item }">
          <VRating
            :model-value="item.rating"
            readonly
            density="compact"
            size="small"
          />
        </template>

        <template #review="{ row: item }">
          <div class="text-truncate-2 text-body-2">
            {{ item.review }}
          </div>
          <div
            v-if="item.project"
            class="text-caption text-disabled"
          >
            {{ item.project }}
          </div>
        </template>

        <template #status="{ row: item }">
          <div class="d-flex flex-wrap gap-1">
            <VChip
              :color="item.published ? 'success' : 'warning'"
              size="small"
            >
              {{ item.published ? 'Published' : 'Draft' }}
            </VChip>
            <VChip
              v-if="item.featured"
              color="info"
              size="small"
            >
              Featured
            </VChip>
          </div>
        </template>

        <template #createdAt="{ row: item }">
          <span class="text-no-wrap">{{ item.createdAt ? formatDate(item.createdAt) : '-' }}</span>
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
                  @click="toggleFlag(item, 'published')"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      :icon="item.published ? 'eye-off' : 'check-circle-2'"
                    />
                  </template>
                  <VListItemTitle>{{ item.published ? 'Unpublish' : 'Publish' }}</VListItemTitle>
                </VListItem>

                <VListItem
                  link
                  @click="toggleFlag(item, 'featured')"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      :icon="item.featured ? 'star' : 'star-filled'"
                    />
                  </template>
                  <VListItemTitle>{{ item.featured ? 'Remove from featured' : 'Mark as featured' }}</VListItemTitle>
                </VListItem>

                <VListItem
                  link
                  @click="editReview(item)"
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
                  @click="deleteReview(item)"
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

    <ReviewForm
      ref="reviewFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllReviews"
    />
  </section>
</template>
