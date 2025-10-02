<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div
        class="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900"
      >
        <div class="flex flex-col flex-1 w-full lg:w-1/2">
          <!-- Form -->
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div class="mb-5 sm:mb-8">
              <h1
                class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md"
              >
                Inscription
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Entrer vos informations pour vous connecter !
              </p>
              <p v-if="errors.general" class="mt-2 text-sm text-error-500">
                {{ errors.general }}
              </p>
            </div>
            <div>
              <form @submit.prevent="handleSubmit">
                <div class="space-y-5">
                  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <!-- First Name -->
                    <div class="sm:col-span-1">
                      <label
                        for="fname"
                        class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Prénom<span class="text-error-500">*</span>
                      </label>
                      <input
                        v-model="formData.name"
                        type="text"
                        id="fname"
                        name="fname"
                        placeholder="Entrer votre prénom"
                        :class="[
                          'dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
                          errors.name ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-brand-300 dark:focus:border-brand-800'
                        ]"
                      />
                      <p v-if="errors.name" class="mt-1 text-sm text-error-500">
                        {{ errors.name }}
                      </p>
                    </div>
                    <!-- Last Name -->
                    <div class="sm:col-span-1">
                      <label
                        for="lname"
                        class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Nom<span class="text-error-500">*</span>
                      </label>
                      <input
                        v-model="formData.name"
                        type="text"
                        id="lname"
                        name="lname"
                        placeholder="Entrer votre nom"
                        :class="[
                          'dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
                          errors.name ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-brand-300 dark:focus:border-brand-800'
                        ]"
                      />
                      <p v-if="errors.name" class="mt-1 text-sm text-error-500">
                        {{ errors.name }}
                      </p>
                    </div>
                  </div>
                  <!-- Email -->
                  <div>
                    <label
                      for="email"
                      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                    >
                      Email<span class="text-error-500">*</span>
                    </label>
                    <input
                      v-model="formData.email"
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Entrer votre email"
                      :class="[
                        'dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
                        errors.email ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-brand-300 dark:focus:border-brand-800'
                      ]"
                    />
                    <p v-if="errors.email" class="mt-1 text-sm text-error-500">
                      {{ errors.email }}
                    </p>
                  </div>
                  <!-- Password -->
                  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        for="password"
                        class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Mot de passe<span class="text-error-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="formData.password"
                          :type="showPassword ? 'text' : 'password'"
                          id="password"
                          placeholder="Entrer le mot de passe"
                          :class="[
                            'dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
                            errors.password ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-brand-300 dark:focus:border-brand-800'
                          ]"
                        />
                        <span
                          @click="togglePasswordVisibility"
                          class="absolute z-30 text-gray-500 -translate-y-1/2 cursor-pointer right-4 top-1/2 dark:text-gray-400"
                        >
                          <svg
                            v-if="!showPassword"
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z"
                              fill="#98A2B3"
                            />
                          </svg>
                          <svg
                            v-else
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z"
                              fill="#98A2B3"
                            />
                          </svg>
                        </span>
                      </div>
                      <p v-if="errors.password" class="mt-1 text-sm text-error-500">
                        {{ errors.password }}
                      </p>
                    </div>
                    <div>
                      <label
                        for="password_confirmation"
                        class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Confirmer le mot de passe<span class="text-error-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="formData.password_confirmation"
                          :type="showPasswordConfirmation ? 'text' : 'password'"
                          id="password_confirmation"
                          placeholder="Entrer à nouveau le mot de passe"
                          :class="[
                            'dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
                            errors.password_confirmation ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-brand-300 dark:focus:border-brand-800'
                          ]"
                        />
                        <span
                          @click="togglePasswordConfirmationVisibility"
                          class="absolute z-30 text-gray-500 -translate-y-1/2 cursor-pointer right-4 top-1/2 dark:text-gray-400"
                        >
                          <svg
                            v-if="!showPasswordConfirmation"
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z"
                              fill="#98A2B3"
                            />
                          </svg>
                          <svg
                            v-else
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z"
                              fill="#98A2B3"
                            />
                          </svg>
                        </span>
                      </div>
                      <p v-if="errors.password_confirmation" class="mt-1 text-sm text-error-500">
                        {{ errors.password_confirmation }}
                      </p>
                    </div>
                  </div>
                  <!-- Checkbox -->
                  <div>
                    <div>
                      <label
                        for="marketing"
                        class="flex items-start text-sm font-normal text-gray-700 cursor-pointer select-none dark:text-gray-400"
                      >
                        <div class="relative">
                          <input
                            v-model="formData.marketing"
                            type="checkbox"
                            id="marketing"
                            class="sr-only"
                          />
                          <div
                            :class="
                              formData.marketing
                                ? 'border-brand-500 bg-brand-500'
                                : 'bg-transparent border-gray-300 dark:border-gray-700'
                            "
                            class="mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px]"
                          >
                            <span :class="formData.marketing ? '' : 'opacity-0'">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                  stroke="white"
                                  stroke-width="1.94437"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <p class="inline-block font-normal text-gray-500 dark:text-gray-400">
                          Je souhaite recevoir des informations sur les nouveautés, les produits et les services de Bylin par e-mail.
                        </p>
                      </label>
                    </div>
                    <div>
                      <label
                        for="checkboxLabelOne"
                        class="flex items-start text-sm font-normal text-gray-700 cursor-pointer select-none dark:text-gray-400"
                      >
                        <div class="relative">
                          <input
                            v-model="agreeToTerms"
                            type="checkbox"
                            id="checkboxLabelOne"
                            class="sr-only"
                          />
                          <div
                            :class="
                              agreeToTerms
                                ? 'border-brand-500 bg-brand-500'
                                : 'bg-transparent border-gray-300 dark:border-gray-700'
                            "
                            class="mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px]"
                          >
                            <span :class="agreeToTerms ? '' : 'opacity-0'">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                  stroke="white"
                                  stroke-width="1.94437"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <p class="inline-block font-normal text-gray-500 dark:text-gray-400">
                          En créant un compte, vous acceptez les
                          <span class="text-gray-800 dark:text-white/90">
                            Termes et Conditions,
                          </span>
                          et notre
                          <span class="text-gray-800 dark:text-white"> Politique de confidentialité </span>
                        </p>
                      </label>
                    </div>
                  </div>
                  <!-- Button -->
                  <div>
                    <button
                      type="submit"
                      :disabled="isSubmitDisabled"
                      :class="[
                        'flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg shadow-theme-xs',
                        isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600'
                      ]"
                    >
                      <span v-if="authStore.isLoading" class="flex items-center">
                        <svg class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Inscription...
                      </span>
                      <span v-else>S'inscrire</span>
                    </button>
                  </div>
                </div>
              </form>
              <div class="mt-5">
                <p
                  class="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start"
                >
                  Vous avez déjà un compte?
                  <router-link
                    to="/signin"
                    class="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >Se connecter</router-link
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          class="relative items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid"
        >
          <div class="flex items-center justify-center z-1">
            <common-grid-shape />
            <div class="flex flex-col items-center max-w-xs">
              <router-link to="/" class="block mb-4">
                <img src="/images/logo/auth-logo.svg" alt="Logo" class="w-48" />
              </router-link>
              <p class="text-center font-light text-gray-400 dark:text-white/60">
                Panel Administration de
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
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import CommonGridShape from '@/components/common/CommonGridShape.vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const authStore = useAuthStore()

