<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <!-- Statistiques -->
      <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-5">
        <StatCard
          title="Commandes totales"
          :value="totalOrders"
          icon="ShoppingBag"
          :trend="stats.orderTrend"
        />
        <StatCard
          title="En traitement"
          :value="stats.processingCount"
          icon="PackageOpen"
          trend="5%"
        />
        <StatCard
          title="Assignées"
          :value="stats.assignedCount"
          icon="Handshake"
          trend="12%"
          trend-positive
        />
        <StatCard
          title="Expédiées"
          :value="stats.shippedCount"
          icon="Truck"
          trend="8%"
          trend-positive
        />
        <StatCard
          title="Chiffre d'affaires"
          :value="formatCurrency(totalRevenue)"
          icon="Percent"
          trend="8%"
          trend-positive
        />
      </div>

      <!-- Filtres avancés -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Statut</label>
            <select
              v-model="filters.status"
              @change="applyFilters"
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tous</option>
              <option v-for="status in orderStatuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Statut livraison</label>
            <select
              v-model="filters.shipmentStatus"
              @change="applyFilters"
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tous</option>
              <option v-for="status in shipmentStatuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Client</label>
            <input
              v-model="filters.user"
              @input="debouncedFilter"
              type="text"
              placeholder="Nom ou email"
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Livreur</label>
            <input
              v-model="filters.deliveryService"
              @input="debouncedFilter"
              type="text"
              placeholder="Nom du livreur"
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date début</label>
            <input
              v-model="filters.startDate"
              @change="applyFilters"
              type="date"
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
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
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600 dark:text-gray-400">Chargement des commandes...</span>
      </div>

      <!-- Tableau des commandes -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th
                @click="sortOrders('order_number')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div class="flex items-center">
                  Commande
                  <svg v-if="sortField === 'order_number'"
                       :class="{ 'transform rotate-180': sortDirection === 'desc' }"
                       class="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignation</th>
              <th
                @click="sortOrders('total')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div class="flex items-center">
                  Montant
                  <svg v-if="sortField === 'total'"
                       :class="{ 'transform rotate-180': sortDirection === 'desc' }"
                       class="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th
                @click="sortOrders('created_at')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div class="flex items-center">
                  Date
                  <svg v-if="sortField === 'created_at'"
                       :class="{ 'transform rotate-180': sortDirection === 'desc' }"
                       class="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <tr v-for="(order, index) in paginatedOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ (pagination.currentPage - 1) * pagination.perPage + index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                <div class="space-y-4">
                  <div>#{{ order.order_number }}</div>
                  <div v-if="order.shipment?.tracking_number" class="text-xs text-gray-500 dark:text-gray-400 flex space-x-2.5">
                    <ShoppingCart class="w-4 h-4" /> <span>{{ order.shipment.tracking_number }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="order.user.avatar_url"
                      class="h-10 w-10 rounded-full object-cover"
                      :src="order.user.avatar_url"
                      :alt="order.user.name"
                      @error="handleImageError"
                    >
                    <div v-else class="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-center">
                      <span class="text-gray-400" style="font-size: 10px;">Aucune <br/> image</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ order.user.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ order.user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="order.is_assigned && order.assignment_details" class="text-sm">
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ order.assignment_details.delivery_service_name }}
                  </div>
                  <div class="text-gray-500 dark:text-gray-400">
                    {{ order.assignment_details.assigned_date }}
                  </div>
                  <div v-if="order.shipment?.status" class="mt-1">
                    <span :class="shipmentStatusClasses(order.shipment.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ getShipmentStatusLabel(order.shipment.status) }}
                    </span>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                  Non assignée
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(order.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="orderStatusClasses(order.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(order.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-3">
                <button
                  @click="viewOrder(order)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <EyeIcon class="w-4 h-4" title="Voir" />
                </button>
                <button
                  v-if="order.status === 'paid'"
                  @click="showShippingModal(order)"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                >
                  <TruckIcon class="h-4 w-4" title="Assigner un livreur" />
                </button>
                <button
                  v-if="order.is_assigned && order.delivery_person"
                  @click="contactDeliveryPerson(order.delivery_person)"
                  class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  <ChatBubbleLeftRightIcon class="h-4 w-4" title="Contacter le livreur" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="8" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                {{ hasActiveFilters ? 'Aucune commande trouvée avec ces filtres' : 'Aucune commande trouvée' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="!loading && filteredOrders.length > 0"
        :current-page="pagination.currentPage"
        :total-items="filteredOrders.length"
        :per-page="pagination.perPage"
        @page-changed="changePage"
        class="mt-6"
      />
    </div>

    <!-- Modals -->
    <OrderDetailModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null"
      @update-status="updateOrderStatus"
      @contact-delivery-person="contactDeliveryPerson"
    />

    <ShippingModal
      v-if="orderToShip"
      :order="orderToShip"
      @close="orderToShip = null"
      @confirm="processShipping"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'lodash'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Pagination from '@/components/ui/Pagination.vue'
import StatCard from '@/components/ui/StatCard.vue'
import OrderDetailModal from '@/components/orders/OrderDetailModal.vue'
import ShippingModal from '@/components/orders/ShippingModal.vue'
import { useOrdersStore } from '@/stores/orders'
import { useShippingStore } from '@/stores/shippings'
import { EyeIcon, ChatBubbleLeftRightIcon, TruckIcon } from '@heroicons/vue/24/outline'
import { ShoppingCart } from 'lucide-vue-next'

const currentPageTitle = ref("Liste des Commandes")

const ordersStore = useOrdersStore()
const shipmentsStore = useShippingStore()

// Données
const orders = ref([])
const loading = ref(true)
const selectedOrder = ref(null)
const orderToShip = ref(null)

// Tri
const sortField = ref('created_at')
const sortDirection = ref('desc')

// Filtres
const filters = ref({
  status: '',
  shipmentStatus: '',
  user: '',
  deliveryService: '',
  startDate: '',
  endDate: ''
})

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 10
})

// Options
const orderStatuses = [
  { value: 'paid', label: 'Payé' },
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En traitement' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' }
]

