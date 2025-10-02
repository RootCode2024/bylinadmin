<template>
  <Modal v-if="show" @close="closeModal" size="md" :fullScreenBackdrop="true">
    <template #header>
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        Modifier le stock
      </h2>
    </template>

    <template #body>
      <div class="no-scrollbar relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900 lg:p-10">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Informations produit -->
        <div class="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <img
                src="/images/product/product-01.jpg"
                class="w-16 h-16 rounded"
                alt="Product image"
              >
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ product?.name || 'Aucun nom' }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ product?.sku || 'Aucune référence' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Formulaire de stock -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="current-stock" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Stock actuel
            </label>
            <input
              id="current-stock"
              v-model.number="form.stock"
              type="number"
              min="0"
              class="w-full p-2.5 border rounded-lg"
            >
          </div>

          <div>
            <label for="stock-alert" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Niveau d'alerte
            </label>
            <input
              id="stock-alert"
              v-model.number="form.stock_alert"
              type="number"
              min="0"
              class="w-full p-2.5 border rounded-lg"
            >
          </div>
        </div>

        <!-- Barre de progression du stock -->
        <div class="pt-2">
          <div class="flex justify-between mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Niveau de stock</span>
            <span>{{ stockPercentage }}% ({{ form.stock }} unités)</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              class="h-2.5 rounded-full"
              :class="stockLevelClass"
              :style="`width: ${stockPercentage}%`"
            ></div>
          </div>
        </div>

        <!-- Historique optionnel -->
        <div v-if="showHistory" class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">
            Historique des mouvements
          </h3>
          <div class="space-y-3">
            <div
              v-for="(entry, index) in historyEntries"
              :key="index"
              class="flex items-center justify-between p-3 text-sm bg-gray-50 rounded-lg dark:bg-gray-700"
            >
              <span class="text-gray-700 dark:text-gray-300">{{ entry.date }}</span>
              <span class="font-medium" :class="entry.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ entry.change > 0 ? '+' : '' }}{{ entry.change }} unités
              </span>
              <span class="text-gray-500 dark:text-gray-400">{{ entry.reason }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">
              <svg class="w-4 h-4 mx-auto animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span v-else>Enregistrer</span>
          </button>
        </div>
      </form>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps({
  show: Boolean,
  product: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      name: '',
      sku: '',
      stock: 0,
      stock_alert: 5,
      images: []
    })
  },
  showHistory: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

// Form data
const form = ref({
  stock: 0,
  stock_alert: 5
})

// State
const isSubmitting = ref(false)

// Computed
const stockPercentage = computed(() => {
  const max = Math.max(form.value.stock, form.value.stock_alert * 3)
  return Math.min(100, (form.value.stock / max) * 100)
})

const stockLevelClass = computed(() => {
  if (form.value.stock === 0) return 'bg-red-600'
  if (form.value.stock <= form.value.stock_alert) return 'bg-yellow-500'
  return 'bg-green-600'
})

// Sample history data
const historyEntries = computed(() => [
  {
    date: 'Aujourd\'hui, 15:32',
    change: -3,
    reason: 'Vente #10025'
  },
  {
    date: 'Hier, 09:15',
    change: 50,
    reason: 'Réapprovisionnement'
  },
  {
    date: '05/06/2023',
    change: -2,
    reason: 'Retour client'
  }
])

// Watchers
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = {
      stock: newProduct.stock,
      stock_alert: newProduct.stock_alert || 5
    }
  }
}, { immediate: true })

// Methods
const closeModal = () => {
  emit('close')
}

const submitForm = async () => {
  try {
    isSubmitting.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('save', {
      ...props.product,
      ...form.value
    })

    closeModal()
  } catch (error) {
    console.error('Error updating stock:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
