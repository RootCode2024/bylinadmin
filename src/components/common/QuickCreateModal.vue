<template>
  <!-- Overlay -->
  <div
    v-if="show"
    class="fixed inset-0 z-[99999]"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div
        class="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 backdrop-blur-[2px] transition-opacity"
        @click="closeModal"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        @click.stop
      >
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              {{ title }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Nom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nom <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :placeholder="getPlaceholder('name')"
              >
            </div>

            <!-- Description (optionnelle) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :placeholder="getPlaceholder('description')"
              ></textarea>
            </div>

            <!-- Champs spécifiques selon le type -->
            <div v-if="isCategory">
              <!-- Catégorie parente -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie parente
                </label>
                <select
                  v-model="form.parent_id"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option :value="null">Aucune (catégorie racine)</option>
                  <option v-for="category in existingCategories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Ordre d'affichage -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Ordre d'affichage
                </label>
                <input
                  v-model.number="form.sort_order"
                  type="number"
                  min="0"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                >
              </div>
            </div>

            <div v-if="isBrand">
              <!-- Logo URL (optionnel) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  URL du logo
                </label>
                <input
                  v-model="form.logo_url"
                  type="url"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://example.com/logo.png"
                >
              </div>

              <!-- Site web -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <input
                  v-model="form.website"
                  type="url"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://example.com"
                >
              </div>
            </div>

            <!-- Status actif -->
            <div class="flex items-center">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              >
              <label class="ml-2 text-sm text-gray-700">
                {{ isCategory ? 'Catégorie active' : 'Marque active' }}
              </label>
            </div>

            <!-- Messages d'erreur -->
            <div v-if="errors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <div class="flex">
                <ExclamationCircleIcon class="h-5 w-5 text-red-400 mt-0.5" />
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-red-800">Erreurs de validation</h4>
                  <ul class="mt-1 text-sm text-red-700 list-disc list-inside">
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Message de succès -->
            <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-3">
              <div class="flex">
                <CheckCircleIcon class="h-5 w-5 text-green-400 mt-0.5" />
                <div class="ml-3">
                  <p class="text-sm text-green-700">{{ successMessage }}</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <SpinnerIcon class="w-4 h-4 mr-2 animate-spin" />
              Création...
            </span>
            <span v-else>Créer</span>
          </button>
          <button
            @click="closeModal"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  XMarkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon as SpinnerIcon
} from '@heroicons/vue/24/outline'
// import { SpinnerIcon } from '@/components/icons'
import api from '@/api/axiosConfig'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'brand', // 'brand' ou 'category'
    validator: (value) => ['brand', 'category'].includes(value)
  },
  existingCategories: {
    type: Array,
    default: () => []
  }
})

// Émissions
const emit = defineEmits(['close', 'created'])

// État local
const isSubmitting = ref(false)
const errors = ref([])
const successMessage = ref('')

// Formulaire
const form = ref({
  name: '',
  description: '',
  is_active: true,
  // Champs spécifiques aux catégories
  parent_id: null,
  sort_order: 0,
  // Champs spécifiques aux marques
  logo_url: '',
  website: ''
})

// Computed
const isCategory = computed(() => props.title.toLowerCase().includes('catégorie'))
const isBrand = computed(() => props.title.toLowerCase().includes('marque'))

const apiEndpoint = computed(() => {
  return isCategory.value ? '/api/admin/categories' : '/api/admin/brands'
})

// Méthodes
const getPlaceholder = (field) => {
  if (isCategory.value) {
    return {
      name: 'Ex: Vêtements',
      description: 'Description de la catégorie...'
    }[field]
  } else {
    return {
      name: 'Ex: Nike',
      description: 'Description de la marque...'
    }[field]
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    is_active: true,
    parent_id: null,
    sort_order: 0,
    logo_url: '',
    website: ''
  }
  errors.value = []
  successMessage.value = ''
}

const validateForm = () => {
  errors.value = []

  if (!form.value.name.trim()) {
    errors.value.push('Le nom est requis')
  }

  if (form.value.name.length < 2) {
    errors.value.push('Le nom doit contenir au moins 2 caractères')
  }

  if (form.value.logo_url && !isValidUrl(form.value.logo_url)) {
    errors.value.push('L\'URL du logo n\'est pas valide')
  }

  if (form.value.website && !isValidUrl(form.value.website)) {
    errors.value.push('L\'URL du site web n\'est pas valide')
  }

  return errors.value.length === 0
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    // Préparer les données selon le type
    const data = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || null,
      is_active: form.value.is_active
    }

    if (isCategory.value) {
      data.parent_id = form.value.parent_id
      data.sort_order = form.value.sort_order || 0
    } else {
      data.logo_url = form.value.logo_url.trim() || null
      data.website = form.value.website.trim() || null
    }

    const response = await api.post(apiEndpoint.value, data)

    successMessage.value = `${isCategory.value ? 'Catégorie' : 'Marque'} créée avec succès !`

    // Émettre l'événement avec les données créées
    emit('created', response.data)

    // Fermer la modal après un court délai
    setTimeout(() => {
      closeModal()
    }, 1500)

  } catch (error) {
    console.error('Erreur lors de la création:', error)

    if (error.response?.data?.errors) {
      errors.value = Object.values(error.response.data.errors).flat()
    } else if (error.response?.data?.message) {
      errors.value = [error.response.data.message]
    } else {
      errors.value = [`Erreur lors de la création de ${isCategory.value ? 'la catégorie' : 'la marque'}`]
    }
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  resetForm()
  emit('close')
}

// Watcher pour réinitialiser le formulaire quand la modal s'ouvre
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

// Gestion de l'échap pour fermer
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.show) {
    closeModal()
  }
}

// Ajouter/retirer l'écouteur d'événements
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
