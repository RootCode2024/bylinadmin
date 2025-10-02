<template>
  <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Tarifs pour {{ zone.name }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gérez les tarifs de livraison pour cette zone
        </p>
      </div>
      <div class="flex space-x-2">
        <button
          @click="openRateModal()"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + Ajouter un tarif
        </button>
        <button
          @click="$emit('close')"
          class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Fermer
        </button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="shippingStore.isLoadingRates" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
      <span class="ml-2 text-gray-600 dark:text-gray-400">Chargement des tarifs...</span>
    </div>

    <!-- Liste des tarifs -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Commande minimum
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tarif
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Délai
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          <tr v-for="rate in shippingStore.selectedZoneRates" :key="rate.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">
                {{ rate.min_order ? formatCurrency(rate.min_order) : 'Aucune' }}
              </div>
              <div v-if="rate.min_order" class="text-xs text-gray-500">
                Livraison gratuite si commande ≥ {{ formatCurrency(rate.min_order) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-medium" :class="rate.rate === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'">
                {{ rate.rate === 0 ? 'Gratuit' : formatCurrency(rate.rate) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ rate.delivery_time }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="editRate(rate)"
                class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
              >
                Éditer
              </button>
              <button
                @click="openDeleteRateConfirmation(rate.id)"
                class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                Supprimer
              </button>
            </td>
          </tr>
          <tr v-if="shippingStore.selectedZoneRates.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              Aucun tarif configuré pour cette zone
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modals -->
    <ShippingRateModal
      v-if="showRateModal"
      :rate="editingRate"
      :zone-id="zone.id"
      @close="closeRateModal"
      @saved="onRateSaved"
    />

    <ConfirmationModal
      v-if="showDeleteRateModal"
      title="Supprimer le tarif"
      message="Êtes-vous sûr de vouloir supprimer ce tarif de livraison ?"
      confirmText="Supprimer"
      :isLoading="isDeleting"
      @confirm="confirmDeleteRate"
      @cancel="closeDeleteRateModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useShippingStore } from '@/stores/shippings'
import ShippingRateModal from './ShippingRateModal.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'

const props = defineProps({
  zone: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'rate-updated'])

const shippingStore = useShippingStore()

// États locaux
const showRateModal = ref(false)
const showDeleteRateModal = ref(false)
const editingRate = ref(null)
const rateToDelete = ref(null)
const isDeleting = ref(false)

// Méthodes utilitaires
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

// Gestion des tarifs
const openRateModal = (rate = null) => {
  editingRate.value = rate
  showRateModal.value = true
}

const closeRateModal = () => {
  showRateModal.value = false
  editingRate.value = null
}

const editRate = (rate) => {
  openRateModal(rate)
}

const onRateSaved = () => {
  closeRateModal()
  emit('rate-updated')
}

const openDeleteRateConfirmation = (rateId) => {
  rateToDelete.value = rateId
  showDeleteRateModal.value = true
}

const closeDeleteRateModal = () => {
  showDeleteRateModal.value = false
  rateToDelete.value = null
}

const confirmDeleteRate = async () => {
  if (!rateToDelete.value) return
  
  isDeleting.value = true
  
  try {
    const result = await shippingStore.deleteRate(rateToDelete.value)
    
    if (result.success) {
      closeDeleteRateModal()
      emit('rate-updated')
    }
  } finally {
    isDeleting.value = false
  }
}

// Lifecycle
onMounted(() => {
  shippingStore.fetchRates(props.zone.id)
})
</script>