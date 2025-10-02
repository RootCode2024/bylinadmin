<template>
  <AdminLayout>
    <PageBreadcrumb
      :title="pageTitle"
      :breadcrumbs="breadcrumbs"
    />

    <!-- En-tête client -->
    <div class="bg-white rounded-lg shadow mb-6 dark:bg-gray-800">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="goBack"
              class="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowLeftIcon class="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div class="flex items-center space-x-3">
              <img
                v-if="customer?.avatar_url"
                class="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                :src="customer?.avatar_url"
                :alt="`Avatar de ${customer?.name}`"
                @error="handleImageError"
              >
              <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                  Commandes de {{ customer?.name }}
                </h1>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ customer?.email }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">Total des commandes</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ orders.length }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">Montant total</p>
              <p class="text-lg font-semibold text-green-600 dark:text-green-400">
                {{ formatCurrency(stats.total_spent) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres et statistiques -->
    <div class="bg-white rounded-lg shadow mb-6 dark:bg-gray-800">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Recherche -->
            <div class="relative">
              <MagnifyingGlassIcon class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="filters.search"
                type="text"
                placeholder="Rechercher par numéro de commande..."
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                @input="debouncedSearch"
              />
            </div>

            <!-- Filtre par statut -->
            <select
              v-model="filters.status"
              @change="loadOrders"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
              <option value="refunded">Remboursée</option>
            </select>

            <!-- Filtre par période -->
            <select
              v-model="filters.period"
              @change="loadOrders"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <button
              @click="exportOrders"
              class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
              Exporter
            </button>
            <button
              @click="loadOrders"
              class="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <ArrowPathIcon class="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="px-6 py-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ stats.pending || 0 }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">En attente</div>
          </div>
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {{ stats.processing || 0 }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">En traitement</div>
          </div>
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ stats.delivered || 0 }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Livrées</div>
          </div>
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              {{ stats.cancelled || 0 }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Annulées</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">Chargement des commandes...</span>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 dark:bg-red-900/20 dark:border-red-800">
      <div class="flex">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-3 mt-0.5" />
        <div class="text-red-700 dark:text-red-400">
          <p class="font-medium">Erreur</p>
          <p class="text-sm mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Liste des commandes -->
    <div v-if="!loading && !error" class="bg-white rounded-lg shadow dark:bg-gray-800">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">
          Commandes ({{ pagination.total }})
        </h2>
      </div>

      <div v-if="orders.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Commande
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Articles
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      #{{ order.order_number }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      ID: {{ order.id }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(order.created_at) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatTime(order.created_at) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getOrderStatusClass(order.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getOrderStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ order.items_count }} article{{ order.items_count > 1 ? 's' : '' }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ order.total_quantity }} unité{{ order.total_quantity > 1 ? 's' : '' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(order.total) }}
                </div>
                <div v-if="order.discount_amount > 0" class="text-sm text-green-600 dark:text-green-400">
                  -{{ formatCurrency(order.discount_amount) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewOrder(order)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Voir
                  </button>
                  <button
                    v-if="canEditOrder(order)"
                    @click="editOrder(order)"
                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Modifier
                  </button>
                  <div class="relative" v-if="canPerformActions(order)">
                    <button
                      @click="toggleOrderActions(order.id)"
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <EllipsisVerticalIcon class="h-5 w-5" />
                    </button>
                    <div
                      v-if="showOrderActions === order.id"
                      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600"
                    >
                      <div class="py-1">
                        <button
                          v-if="order.status === 'pending'"
                          @click="updateOrderStatus(order, 'processing')"
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Mettre en traitement
                        </button>
                        <button
                          v-if="order.status === 'processing'"
                          @click="updateOrderStatus(order, 'shipped')"
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Marquer comme expédiée
                        </button>
                        <button
                          v-if="order.status === 'shipped'"
                          @click="updateOrderStatus(order, 'delivered')"
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Marquer comme livrée
                        </button>
                        <button
                          v-if="['pending', 'processing'].includes(order.status)"
                          @click="confirmCancelOrder(order)"
                          class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Annuler la commande
                        </button>
                        <button
                          @click="duplicateOrder(order)"
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Dupliquer
                        </button>
                        <button
                          @click="printOrder(order)"
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Imprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-12">
        <ShoppingBagIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune commande</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ce client n'a pas encore passé de commande.
        </p>
      </div>

      <!-- Pagination -->
      <div v-if="orders.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {{ pagination.from }} à {{ pagination.to }} sur {{ pagination.total }} commandes
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="goToPage(pagination.current_page - 1)"
              :disabled="pagination.current_page <= 1"
              class="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Page {{ pagination.current_page }} sur {{ pagination.last_page }}
            </span>
            <button
              @click="goToPage(pagination.current_page + 1)"
              :disabled="pagination.current_page >= pagination.last_page"
              class="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation d'annulation -->
    <Modal v-if="showCancelModal" @close="showCancelModal = false">
      <template #header>
        <div class="flex items-center">
          <div class="flex-shrink-0 h-8 w-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
            <ExclamationTriangleIcon class="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Annuler la commande
          </h2>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir annuler la commande #{{ orderToCancel?.order_number }} ?
            Cette action est irréversible.
          </p>
          <div>
            <label for="cancellation_reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Raison de l'annulation
            </label>
            <textarea
              id="cancellation_reason"
              v-model="cancellationReason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              placeholder="Expliquez la raison de l'annulation..."
            ></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="showCancelModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              @click="confirmOrderCancellation"
              :disabled="!cancellationReason.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer l'annulation
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Modal from '@/components/ui/Modal.vue'
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  EllipsisVerticalIcon,
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'
import { useCustomersStore } from '@/stores/customers'
import { useOrdersStore } from '@/stores/orders'

const route = useRoute()
const router = useRouter()
const customersStore = useCustomersStore()
const ordersStore = useOrdersStore()

// État local
const loading = ref(true)
const error = ref('')
const customer = ref(null)
const orders = ref([])
const showOrderActions = ref(null)
const showCancelModal = ref(false)
const orderToCancel = ref(null)
const cancellationReason = ref('')

// Filtres
const filters = reactive({
  search: '',
  status: '',
  period: ''
})

// Pagination
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0
})

// Statistiques
const stats = ref({
  total_spent: 0,
  pending: 0,
  processing: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
  refunded: 0
})

// Computed
const pageTitle = computed(() => {
  return customer.value ? `Commandes de ${customer.value.name}` : 'Commandes du client'
})

const breadcrumbs = computed(() => [
  { name: 'Accueil', href: '/' },
  { name: 'Clients', href: '/customers' },
  { name: customer.value?.name || 'Client', href: `/customers/${route.params.customerId}` },
  { name: 'Commandes', href: '#' }
])

const totalSpent = computed(() => {
  return orders.value.reduce((total, order) => total + (order.total || 0), 0)
})

// Méthodes utilitaires
const formatCurrency = (amount) => {
  if (!amount) return '0 FCFA'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

const getOrderStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
  return classes[status] || classes.pending
}

const getOrderStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refunded: 'Remboursée'
  }
  return labels[status] || 'En attente'
}

const canEditOrder = (order) => {
  return ['pending', 'processing'].includes(order.status)
}

const canPerformActions = (order) => {
  return !['cancelled', 'refunded'].includes(order.status)
}

// Actions
const loadCustomerData = async () => {
  try {
    const customerId = route.params.customerId
    customer.value = await customersStore.getCustomer(customerId)
  } catch (err) {
    error.value = 'Erreur lors du chargement des données du client'
    console.error('Error loading customer:', err)
  }
}

const loadOrders = async (page = 1) => {
  try {
    loading.value = true
    error.value = ''

    const customerId = route.params.customerId
    const params = {
      page,
      per_page: pagination.value.per_page,
      search: filters.search,
      status: filters.status,
      period: filters.period
    }

    const response = await ordersStore.getCustomerOrders(customerId, params)
    // console.log(response)
    orders.value = response.data
    pagination.value = {
      current_page: response.current_page,
      last_page: response.last_page,
      per_page: response.per_page,
      total: response.total,
      from: response.from,
      to: response.to
    }

    // Calculer les statistiques
    stats.value = response.stats || {
      total_spent: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    }

  } catch (err) {
    error.value = 'Erreur lors du chargement des commandes'
    console.error('Error loading orders:', err)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(() => {
  loadOrders(1)
}, 300)

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    loadOrders(page)
  }
}

const toggleOrderActions = (orderId) => {
  showOrderActions.value = showOrderActions.value === orderId ? null : orderId
}

const viewOrder = (order) => {
  router.push({
    name: 'order-details',
    params: {
      customerId: route.params.customerId,
      orderId: order.id
    }
  })
}

const editOrder = (order) => {
  router.push({
    name: 'order-edit',
    params: { orderId: order.id }
  })
}

const updateOrderStatus = async (order, newStatus) => {
  try {
    await ordersStore.updateOrderStatus(order.id, newStatus)

    // Mettre à jour l'ordre localement
    const orderIndex = orders.value.findIndex(o => o.id === order.id)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = newStatus
    }

    // Recharger pour mettre à jour les statistiques
    loadOrders(pagination.value.current_page)

    showOrderActions.value = null

  } catch (err) {
    error.value = 'Erreur lors de la mise à jour du statut'
    console.error('Error updating order status:', err)
  }
}

