<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div class="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900">
        <!-- Left side - Login Form -->
        <div class="flex flex-col flex-1 w-full lg:w-1/2">
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <!-- Header -->
              <div class="mb-6 sm:mb-10">
                <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Bienvenue 👋</h1>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Connectez-vous à votre compte pour continuer.
                </p>
              </div>

              <!-- Error Message -->
              <div v-if="errorMessage" class="mb-4 text-sm text-red-600 dark:text-red-400">
                {{ errorMessage }}
              </div>

              <!-- Login Form -->
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Email Field -->
                <div>
                  <label for="email" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.email"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="mon-email@gmail.com"
                    class="h-11 w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-white/30"
                    required
                  />
                </div>

                <!-- Password Field -->
                <div>
                  <label for="password" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mot de passe <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="formData.password"
                      :type="showPassword ? 'text' : 'password'"
                      id="password"
                      placeholder="Entrer le mot de passe"
                      class="h-11 w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-white/30"
                      required
                    />
                    <span
                      @click="togglePasswordVisibility"
                      class="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 dark:text-gray-400"
                    >
                      <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.913 2.957-3.22 5.369-6.208 6.416" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.06 10.06 0 013.21-4.774M15 12a3 3 0 00-3-3m0 0a3 3 0 013 3m-3-3v.01M3 3l18 18" />
                      </svg>
                    </span>
                  </div>
                </div>

                <!-- Remember Me + Forgot Password -->
                <div class="flex items-center justify-between">
                  <label class="flex items-center text-sm text-gray-700 dark:text-gray-400 cursor-pointer">
                    <input v-model="keepLoggedIn" type="checkbox" class="mr-2 rounded border-gray-300" />
                    Rester connecté
                  </label>
                  <router-link
                    to="/reset-password"
                    class="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Mot de passe oublié ?
                  </router-link>
                </div>

                <!-- Submit Button -->
                <div>
                  <button
                    type="submit"
                    :disabled="!isFormValid"
                    :class="[
                      'w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm',
                      isFormValid
                        ? 'bg-brand-500 text-white hover:bg-brand-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    ]"
                  >
                    <span v-if="isLoading">
                      <svg class="inline w-5 h-5 mr-2 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Connexion...
                    </span>
                    <span v-else>
                      Se connecter
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Right side - Branding -->
        <div class="relative items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div class="flex items-center justify-center z-1">
            <common-grid-shape />
            <div class="flex flex-col items-center max-w-xs">
              <router-link to="/" class="block mb-4">
                <img width="231" height="48" src="/logo.png" alt="Logo" />
              </router-link>
              <p class="text-center font-light text-gray-400 dark:text-white/60">
                Panel d'administration de
                <span class="font-semibold">Bylin</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CommonGridShape from '@/components/common/CommonGridShape.vue'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const formData = ref({
  email: '',
  password: '',
})

const errorMessage = ref('')
const showPassword = ref(false)
const keepLoggedIn = ref(false)
const isLoading = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const isFormValid = computed(() => {
  return formData.value.email.trim() !== '' && formData.value.password.trim() !== ''
})

const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await authStore.login(formData.value)
    if (response?.token) {
      router.push('/')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    errorMessage.value = error?.response?.data?.message || 'Adresse e-mail ou mot de passe invalide.'
  } finally {
    isLoading.value = false
  }
}
</script>
