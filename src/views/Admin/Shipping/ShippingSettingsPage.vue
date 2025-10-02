<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="space-y-6">
      <!-- Zones de livraison -->
      <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Zones de livraison</h2>
          <button
            @click="openZoneModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            + Ajouter une zone
          </button>
        </div>

        <!-- Filtres zones -->
        <div class="mb-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recherche</label>
              <input
                v-model="shippingStore.filters.search"
                @input="debouncedFilter"
                type="text"
                placeholder="Nom de zone..."
                class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Type</label>
              <select 
                v-model="shippingStore.filters.type" 
                @change="filterZones"
                class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Tous</option>
                <option value="national">National</option>
                <option value="international">International</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="clearFilters"
                class="w-full bg-gray-500 hover:bg-gray-600 text-white p-2.5 rounded-lg"
              >
                Effacer filtres
              </button>
            </div>
          </div>
        </div>

        <!-- État de chargement -->
        <div v-if="shippingStore.isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600 dark:text-gray-400">Chargement des zones...</span>
        </div>

        <!-- Erreur -->
        <div v-else-if="shippingStore.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                Erreur de chargement
              </h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                {{ shippingStore.error }}
              </div>
              <div class="mt-3">
                <button
                  @click="loadZones"
                  class="bg-red-100 dark:bg-red-900/50 px-3 py-1 rounded text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/70"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des zones -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  @click="sortZones('name')"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div class="flex items-center">
                    Zone
                    <svg v-if="shippingStore.filters.sortField === 'name'" 
                         :class="{ 'transform rotate-180': shippingStore.filters.sortDirection === 'desc' }"
                         class="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th 
                  @click="sortZones('rates_count')"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div class="flex items-center">
                    Tarifs
                    <svg v-if="shippingStore.filters.sortField === 'rates_count'" 
                         :class="{ 'transform rotate-180': shippingStore.filters.sortDirection === 'desc' }"
                         class="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <tr v-for="zone in shippingStore.filteredZones" :key="zone.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ zone.name }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="country in zone.countries_codes.slice(0, 3)"
                      :key="country"
                      class="inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {{ shippingStore.getCountryName(country) }}
                    </span>
                    <span v-if="zone.countries_codes.length > 3" class="text-xs text-gray-500">
                      +{{ zone.countries_codes.length - 3 }} autres
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="zone.is_international 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'"
                    class="px-2 py-0.5 text-xs rounded"
                  >
                    {{ zone.is_international ? 'International' : 'National' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ zone.rates_count || 0 }} tarif(s)
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="manageRates(zone)"
                    class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                  >
                    Tarifs
                  </button>
                  <button
                    @click="editZone(zone)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  >
                    Éditer
                  </button>
                  <button
                    @click="openDeleteZoneConfirmation(zone.id)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
              <tr v-if="shippingStore.filteredZones.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {{ shippingStore.filters.search || shippingStore.filters.type ? 'Aucune zone trouvée avec ces filtres' : 'Aucune zone de livraison configurée' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Gestion des tarifs pour la zone sélectionnée -->
      <ShippingRatesManager
        v-if="shippingStore.selectedZone"
        :zone="shippingStore.selectedZone"
        @close="shippingStore.clearSelectedZone"
        @rate-updated="onRateUpdated"
      />

      <!-- Calculateur de frais (pour test) -->
      <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Calculateur de frais de livraison
        </h3>
        
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pays</label>
            <select 
              v-model="selectedCountry" 
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Sélectionner un pays</option>
              <option v-for="country in shippingStore.availableCountries" :key="country.code" :value="country.code">
                {{ country.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Montant commande (XOF)</label>
            <input
              v-model.number="orderAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="25000"
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
          </div>
          <div class="flex items-end">
            <button
              @click="calculate"
              :disabled="!canCalculate || isCalculating"
              class="w-full bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCalculating ? 'Calcul...' : 'Calculer' }}
            </button>
          </div>
        </div>

        <!-- Résultat du calcul -->
        <div v-if="calculationResult" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg">
          <h4 class="font-medium text-green-800 dark:text-green-200 mb-2">Résultat du calcul :</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">Zone :</span>
              <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ calculationResult.zone?.name || 'Non spécifié' }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Délai :</span>
              <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ calculationResult.delivery_time }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Coût :</span>
              <span class="ml-2 font-medium" :class="calculationResult.is_free_shipping ? 'text-green-600' : 'text-gray-900 dark:text-white'">
                {{ calculationResult.is_free_shipping ? 'Gratuit' : formatCurrency(calculationResult.shipping_cost) }}
              </span>
            </div>
            <div v-if="calculationResult.rate">
              <span class="text-gray-600 dark:text-gray-400">Minimum pour livraison gratuite :</span>
              <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ formatCurrency(calculationResult.rate.min_order) }}</span>
            </div>
          </div>
        </div>

        <div v-if="calculationError" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg">
          <p class="text-red-800 dark:text-red-200">{{ calculationError }}</p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ShippingZoneModal 
      v-if="showZoneModal"
      :zone="editingZone"
      @close="closeZoneModal"
      @saved="onZoneSaved"
    />

    <ConfirmationModal
      v-if="showDeleteZoneModal"
      title="Supprimer la zone"
      message="Êtes-vous sûr de vouloir supprimer cette zone de livraison ? Tous les tarifs associés seront également supprimés."
      confirmText="Supprimer définitivement"
      :isLoading="isDeleting"
      @confirm="confirmDeleteZone"
      @cancel="closeDeleteZoneModal"
    />

    <!-- Notifications -->
    <NotificationToast 
      v-if="notification.show"
      :type="notification.type"
      :message="notification.message"
      @close="closeNotification"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { debounce } from 'lodash'