const showPasswordConfirmation = ref(false)
const showPassword = ref(false)
const agreeToTerms = ref(false)

const formData = ref({
  name: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  marketing: false
})

const errors = ref({
  name: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  general: ''
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const togglePasswordConfirmationVisibility = () => {
  showPasswordConfirmation.value = !showPasswordConfirmation.value
}

const validateForm = () => {
  let isValid = true
  errors.value = {
    name: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    general: ''
  }

  // Validation des champs requis
  if (!formData.value.name.trim()) {
    errors.value.name = 'Le prénom est requis'
    isValid = false
  }

  if (!formData.value.name.trim()) {
    errors.value.name = 'Le nom est requis'
    isValid = false
  }

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.value.email) {
    errors.value.email = 'L\'email est requis'
    isValid = false
  } else if (!emailRegex.test(formData.value.email)) {
    errors.value.email = 'Veuillez entrer un email valide'
    isValid = false
  }

  // Validation mot de passe
  if (!formData.value.password) {
    errors.value.password = 'Le mot de passe est requis'
    isValid = false
  } else if (formData.value.password.length < 8) {
    errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
    isValid = false
  }

  // Validation confirmation mot de passe
  if (formData.value.password !== formData.value.password_confirmation) {
    errors.value.password_confirmation = 'Les mots de passe ne correspondent pas'
    isValid = false
  }

  // Validation des CGU
  if (!agreeToTerms.value) {
    errors.value.general = 'Vous devez accepter les termes et conditions'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return;

  console.log('Form data:', formData.value);

  try {
    const response = await authStore.register(formData.value);
    console.log('Registration successful:', response);

    // Handle successful registration
    if (response && response.token) {
      // Redirect or show success message
      router.push('/'); // Example redirect
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (typeof error === 'string' && error.includes('CSRF')) {
      errors.value.general = 'Session expired. Please refresh and try again.';
    } else {
      errors.value.general = typeof error === 'string'
        ? error
        : 'Registration failed. Please try again.';
    }
  }
};

// Computed property pour désactiver le bouton
const isSubmitDisabled = computed(() => {
  return authStore.isLoading ||
         !formData.value.name ||
         !formData.value.name ||
         !formData.value.email ||
         !formData.value.password ||
         !formData.value.password_confirmation ||
         !agreeToTerms.value
})
</script>
