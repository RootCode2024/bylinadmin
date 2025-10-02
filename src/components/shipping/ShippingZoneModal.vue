<template>
  <Modal @close="$emit('close')">
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ zone ? 'Modifier' : 'Ajouter' }} une zone de livraison
      </h2>
    </template>
    
    <template #body>
      <form @submit.prevent="saveZone" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom de la zone *
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Bénin, Afrique de l'Ouest"
          >
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Codes pays *
          </label>
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(country, index) in form.countries_codes"
                :key="index"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {{ getCountryName(country) }} ({{ country }})
                <button
                  type="button"
                  @click="removeCountry(index)"
                  class="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <select
                v-model="newCountryCode"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un pays</option>
                <option 
                  v-for="country in availableCountries" 
                  :key="country.code" 
                  :value="country.code"
                  :disabled="form.countries_codes.includes(country.code)"
                >
                  {{ country.name }} ({{ country.code }})
                </option>
              </select>
              <button
                type="button"
                @click="addCountry"
                :disabled="!newCountryCode"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
          <p v-if="errors.countries_codes" class="mt-1 text-sm text-red-600">{{ errors.countries_codes }}</p>
        </div>

        <div>
          <label class="flex items-center">
            <input
              v-model="form.is_international"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
            >
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Zone internationale
            </span>
          </label>
        </div>

        <div v-if="submitError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg">
          <p class="text-red-800 dark:text-red-200 text-sm">{{ submitError }}</p>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useShippingStore } from '@/stores/shippings'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps({
  zone: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const shippingStore = useShippingStore()

// États du formulaire
const form = ref({
  name: '',
  countries_codes: [],
  is_international: false
})

const newCountryCode = ref('')
const isLoading = ref(false)
const submitError = ref('')
const errors = ref({})

// Computed
const availableCountries = computed(() => shippingStore.availableCountries)

const isFormValid = computed(() => {
  return form.value.name.trim() && form.value.countries_codes.length > 0
})

// Méthodes
const getCountryName = (countryCode) => {
  return shippingStore.getCountryName(countryCode)
}

const addCountry = () => {
  if (newCountryCode.value && !form.value.countries_codes.includes(newCountryCode.value)) {
    form.value.countries_codes.push(newCountryCode.value)
    newCountryCode.value = ''
    clearError('countries_codes')
  }
}

const removeCountry = (index) => {
  form.value.countries_codes.splice(index, 1)
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = 'Le nom de la zone est obligatoire'
  }
  
  if (form.value.countries_codes.length === 0) {
    errors.value.countries_codes = 'Au moins un pays doit être sélectionné'
  }
  
  return Object.keys(errors.value).length === 0
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const saveZone = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  submitError.value = ''
  
  try {
    let result
    
    if (props.zone) {
      // Modification
      result = await shippingStore.updateZone(props.zone.id, form.value)
    } else {
      // Création
      result = await shippingStore.createZone(form.value)
    }
    
    if (result.success) {
      emit('saved', result.data, !!props.zone)
    } else {
      submitError.value = result.error || 'Erreur lors de la sauvegarde'
    }
  } catch (error) {
    submitError.value = 'Erreur lors de la sauvegarde'
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(() => form.value.name, () => clearError('name'))
watch(() => form.value.countries_codes.length, () => clearError('countries_codes'))

// Lifecycle
onMounted(() => {
  if (props.zone) {
    form.value = {
      name: props.zone.name,
      countries_codes: [...props.zone.countries_codes],
      is_international: props.zone.is_international
    }
  }
})
</script>