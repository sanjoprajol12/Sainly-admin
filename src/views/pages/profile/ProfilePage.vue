<script setup lang="ts">
import { avatarText } from '@/utils/formatters'
import AdminUserLoginService from '@/services/auth/AdminUserLoginService'
import JwtService from '@/services/JwtService'
import { useAuthStore } from '@/store/auth'
import type { ChangeCredentialsPayload } from '@/types/auth/UserCredentials'
import { useFormValidation } from '@/utils/useFormValidation'
import { rules } from '@/composable/validation/useRules'

const adminUserLoginService = new AdminUserLoginService()
const authStore = useAuthStore()

const isSaving = ref(false)
const isPasswordVisible = ref(false)

const credentialsForm = reactive({
  currentPassword: '',
  newUsername: authStore.user?.username ?? '',
  newPassword: '',
  confirmPassword: '',
})

const formValidationRules = computed(() => ({
  currentPassword: { required: rules.required },
  newUsername: { required: rules.required },
  newPassword: { minLength: rules.minLength(6) },
  confirmPassword: {
    sameAs: rules.custom(
      (value: string) => value === credentialsForm.newPassword,
      'Passwords do not match',
    ),
  },
}))

const { validationErrors, touchField, touch, resetValidation, hasError } =
  useFormValidation(formValidationRules, credentialsForm)

const roleName = computed(() => authStore.user?.role === 'super_admin' ? 'Super admin' : 'Admin')

const saveCredentials = async () => {
  touch()
  if (hasError.value) return

  const payload: ChangeCredentialsPayload = { currentPassword: credentialsForm.currentPassword }
  const newUsername = credentialsForm.newUsername.trim()

  if (newUsername !== authStore.user?.username)
    payload.newUsername = newUsername
  if (credentialsForm.newPassword)
    payload.newPassword = credentialsForm.newPassword

  if (!payload.newUsername && !payload.newPassword) {
    showInfo('Nothing to update')

    return
  }

  isSaving.value = true
  try {
    const { message, token } = await adminUserLoginService.changeCredentials(payload)

    if (token)
      JwtService.saveToken(token)

    if (payload.newUsername)
      authStore.updateUsername(payload.newUsername)

    Object.assign(credentialsForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
    nextTick(() => resetValidation())
    showSuccess(message || 'Account updated successfully')
  }
  catch (error) {
    showError(error)
  }
  finally {
    isSaving.value = false
  }
}

watch(() => authStore.user?.username, (username?: string) => {
  if (username && !credentialsForm.newUsername)
    credentialsForm.newUsername = username
})
</script>

<template>
  <section>
    <VRow>
      <VCol
        cols="12"
        md="4"
      >
        <VCard
          flat
          class="admin-card"
        >
          <VCardText class="d-flex flex-column align-center text-center pa-8">
            <VAvatar
              size="88"
              color="primary"
              variant="tonal"
              class="mb-4"
            >
              <span class="text-h3">{{ avatarText(authStore.user?.username ?? '') }}</span>
            </VAvatar>
            <h5 class="text-h5 mb-1">
              {{ authStore.user?.username }}
            </h5>
            <VChip
              size="small"
              color="primary"
              prepend-icon="users"
            >
              {{ roleName }}
            </VChip>
          </VCardText>
          <VDivider />
          <VCardText class="pa-5">
            <div class="d-flex align-center gap-3 text-body-2">
              <VIcon
                icon="info"
                size="20"
                color="info"
              />
              <span class="text-medium-emphasis">Your current password is needed to save any change to your sign-in details.</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="8"
      >
        <VCard
          flat
          class="admin-card"
        >
          <PageHeader
            title="Sign-in details"
            subtitle="Change your username or password"
            icon="key"
            size="small"
          />

          <VDivider />

          <VCardText class="pa-4">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="credentialsForm.newUsername"
                  autocomplete="username"
                  :error-messages="validationErrors('newUsername')"
                  @input="touchField('newUsername')"
                >
                  <template #label>
                    Username <span class="text-red">*</span>
                  </template>
                </VTextField>
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="credentialsForm.newPassword"
                  label="New password"
                  autocomplete="new-password"
                  hint="Leave blank to keep your current password"
                  persistent-hint
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="validationErrors('newPassword')"
                  @input="touchField('newPassword')"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="credentialsForm.confirmPassword"
                  label="Confirm new password"
                  autocomplete="new-password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="validationErrors('confirmPassword')"
                  @input="touchField('confirmPassword')"
                />
              </VCol>
              <VCol cols="12">
                <VDivider class="mb-4" />
                <VTextField
                  v-model="credentialsForm.currentPassword"
                  autocomplete="current-password"
                  hint="Required to confirm any change"
                  persistent-hint
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'eye-off' : 'eye'"
                  :error-messages="validationErrors('currentPassword')"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  @input="touchField('currentPassword')"
                >
                  <template #label>
                    Current password <span class="text-red">*</span>
                  </template>
                </VTextField>
              </VCol>
              <VCol
                cols="12"
                class="d-flex justify-end"
              >
                <VBtn
                  :loading="isSaving"
                  prepend-icon="save"
                  @click="saveCredentials"
                >
                  Update account
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>
