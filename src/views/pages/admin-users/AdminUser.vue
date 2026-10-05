<script setup lang="ts">
import AdminUserForm from './AdminUserForm.vue'
import AdminUserService from '@/services/admin-user/AdminUserService'
import type { AdminUserView } from '@/types/admin-user/AdminUser'
import { avatarText, formatDate } from '@/utils/formatters'

const adminUserService = new AdminUserService()

const $confirm = useConfirm()
const authUser = useAuthUser().authUserData

const isDrawerVisible = ref(false)
const adminUserFormRef = ref()

const isLoading = ref(false)
const adminUserList = ref<AdminUserView[]>([])

const tableHeaders = [
  { title: 'Username', label: 'username' },
  { title: 'Role', label: 'role' },
  { title: 'Two-step', label: 'mfa_enabled' },
  { title: 'Created', label: 'createdAt' },
  { title: 'Actions', label: 'actions', textAlign: 'center' as const },
]

const getAllAdminUsers = async () => {
  isLoading.value = true
  try {
    adminUserList.value = await adminUserService.list()
  }
  catch (error) {
    showError(error)
    adminUserList.value = []
  }
  finally {
    isLoading.value = false
  }
}

const isCurrentUser = (item: AdminUserView) => item.id === authUser.value?.id

const openAddDrawer = () => {
  isDrawerVisible.value = true
}

const editAdminUser = (item: AdminUserView) => {
  isDrawerVisible.value = true
  nextTick(() => adminUserFormRef.value?.edit(item))
}

const resetMfa = (item: AdminUserView) => {
  $confirm?.({
    message: `Turn off two-step verification for "${item.username}"? They will be signed out and can set it up again from their Security page.`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await adminUserService.resetMfa(item.id)
        showSuccess('Two-step verification reset')
        getAllAdminUsers()
      }
      catch (error) {
        showError(error)
      }
    },
  })
}

const deleteAdminUser = (item: AdminUserView) => {
  $confirm?.({
    message: `Delete the admin account "${item.username}"? They will no longer be able to log in.`,
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await adminUserService.destroy(item.id)
        showSuccess('Admin user deleted successfully')
        getAllAdminUsers()
      }
      catch (error) {
        showError(error)
      }
    },
  })
}

onMounted(() => getAllAdminUsers())
</script>

<template>
  <section>
    <VCard
      flat
      class="admin-card mb-6"
    >
      <PageHeader
        title="Admin users"
        icon="users"
      >
        <template #subtitle>
          People who can sign in to this portal. Only super admins can manage accounts.
        </template>
        <template #actions>
          <VBtn @click="openAddDrawer">
            <VIcon
              start
              icon="plus"
            />
            Add admin
          </VBtn>
        </template>
      </PageHeader>

      <VDivider />

      <CustomTable
        :header="tableHeaders"
        :data="adminUserList"
        :loading="isLoading"
        :paginate="false"
        empty-table-text="No admin users found"
      >
        <template #username="{ row: item }">
          <div class="d-flex align-center gap-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="34"
            >
              {{ avatarText(item.username) }}
            </VAvatar>
            <span
              class="cursor-pointer title-hover"
              @click="editAdminUser(item)"
            >
              {{ item.username }}
            </span>
            <VChip
              v-if="isCurrentUser(item)"
              size="x-small"
              variant="tonal"
            >
              You
            </VChip>
          </div>
        </template>

        <template #role="{ row: item }">
          <VChip
            :color="item.role === 'super_admin' ? 'primary' : 'secondary'"
            size="small"
          >
            {{ item.role === 'super_admin' ? 'Super admin' : 'Admin' }}
          </VChip>
        </template>

        <template #mfa_enabled="{ row: item }">
          <VChip
            :color="item.mfa_enabled ? 'success' : 'secondary'"
            size="small"
            :prepend-icon="item.mfa_enabled ? 'shield-check' : 'shield-off'"
          >
            {{ item.mfa_enabled ? 'On' : 'Off' }}
          </VChip>
        </template>

        <template #createdAt="{ row: item }">
          {{ item.createdAt ? formatDate(item.createdAt) : '-' }}
        </template>

        <template #actions="{ row: item }">
          <div class="d-flex justify-center gap-1">
            <IconBtn
              size="small"
              @click="editAdminUser(item)"
            >
              <VIcon icon="pencil" />
            </IconBtn>
            <IconBtn
              v-if="item.mfa_enabled && !isCurrentUser(item)"
              size="small"
              @click="resetMfa(item)"
            >
              <VIcon icon="shield-off" />
              <VTooltip activator="parent">
                Reset two-step verification
              </VTooltip>
            </IconBtn>
            <IconBtn
              size="small"
              color="error"
              :disabled="isCurrentUser(item)"
              @click="deleteAdminUser(item)"
            >
              <VIcon icon="trash-2" />
              <VTooltip
                v-if="isCurrentUser(item)"
                activator="parent"
              >
                You can't delete your own account
              </VTooltip>
            </IconBtn>
          </div>
        </template>
      </CustomTable>
    </VCard>

    <AdminUserForm
      ref="adminUserFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllAdminUsers"
    />
  </section>
</template>
