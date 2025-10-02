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
                v-model="zoneFilters.search"
                type="text"
                placeholder="Nom de zone..."
                class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Type</label>
              <select v-model="zoneFilters.type" class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Tous</option>
                <option value="national">National</option>
                <option value="international">International</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="clearZoneFilters"
                class="w-full bg-gray-500 hover:bg-gray-600 text-white p-2.5 rounded-lg"
              >
                Effacer filtres
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des zones -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarifs</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <tr v-for="zone in filteredZones" :key="zone.id">
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
                      {{ getCountryName(country) }}
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
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tarifs de livraison par zone -->
      <div v-if="selectedZone" class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Tarifs pour {{ selectedZone.name }}
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
              @click="selectedZone = null"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande minimum</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarif</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Délai</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <tr v-for="rate in selectedZoneRates" :key="rate.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ rate.min_order ? formatCurrency(rate.min_order) : 'Aucune' }}
                  <span v-if="rate.min_order" class="text-xs text-gray-500 block">
                    (livraison gratuite si commande ≥ {{ formatCurrency(rate.min_order) }})
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency(rate.rate) }}
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
              <tr v-if="selectedZoneRates.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucun tarif configuré pour cette zone
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Zone -->
    <Modal v-if="showZoneModal" @close="closeZoneModal">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ editingZone ? 'Modifier' : 'Ajouter' }} une zone de livraison
        </h2>
      </template>

      <template #body>
        <form @submit.prevent="saveZone" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom de la zone *
            </label>
            <input
              v-model="zoneForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: Bénin, Afrique de l'Ouest"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Codes pays *
            </label>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="(country, index) in zoneForm.countries_codes"
                  :key="index"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {{ getCountryName(country) }} ({{ country }})
                  <button
                    type="button"
                    @click="removeCountry(index)"
                    class="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              </div>
              <div class="flex gap-2">
                <select
                  v-model="newCountryCode"
                  class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Sélectionner un pays</option>
                  <option v-for="country in availableCountries" :key="country.code" :value="country.code">
                    {{ country.name }} ({{ country.code }})
                  </option>
                </select>
                <button
                  type="button"
                  @click="addCountry"
                  :disabled="!newCountryCode"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="zoneForm.is_international"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
              >
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Zone internationale
              </span>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="closeZoneModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="zoneLoading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ zoneLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Modal Tarif -->
    <Modal v-if="showRateModal" @close="closeRateModal">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ editingRate ? 'Modifier' : 'Ajouter' }} un tarif
        </h2>
      </template>

      <template #body>
        <form @submit.prevent="saveRate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Commande minimum pour livraison gratuite
            </label>
            <input
              v-model.number="rateForm.min_order"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: 50.00 (laisser vide si pas de minimum)"
            >
            <p class="text-xs text-gray-500 mt-1">
              Si renseigné, la livraison sera gratuite pour les commandes supérieures ou égales à ce montant
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tarif de livraison *
            </label>
            <input
              v-model.number="rateForm.rate"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: 5.90"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Délai de livraison *
            </label>
            <input
              v-model="rateForm.delivery_time"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: 3-5 jours, 24h, 1 semaine"
            >
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="closeRateModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="rateLoading"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {{ rateLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Modal de confirmation suppression zone -->
    <Modal v-if="showDeleteZoneModal" @close="closeDeleteZoneModal">
      <template #header>
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Supprimer la zone
          </h2>
        </div>
      </template>

      <template #body>
        <div class="mb-6">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Êtes-vous sûr de vouloir supprimer cette zone de livraison ? Tous les tarifs associés seront également supprimés.
          </p>

          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-3">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-medium text-red-800 dark:text-red-200">
                  Cette action est irréversible
                </p>
                <p class="text-sm text-red-700 dark:text-red-300 mt-1">
                  La zone et tous ses tarifs seront définitivement supprimés.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="closeDeleteZoneModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            @click="confirmDeleteZone"
            :disabled="deleteLoading"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleteLoading ? 'Suppression...' : 'Supprimer définitivement' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal de confirmation suppression tarif -->
    <Modal v-if="showDeleteRateModal" @close="closeDeleteRateModal">
      <template #header>
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Supprimer le tarif
          </h2>
        </div>
      </template>

      <template #body>
        <div class="mb-6">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce tarif de livraison ?
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="closeDeleteRateModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            @click="confirmDeleteRate"
            :disabled="deleteLoading"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleteLoading ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Notifications -->
    <div
      v-if="showSuccessNotification"
      class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
    >
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {{ successMessage }}
      </div>
    </div>

    <div
      v-if="showErrorNotification"
      class="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
    >
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {{ errorMessage }}
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Modal from '@/components/ui/Modal.vue'

const currentPageTitle = ref("Paramètres de Livraison")