const shipmentStatuses = [
  { value: 'paid', label: 'Payé' },
  { value: 'pending', label: 'En attente' },
  { value: 'assigned', label: 'Assignée' },
  { value: 'picked_up', label: 'Récupérée' },
  { value: 'in_transit', label: 'En transit' },
  { value: 'out_for_delivery', label: 'En livraison' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'failed', label: 'Échec' },
  { value: 'returned', label: 'Retournée' },
  { value: 'cancelled', label: 'Annulée' }
]

// Computed
const hasActiveFilters = computed(() => {
  return filters.value.status ||
         filters.value.shipmentStatus ||
         filters.value.user ||
         filters.value.deliveryService ||
         filters.value.startDate ||
         filters.value.endDate
})

const filteredOrders = computed(() => {
  let result = [...orders.value]

  // Filtrage par statut de commande
  if (filters.value.status) {
    result = result.filter(o => o.status === filters.value.status)
  }

  // Filtrage par statut de livraison
  if (filters.value.shipmentStatus) {
    result = result.filter(o => o.shipment?.status === filters.value.shipmentStatus)
  }

  // Filtrage par client
  if (filters.value.user) {
    const searchTerm = filters.value.user.toLowerCase()
    result = result.filter(o =>
      o.user.name.toLowerCase().includes(searchTerm) ||
      o.user.email.toLowerCase().includes(searchTerm))
  }

  // Filtrage par livreur
  if (filters.value.deliveryService) {
    const searchTerm = filters.value.deliveryService.toLowerCase()
    result = result.filter(o =>
      o.delivery_person?.name.toLowerCase().includes(searchTerm) ||
      o.assignment_details?.delivery_service_name.toLowerCase().includes(searchTerm))
  }

  // Filtrage par date
  if (filters.value.startDate) {
    result = result.filter(o => new Date(o.date) >= new Date(filters.value.startDate))
  }

  if (filters.value.endDate) {
    result = result.filter(o => new Date(o.date) <= new Date(filters.value.endDate))
  }

  // Tri
  result.sort((a, b) => {
    const direction = sortDirection.value === 'asc' ? 1 : -1

    switch (sortField.value) {
      case 'order_number':
        return a.order_number.localeCompare(b.order_number) * direction
      case 'total':
        return (a.total - b.total) * direction
      case 'created_at':
        return (new Date(a.created_at) - new Date(b.created_at)) * direction
      default:
        return 0
    }
  })

  return result
})