const confirmCancelOrder = (order) => {
  orderToCancel.value = order
  cancellationReason.value = ''
  showCancelModal.value = true
  showOrderActions.value = null
}

const confirmOrderCancellation = async () => {
  try {
    await ordersStore.cancelOrder(orderToCancel.value.id, {
      reason: cancellationReason.value
    })

    // Mettre à jour l'ordre localement
    const orderIndex = orders.value.findIndex(o => o.id === orderToCancel.value.id)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'cancelled'
    }

    showCancelModal.value = false
    orderToCancel.value = null
    cancellationReason.value = ''

    // Recharger pour mettre à jour les statistiques
    loadOrders(pagination.value.current_page)

  } catch (err) {
    error.value = 'Erreur lors de l\'annulation de la commande'
    console.error('Error canceling order:', err)
  }
}

const duplicateOrder = async (order) => {
  try {
    const newOrder = await ordersStore.duplicateOrder(order.id)

    // Rediriger vers la nouvelle commande
    router.push({
      name: 'customer-order-details',
      params: {
        customerId: route.params.customerId,
        orderId: newOrder.id
      }
    })

  } catch (err) {
    error.value = 'Erreur lors de la duplication de la commande'
    console.error('Error duplicating order:', err)
  }
}

const printOrder = (order) => {
  // Ouvrir la facture dans un nouvel onglet pour impression
  const printUrl = `/orders/${order.id}/print`
  window.open(printUrl, '_blank')
}

const exportOrders = async () => {
  try {
    const customerId = route.params.customerId
    const params = {
      search: filters.search,
      status: filters.status,
      period: filters.period,
      format: 'xlsx'
    }

    await ordersStore.exportCustomerOrders(customerId, params)

  } catch (err) {
    error.value = 'Erreur lors de l\'export des commandes'
    console.error('Error exporting orders:', err)
  }
}

const goBack = () => {
  router.push({ name: 'details-customer', params: { customerId: route.params.customerId } })
}

// Watchers
watch([() => filters.status, () => filters.period], () => {
  loadOrders(1)
})

// Lifecycle
onMounted(async () => {
  await loadCustomerData()
  await loadOrders()
})
</script>

<style scoped>
/* Animations personnalisées */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Styles pour les dropdown menus */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