// Données mockées - à remplacer par des appels API
const shippingZones = ref([
  {
    id: 1,
    name: "Bénin",
    countries_codes: ["BJ"],
    is_international: false,
    rates_count: 2
  },
  {
    id: 2,
    name: "Afrique de l'Ouest",
    countries_codes: ["NG", "TG", "GH", "CI", "SN"],
    is_international: true,
    rates_count: 1
  },
  {
    id: 3,
    name: "Europe",
    countries_codes: ["FR", "DE", "ES", "IT", "BE"],
    is_international: true,
    rates_count: 3
  }
])

const shippingRates = ref([
  // Bénin
  { id: 1, shipping_zone_id: 1, min_order: null, rate: 2.50, delivery_time: "24-48h" },
  { id: 2, shipping_zone_id: 1, min_order: 25.00, rate: 0.00, delivery_time: "24-48h" },
  // Afrique de l'Ouest
  { id: 3, shipping_zone_id: 2, min_order: null, rate: 15.00, delivery_time: "5-7 jours" },
  // Europe
  { id: 4, shipping_zone_id: 3, min_order: null, rate: 25.00, delivery_time: "7-10 jours" },
  { id: 5, shipping_zone_id: 3, min_order: 50.00, rate: 15.00, delivery_time: "7-10 jours" },
  { id: 6, shipping_zone_id: 3, min_order: 100.00, rate: 0.00, delivery_time: "7-10 jours" }
])

// Pays disponibles
const availableCountries = ref([
  { code: 'BJ', name: 'Bénin' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'TG', name: 'Togo' },
  { code: 'GH', name: 'Ghana' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'ES', name: 'Espagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'BE', name: 'Belgique' },
  { code: 'US', name: 'États-Unis' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'NE', name: 'Niger' }
])

// États des filtres
const zoneFilters = ref({
  search: '',
  type: ''
})

// États des modals
const showZoneModal = ref(false)
const showRateModal = ref(false)
const showDeleteZoneModal = ref(false)
const showDeleteRateModal = ref(false)

// États d'édition
const editingZone = ref(null)
const editingRate = ref(null)
const selectedZone = ref(null)
const zoneToDelete = ref(null)
const rateToDelete = ref(null)

// États de chargement
const zoneLoading = ref(false)
const rateLoading = ref(false)
const deleteLoading = ref(false)

// Formulaires
const zoneForm = ref({
  name: '',
  countries_codes: [],
  is_international: false
})

const rateForm = ref({
  shipping_zone_id: null,
  min_order: null,
  rate: 0,
  delivery_time: ''
})

const newCountryCode = ref('')

// États de notification
const showSuccessNotification = ref(false)
const showErrorNotification = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Computed
const filteredZones = computed(() => {
  let result = [...shippingZones.value]

  if (zoneFilters.value.search) {
    const searchTerm = zoneFilters.value.search.toLowerCase()
    result = result.filter(zone =>
      zone.name.toLowerCase().includes(searchTerm) ||
      zone.countries_codes.some(code =>
        getCountryName(code).toLowerCase().includes(searchTerm)
      )
    )
  }

  if (zoneFilters.value.type) {
    const isInternational = zoneFilters.value.type === 'international'
    result = result.filter(zone => zone.is_international === isInternational)
  }

  return result
})

const selectedZoneRates = computed(() => {
  if (!selectedZone.value) return []
  return shippingRates.value.filter(rate => rate.shipping_zone_id === selectedZone.value.id)
})

// Méthodes utilitaires
const getCountryName = (code) => {
  const country = availableCountries.value.find(c => c.code === code)
  return country ? country.name : code
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

// Méthodes de notification
const showSuccess = (message) => {
  successMessage.value = message
  showSuccessNotification.value = true
  setTimeout(() => {
    showSuccessNotification.value = false
  }, 3000)
}

const showError = (message) => {
  errorMessage.value = message
  showErrorNotification.value = true
  setTimeout(() => {
    showErrorNotification.value = false
  }, 3000)
}

// Gestion des zones
const openZoneModal = (zone = null) => {
  editingZone.value = zone
  if (zone) {
    zoneForm.value = {
      name: zone.name,
      countries_codes: [...zone.countries_codes],
      is_international: zone.is_international
    }
  } else {
    zoneForm.value = {
      name: '',
      countries_codes: [],
      is_international: false
    }
  }
  showZoneModal.value = true
}

const closeZoneModal = () => {
  showZoneModal.value = false
  editingZone.value = null
  newCountryCode.value = ''
}

const addCountry = () => {
  if (newCountryCode.value && !zoneForm.value.countries_codes.includes(newCountryCode.value)) {
    zoneForm.value.countries_codes.push(newCountryCode.value)
    newCountryCode.value = ''
  }
}

const removeCountry = (index) => {
  zoneForm.value.countries_codes.splice(index, 1)
}

const saveZone = async () => {
  if (!zoneForm.value.name || zoneForm.value.countries_codes.length === 0) {
    showError('Veuillez remplir tous les champs requis')
    return
  }

  zoneLoading.value = true
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingZone.value) {
      // Mise à jour
      const index = shippingZones.value.findIndex(z => z.id === editingZone.value.id)
      if (index !== -1) {
        shippingZones.value[index] = {
          ...editingZone.value,
          ...zoneForm.value
        }
      }
      showSuccess('Zone modifiée avec succès')
    } else {
      // Création
      const newZone = {
        id: Date.now(),
        ...zoneForm.value,
        rates_count: 0
      }
      shippingZones.value.push(newZone)
      showSuccess('Zone créée avec succès')
    }

    closeZoneModal()
  } catch (error) {
    showError('Erreur lors de la sauvegarde')
  } finally {
    zoneLoading.value = false
  }
}