import { useShippingStore } from '@/stores/shippings'
import { useShippingCalculator } from '@/composables/useShippingCalculator.js'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ShippingZoneModal from '@/components/shipping/ShippingZoneModal.vue'
import ShippingRatesManager from '@/components/shipping/ShippingRatesManager.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'
import NotificationToast from '@/components/ui/NotificationToast.vue'

const currentPageTitle = ref("Paramètres de Livraison")

// Stores et composables
const shippingStore = useShippingStore()
const {
  selectedCountry,
  orderAmount,
  calculationResult,
  isCalculating,
  calculationError,
  canCalculate,
  calculate,
  reset: resetCalculator
} = useShippingCalculator()

// États locaux
const showZoneModal = ref(false)
const showDeleteZoneModal = ref(false)
const editingZone = ref(null)
const zoneToDelete = ref(null)
const isDeleting = ref(false)

// Notifications
const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

// Méthodes utilitaires
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const showNotification = (type, message) => {
  notification.value = { show: true, type, message }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const closeNotification = () => {
  notification.value.show = false
}

// Gestion des zones
const loadZones = () => {
  shippingStore.fetchZones()
}

const debouncedFilter = debounce(() => {
  loadZones()
}, 300)

const filterZones = () => {
  loadZones()
}

const clearFilters = () => {
  shippingStore.clearFilters()
  loadZones()
}

const sortZones = (field) => {
  const currentField = shippingStore.filters.sortField
  const currentDirection = shippingStore.filters.sortDirection
  
  let newDirection = 'asc'
  if (field === currentField && currentDirection === 'asc') {
    newDirection = 'desc'
  }
  
  shippingStore.updateFilters({
    sortField: field,
    sortDirection: newDirection
  })
}

const openZoneModal = (zone = null) => {
  editingZone.value = zone
  showZoneModal.value = true
}

const closeZoneModal = () => {
  showZoneModal.value = false
  editingZone.value = null
}

const editZone = (zone) => {
  openZoneModal(zone)
}

const onZoneSaved = (savedZone, isEdit) => {
  closeZoneModal()
  
  if (isEdit) {
    showNotification('success', 'Zone modifiée avec succès')
  } else {
    showNotification('success', 'Zone créée avec succès')
  }
  
  // Rafraîchir la liste
  loadZones()
}

const openDeleteZoneConfirmation = (zoneId) => {
  zoneToDelete.value = zoneId
  showDeleteZoneModal.value = true
}

const closeDeleteZoneModal = () => {
  showDeleteZoneModal.value = false
  zoneToDelete.value = null
}

const confirmDeleteZone = async () => {
  if (!zoneToDelete.value) return
  
  isDeleting.value = true
  
  try {
    const result = await shippingStore.deleteZone(zoneToDelete.value)
    
    if (result.success) {
      showNotification('success', 'Zone supprimée avec succès')
      closeDeleteZoneModal()
    } else {
      showNotification('error', result.error || 'Erreur lors de la suppression')
    }
  } catch (error) {
    showNotification('error', 'Erreur lors de la suppression')
  } finally {
    isDeleting.value = false
  }
}

// Gestion des tarifs
const manageRates = (zone) => {
  shippingStore.setSelectedZone(zone)
}

const onRateUpdated = () => {
  // Rafraîchir les données si nécessaire
  if (shippingStore.selectedZone) {
    shippingStore.fetchRates(shippingStore.selectedZone.id)
  }
  loadZones() // Pour mettre à jour les compteurs
}

// Lifecycle
onMounted(async () => {
  await shippingStore.fetchAvailableCountries()
  loadZones()
})

// Watchers
watch(() => shippingStore.filters, () => {
  debouncedFilter()
}, { deep: true })
</script>