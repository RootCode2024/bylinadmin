<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <!-- Filtres avancés -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">N° de suivi</label>
            <input
              v-model="filters.trackingNumber"
              type="text"
              placeholder="XYZ123456789"
              class="w-full p-2.5 border rounded-lg"
            >
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Statut</label>
            <select v-model="filters.status" class="w-full p-2.5 border rounded-lg">
              <option value="">Tous</option>
              <option value="preparing">En préparation</option>
              <option value="shipped">Expédié</option>
              <option value="delivered">Livré</option>
              <option value="delayed">Retardé</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
            <input
              v-model="filters.date"
              type="date"
              class="w-full p-2.5 border rounded-lg"
            >
          </div>
          <div class="flex items-end">
            <button
              @click="exportShipments"
              class="w-full bg-gray-200 hover:bg-gray-300 p-2.5 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500"
            >
              Exporter
            </button>
          </div>
        </div>
      </div>

      <!-- Tableau des expéditions -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° de suivi</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière mise à jour</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <tr v-for="shipment in paginatedShipments" :key="shipment.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                #{{ shipment.order_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ shipment.customer_name }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ shipment.customer_email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ shipment.tracking_number }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': shipment.status === 'preparing',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': shipment.status === 'shipped',
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': shipment.status === 'delivered',
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': shipment.status === 'delayed'
                  }"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusLabel(shipment.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDateTime(shipment.last_update) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="trackShipment(shipment)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                >
                  Suivre
                </button>
                <button
                  @click="notifyCustomer(shipment)"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                >
                  Notifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        :current-page="pagination.currentPage"
        :total-items="filteredShipments.length"
        :per-page="pagination.perPage"
        @page-changed="changePage"
        class="mt-6"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Pagination from '@/components/ui/Pagination.vue'

const currentPageTitle = ref("Suivi des Expéditions")

// Données mockées
const shipments = ref([
  {
    id: 1,
    order_id: 10045,
    customer_name: "Jean Dupont",
    customer_email: "jean.dupont@example.com",
    tracking_number: "LP123456789FR",
    status: "shipped",
    carrier: "La Poste",
    last_update: "2023-11-15T14:30:00",
    estimated_delivery: "2023-11-18"
  },
  // Plus d'expéditions...
])

const filters = ref({
  trackingNumber: '',
  status: '',
  date: '',
  carrier: ''
})

const pagination = ref({
  currentPage: 1,
  perPage: 5
})

// Expéditions filtrées
const filteredShipments = computed(() => {
  let result = [...shipments.value]

  if (filters.value.trackingNumber) {
    result = result.filter(s =>
      s.tracking_number.includes(filters.value.trackingNumber))
  }

  if (filters.value.status) {
    result = result.filter(s => s.status === filters.value.status)
  }

  if (filters.value.date) {
    const filterDate = new Date(filters.value.date).toDateString()
    result = result.filter(s =>
      new Date(s.last_update).toDateString() === filterDate)
  }

  if (filters.value.carrier) {
    result = result.filter(s => s.carrier === filters.value.carrier)
  }

  return result
})

const paginatedShipments = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return filteredShipments.value.slice(start, end)
})

const getStatusLabel = (status) => {
  const labels = {
    preparing: "En préparation",
    shipped: "Expédié",
    delivered: "Livré",
    delayed: "Retardé"
  }
  return labels[status] || status
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR')
}

const trackShipment = (shipment) => {
  console.log("Suivi du colis:", shipment.tracking_number)
  // Ici vous pourriez ouvrir un modal ou rediriger vers le suivi
}

const notifyCustomer = (shipment) => {
  console.log("Notification envoyée à:", shipment.customer_email)
}

const exportShipments = () => {
  console.log("Export des expéditions en cours...")
}

const changePage = (page) => {
  pagination.value.currentPage = page
}
</script>