const paginatedOrders = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return filteredOrders.value.slice(start, end)
})

const totalOrders = computed(() => orders.value.length)

const totalRevenue = computed(() => {
  return orders.value
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + parseFloat(order.total), 0);
});

const stats = computed(() => {
  const processingCount = orders.value.filter(o => o.status === 'processing').length
  const assignedCount = orders.value.filter(o => o.is_assigned).length
  const shippedCount = orders.value.filter(o => o.status === 'shipped').length
  const orderTrend = orders.value.length > 0
    ? ((assignedCount / orders.value.length) * 100).toFixed(1) + '%'
    : '0%'

  return { processingCount, assignedCount, shippedCount, orderTrend }
})

// Méthodes
const orderStatusClasses = (status) => {
  const classes = {
    paid: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const shipmentStatusClasses = (status) => {
  const classes = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300',
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    picked_up: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    returned: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const getStatusLabel = (status) => {
  const statusObj = orderStatuses.find(s => s.value === status)
  return statusObj ? statusObj.label : status
}

const getShipmentStatusLabel = (status) => {
  const statusObj = shipmentStatuses.find(s => s.value === status)
  return statusObj ? statusObj.label : status
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const handleImageError = (event) => {
  event.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(event.target.alt) + '&background=6366f1&color=ffffff'
}

const viewOrder = (order) => {
  selectedOrder.value = order
}

const showShippingModal = (order) => {
  orderToShip.value = order
}

const contactDeliveryPerson = (deliveryPerson) => {
  if (deliveryPerson?.phone) {
    window.open(`tel:${deliveryPerson.phone}`)
  } else if (deliveryPerson?.email) {
    window.open(`mailto:${deliveryPerson.email}`)
  }
}

const updateOrderStatus = async ({ orderId, shipmentId, newStatus }) => {
  try {
    // Mettre à jour l'état local immédiatement pour un feedback visuel
    const orderIndex = orders.value.findIndex(o => o.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = newStatus
    }

    // Mettre à jour via l'API
    await ordersStore.updateOrderStatus(orderId, newStatus)

    // Si un shipmentId est fourni, mettre à jour l'expédition aussi
    if (shipmentId && shipmentId !== 'undefined') {
      await shipmentsStore.updateShipmentStatus(shipmentId, newStatus)
    }

    // Afficher un message de succès
    console.log('Statut mis à jour avec succès')

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)

    // Revert local state on error
    const orderIndex = orders.value.findIndex(o => o.id === orderId)
    if (orderIndex !== -1 && selectedOrder.value) {
      orders.value[orderIndex].status = selectedOrder.value.status
    }

    // Afficher l'erreur à l'utilisateur
    alert(error.message || 'Erreur lors de la mise à jour du statut')
  }
}

const processShipping = (shippingData) => {
  const orderIndex = orders.value.findIndex(o => o.id === shippingData.orderId)
  if (orderIndex !== -1) {
    orders.value[orderIndex].status = 'shipped'
    orders.value[orderIndex].is_assigned = true
    orders.value[orderIndex].shipment = {
      tracking_number: shippingData.trackingNumber,
      status: 'shipped',
      assigned_at: new Date().toISOString()
    }
    orders.value[orderIndex].assignment_details = {
      delivery_service_name: shippingData.carrier?.name,
      assigned_date: new Date().toLocaleDateString('fr-FR')
    }
  }
  orderToShip.value = null
}

const changePage = (page) => {
  pagination.value.currentPage = page
}

const sortOrders = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }

  pagination.value.currentPage = 1
}

const applyFilters = () => {
  pagination.value.currentPage = 1
}

const debouncedFilter = debounce(() => {
  applyFilters()
}, 300)

const clearFilters = () => {
  filters.value = {
    status: '',
    shipmentStatus: '',
    user: '',
    deliveryService: '',
    startDate: '',
    endDate: ''
  }
  pagination.value.currentPage = 1
}

// Initialisation
onMounted(async () => {
  try {
    orders.value = await ordersStore.fetchOrders()
  } finally {
    loading.value = false
  }
})

// Watchers
watch(() => filteredOrders.value.length, () => {
  if (pagination.value.currentPage > Math.ceil(filteredOrders.value.length / pagination.value.perPage)) {
    pagination.value.currentPage = 1
  }
})
</script>
