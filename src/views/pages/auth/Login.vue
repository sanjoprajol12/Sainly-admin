<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { useSiteSettingStore } from '@/store/siteSetting'
import type { UserCredentials } from '@/types/auth/UserCredentials'
import { VNodeRenderer } from '@/core/components/VNodeRenderer'
import { useSiteSetting, useSiteSettingLoader } from '@/composable/useSiteSetting'
import { rules } from '@/composable/validation/useRules'
import { resolveAssetUrl } from '@/utils/assetUrl'
import logoFull from '@/assets/logo.png'

// Store
const authStore = useAuthStore()
const siteSettingStore = useSiteSettingStore()
const route = useRoute()
const router = useRouter()

// Site Settings
const isSiteSettingLoading = useSiteSettingLoader()
const siteSetting = useSiteSetting()

// Refs
const isLoading = ref(false)
const isPasswordVisible = ref(false)
const errorMessage = ref('')
const userCredentials = reactive<UserCredentials>({ username: '', password: '' })

// Second step for accounts with two-factor authentication
const isMfaStep = ref(false)
const isRecoveryCode = ref(false)
const mfaCode = ref('')

// What the portal manages, shown on the brand panel
const highlights = [
  { icon: 'layout-grid', title: 'Website content', text: 'Hero, services, projects, FAQ and more' },
  { icon: 'mail', title: 'Inbox', text: 'Enquiries from the contact form' },
  { icon: 'star', title: 'Reviews', text: 'Approve and feature client feedback' },
]

// Validation
const formValidationRules = {
  username: { required: rules.required },
  password: { required: rules.required },
}

const { validationErrors, touch, hasError } = useFormValidation(formValidationRules, userCredentials)

// Computed
const logoImage = computed(() => {
  if (siteSetting.value?.logo) {
    return h('img', {
      src: resolveAssetUrl(siteSetting.value.logo),
      alt: siteSetting.value.studio_name || 'Sainly Studio',
      style: 'display:block; max-height:56px; width:auto;',
    })
  }

  return h('img', { src: logoFull, alt: 'Sainly Studio', style: 'display:block; max-height:72px; width:auto;' })
})

const studioName = computed(() => siteSetting.value?.studio_name || 'Sainly Studio')

// Methods
async function submitLogin() {
  touch()
  if (hasError.value) return

  isLoading.value = true
  errorMessage.value = ''

  const isLoggedIn = await authStore.login({
    username: userCredentials.username.trim(),
    password: userCredentials.password,
  })

  isLoading.value = false

  if (isLoggedIn === 'mfa') {
    userCredentials.password = ''
    mfaCode.value = ''
    isRecoveryCode.value = false
    isMfaStep.value = true

    return
  }

  if (isLoggedIn) {
    await redirectAfterLogin()

    return
  }

  errorMessage.value = authStore.errors[0] || 'Invalid username or password'
}

async function redirectAfterLogin() {
  const redirectTo = typeof route.query.to === 'string' && route.query.to.startsWith('/') ? route.query.to : '/dashboard'

  await router.replace(redirectTo)
}

async function submitMfaCode() {
  const code = mfaCode.value.trim()
  if (!code) {
    errorMessage.value = isRecoveryCode.value ? 'Enter one of your recovery codes' : 'Enter the 6-digit code from your authenticator app'

    return
  }

  isLoading.value = true
  errorMessage.value = ''

  const isLoggedIn = await authStore.completeMfaLogin(code)

  isLoading.value = false

  if (isLoggedIn) {
    await redirectAfterLogin()

    return
  }

  errorMessage.value = authStore.errors[0] || 'Invalid verification code'
  mfaCode.value = ''

  // The challenge expired; start again from the password
  if (!authStore.pendingMfaToken)
    isMfaStep.value = false
}

function backToPassword() {
  authStore.cancelMfaLogin()
  isMfaStep.value = false
  mfaCode.value = ''
  errorMessage.value = ''
}

function toggleRecoveryCode() {
  isRecoveryCode.value = !isRecoveryCode.value
  mfaCode.value = ''
  errorMessage.value = ''
}

// Lifecycle Hooks
onMounted(() => {
  if (!siteSetting.value?.studio_name)
    siteSettingStore.getSetting()
})
</script>

