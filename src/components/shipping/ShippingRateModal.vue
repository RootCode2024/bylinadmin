<template>
  <Modal @close="$emit('close')">
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ rate ? 'Modifier' : 'Ajouter' }} un tarif
      </h2>
    </template>
    
    <template #body>
      <form @submit.prevent="saveRate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Commande minimum pour livraison gratuite
          </label>
          <input
            v-model.number="form.min_order"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: 25000 (laisser vide si pas de minimum)"
          >
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Si renseigné, la livraison sera gratuite pour les commandes supérieures ou égales à ce montant
          </p>
          <p v-if="errors.min_order" class="mt-1 text-sm text-red-600">{{ errors.min_order }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tarif de livraison *
          </label>
          <input
            v-model.number="form.rate"
            type="number"
            step="0.01"
            min="0"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: 2500"
          >
          <p v-if="errors.rate" class="mt-1 text-sm text-red-600">{{ errors.rate }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Délai de livraison *
          </label>
          <input
            v-model="form.delivery_time"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: 3-5 jours, 24h, 1 semaine"
          >
          <p v-if="errors.delivery_time" class="mt-1 text-sm text-red-600">{{ errors.delivery_time }}</p>
        </div>

        <!-- Aperçu du tarif -->
        <div v-if="isFormValid" class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
          <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Aperçu du tarif :</h4>
          <div class="text-sm text-blue-700 dark:text-blue-300">
            <p v-if="form.min_order">
              • Commandes < {{ formatCurrency(form.min_order) }} : {{ formatCurrency(form.rate) }}
            </p>
            <p v-if="form.min_order">
              • Commandes ≥ {{ formatCurrency(form.min_order) }} : Livraison gratuite
            </p>
            <p v-else>
              • Toutes les commandes : {{ form.rate === 0 ? 'Livraison gratuite' : formatCurrency(form.rate) }}
            </p>
            <p>• Délai de livraison : {{ form.delivery_time }}</p>
          </div>
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
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  rate: {
    type: Object,
    default: null
  },
  zoneId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'saved'])

const shippingStore = useShippingStore()

// États du formulaire
const form = ref({
  shipping_zone_id: props.zoneId,
  min_order: null,
  rate: 0,
  delivery_time: ''
})

const isLoading = ref(false)
const submitError = ref('')
const errors = ref({})

// Computed
const isFormValid = computed(() => {
  return form.value.rate !== null && 
         form.value.rate >= 0 && 
         form.value.delivery_time.trim()
})

// Méthodes
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const validateForm = () => {
  errors.value = {}
  
  if (form.value.rate === null || form.value.rate < 0) {
    errors.value.rate = 'Le tarif doit être un nombre positif'
  }
  
  if (form.value.min_order !== null && form.value.min_order < 0) {
    errors.value.min_order = 'Le montant minimum doit être positif'
  }
  
  if (!form.value.delivery_time.trim()) {
    errors.value.delivery_time = 'Le délai de livraison est obligatoire'
  }
  
  return Object.keys(errors.value).length === 0
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const saveRate = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  submitError.value = ''
  
  try {
    let result
    
    if (props.rate) {
      // Modification
      result = await shippingStore.updateRate(props.rate.id, form.value)
    } else {
      // Création
      result = await shippingStore.createRate(form.value)
    }
    
    if (result.success) {
      emit('saved', result.data, !!props.rate)
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
watch(() => form.value.rate, () => clearError('rate'))
watch(() => form.value.min_order, () => clearError('min_order'))
watch(() => form.value.delivery_time, () => clearError('delivery_time'))

// Lifecycle
onMounted(() => {
  if (props.rate) {
    form.value = {
      shipping_zone_id: props.rate.shipping_zone_id,
      min_order: props.rate.min_order,
      rate: props.rate.rate,
      delivery_time: props.rate.delivery_time
    }
  }
})
</script>