const editZone = (zone) => {
  openZoneModal(zone)
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

  deleteLoading.value = true
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Supprimer la zone
    const zoneIndex = shippingZones.value.findIndex(z => z.id === zoneToDelete.value)
    if (zoneIndex !== -1) {
      shippingZones.value.splice(zoneIndex, 1)
    }

    // Supprimer les tarifs associés
    const ratesToDelete = shippingRates.value.filter(r => r.shipping_zone_id === zoneToDelete.value)
    ratesToDelete.forEach(rate => {
      const rateIndex = shippingRates.value.findIndex(r => r.id === rate.id)
      if (rateIndex !== -1) {
        shippingRates.value.splice(rateIndex, 1)
      }
    })

    // Fermer la vue des tarifs si c'était la zone sélectionnée
    if (selectedZone.value && selectedZone.value.id === zoneToDelete.value) {
      selectedZone.value = null
    }

    showSuccess('Zone supprimée avec succès')
    closeDeleteZoneModal()
  } catch (error) {
    showError('Erreur lors de la suppression')
  } finally {
    deleteLoading.value = false
  }
}

// Gestion des tarifs
const manageRates = (zone) => {
  selectedZone.value = zone
}

const openRateModal = (rate = null) => {
  editingRate.value = rate
  if (rate) {
    rateForm.value = {
      shipping_zone_id: rate.shipping_zone_id,
      min_order: rate.min_order,
      rate: rate.rate,
      delivery_time: rate.delivery_time
    }
  } else {
    rateForm.value = {
      shipping_zone_id: selectedZone.value.id,
      min_order: null,
      rate: 0,
      delivery_time: ''
    }
  }
  showRateModal.value = true
}

const closeRateModal = () => {
  showRateModal.value = false
  editingRate.value = null
}

const saveRate = async () => {
  if (!rateForm.value.rate || !rateForm.value.delivery_time) {
    showError('Veuillez remplir tous les champs requis')
    return
  }

  rateLoading.value = true
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingRate.value) {
      // Mise à jour
      const index = shippingRates.value.findIndex(r => r.id === editingRate.value.id)
      if (index !== -1) {
        shippingRates.value[index] = {
          ...editingRate.value,
          ...rateForm.value
        }
      }
      showSuccess('Tarif modifié avec succès')
    } else {
      // Création
      const newRate = {
        id: Date.now(),
        ...rateForm.value
      }
      shippingRates.value.push(newRate)

      // Mettre à jour le compteur de tarifs de la zone
      const zone = shippingZones.value.find(z => z.id === selectedZone.value.id)
      if (zone) {
        zone.rates_count = (zone.rates_count || 0) + 1
        selectedZone.value.rates_count = zone.rates_count
      }

      showSuccess('Tarif créé avec succès')
    }

    closeRateModal()
  } catch (error) {
    showError('Erreur lors de la sauvegarde')
  } finally {
    rateLoading.value = false
  }
}

const editRate = (rate) => {
  openRateModal(rate)
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

  deleteLoading.value = true
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const rateIndex = shippingRates.value.findIndex(r => r.id === rateToDelete.value)
    if (rateIndex !== -1) {
      const rate = shippingRates.value[rateIndex]
      shippingRates.value.splice(rateIndex, 1)

      // Mettre à jour le compteur de tarifs de la zone
      const zone = shippingZones.value.find(z => z.id === rate.shipping_zone_id)
      if (zone) {
        zone.rates_count = Math.max((zone.rates_count || 1) - 1, 0)
        if (selectedZone.value && selectedZone.value.id === zone.id) {
          selectedZone.value.rates_count = zone.rates_count
        }
      }
    }

    showSuccess('Tarif supprimé avec succès')
    closeDeleteRateModal()
  } catch (error) {
    showError('Erreur lors de la suppression')
  } finally {
    deleteLoading.value = false
  }
}

// Autres méthodes
const clearZoneFilters = () => {
  zoneFilters.value = {
    search: '',
    type: ''
  }
}

// Lifecycle
onMounted(() => {
  // Charger les données initiales si nécessaire
})
</script>