<template>
  <div class="auth-wrapper">
    <!-- Brand panel -->
    <div class="auth-brand d-none d-md-flex">
      <div class="auth-brand__inner">
        <div class="d-flex align-center gap-3 mb-12">
          <VAvatar
            size="44"
            rounded="lg"
            class="auth-brand__badge"
          >
            <VIcon
              icon="lock-keyhole"
              size="24"
            />
          </VAvatar>
          <div>
            <div class="text-body-1 font-weight-medium">
              {{ studioName }}
            </div>
            <div class="auth-brand__muted text-body-2">
              Admin portal
            </div>
          </div>
        </div>

        <h2 class="auth-brand__title">
          Manage your website from one place.
        </h2>
        <p class="auth-brand__muted mb-10">
          Update content, answer enquiries and publish reviews without touching code.
        </p>

        <div class="d-flex flex-column gap-5">
          <div
            v-for="item in highlights"
            :key="item.title"
            class="d-flex align-start gap-3"
          >
            <VAvatar
              size="40"
              rounded="lg"
              class="auth-brand__badge flex-shrink-0"
            >
              <VIcon
                :icon="item.icon"
                size="20"
              />
            </VAvatar>
            <div>
              <div class="text-body-1 font-weight-medium">
                {{ item.title }}
              </div>
              <div class="auth-brand__muted text-body-2">
                {{ item.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sign-in form -->
    <div class="auth-form-side d-flex align-center justify-center pa-4 pa-sm-8">
      <VCard
        flat
        class="auth-card admin-card pa-2 pa-sm-6"
        max-width="440"
        width="100%"
      >
        <VCardText>
          <div class="d-flex align-center justify-center mb-6">
            <VProgressCircular
              v-if="isSiteSettingLoading"
              indeterminate
            />
            <VNodeRenderer
              v-else
              :nodes="logoImage"
            />
          </div>
          <h1 class="auth-title text-center mb-1">
            {{ isMfaStep ? 'Two-step verification' : 'Welcome back' }}
          </h1>
          <p class="text-body-1 text-medium-emphasis text-center mb-0">
            <template v-if="!isMfaStep">
              Sign in to manage {{ studioName }}
            </template>
            <template v-else-if="isRecoveryCode">
              Enter one of the recovery codes you saved when you set up two-step verification.
            </template>
            <template v-else>
              Enter the 6-digit code from your authenticator app.
            </template>
          </p>
        </VCardText>

        <VCardText v-if="isMfaStep">
          <VForm @submit.prevent="submitMfaCode">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-if="isRecoveryCode"
                  key="recovery"
                  v-model="mfaCode"
                  autofocus
                  label="Recovery code"
                  placeholder="xxxxx-xxxxx"
                  autocomplete="off"
                  prepend-inner-icon="key"
                />
                <VTextField
                  v-else
                  key="totp"
                  v-model="mfaCode"
                  autofocus
                  label="Verification code"
                  placeholder="123456"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="6"
                  prepend-inner-icon="smartphone"
                />
              </VCol>

              <VCol
                v-if="errorMessage"
                cols="12"
              >
                <VAlert
                  type="error"
                  variant="tonal"
                  density="compact"
                  icon="alert-circle"
                >
                  {{ errorMessage }}
                </VAlert>
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  size="large"
                  type="submit"
                  append-icon="arrow-right"
                  :loading="isLoading"
                >
                  Verify
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="d-flex justify-space-between flex-wrap gap-2"
              >
                <VBtn
                  variant="text"
                  size="small"
                  prepend-icon="arrow-left"
                  @click="backToPassword"
                >
                  Back
                </VBtn>
                <VBtn
                  variant="text"
                  size="small"
                  @click="toggleRecoveryCode"
                >
                  {{ isRecoveryCode ? 'Use authenticator app' : 'Use a recovery code' }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardText v-else>
          <VForm @submit.prevent="submitLogin">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="userCredentials.username"
                  :error-messages="validationErrors('username')"
                  autofocus
                  label="Username"
                  autocomplete="username"
                  prepend-inner-icon="user"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="userCredentials.password"
                  :error-messages="validationErrors('password')"
                  label="Password"
                  autocomplete="current-password"
                  prepend-inner-icon="lock"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'eye-off' : 'eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol
                v-if="errorMessage"
                cols="12"
              >
                <VAlert
                  type="error"
                  variant="tonal"
                  density="compact"
                  icon="alert-circle"
                >
                  {{ errorMessage }}
                </VAlert>
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  size="large"
                  type="submit"
                  append-icon="arrow-right"
                  :loading="isLoading"
                >
                  Sign in
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardText class="text-center text-caption text-disabled pt-0">
          <VIcon
            icon="lock"
            size="14"
            class="me-1"
          />
          Authorised staff only
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
.layout-blank {
  .auth-wrapper {
    display: flex;
    min-block-size: 100dvh;
  }

  .auth-card {
    z-index: 1 !important;
  }
}

.auth-brand {
  flex: 0 0 44%;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background:
    radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.12) 0, transparent 40%),
    linear-gradient(160deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  color: #fff;

  &__inner {
    max-inline-size: 420px;
  }

  // Global heading/text colours would otherwise win over the inherited white
  &__title,
  .text-body-1 {
    color: #fff !important;
  }

  &__badge {
    background-color: rgba(255, 255, 255, 0.14) !important;
    color: #fff !important;
  }

  &__title {
    margin-block-end: 0.75rem;
    font-size: 1.875rem;
    font-weight: 600;
    line-height: 2.375rem;
  }

  &__muted {
    color: rgba(255, 255, 255, 0.78) !important;
  }
}

.auth-form-side {
  flex: 1 1 auto;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.273px;
  line-height: normal;
}
</style>
