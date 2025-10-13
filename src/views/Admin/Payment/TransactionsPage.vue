<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <!-- Statistiques -->
      <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard
          title="Transactions totales"
          :value="formatCurrency(totalTransactions ?? 0)"
          icon="Circle"
          trend="5%"
        />
        <StatCard
          title="Transactions réussies"
          :value="stats.successCount"
          icon="Circle"
          trend="8%"
          trend-positive
        />
        <StatCard
          title="Remboursements"
          :value="formatCurrency(totalRefunds ?? 0)"
          icon="Circle"
          trend="3%"
        />
        <StatCard
          title="Revenue net"
          :value="formatCurrency(netRevenue ?? 0)"
          icon="Circle"
          trend="15%"
          trend-positive
        />
      </div>

      <!-- Filtres avancés -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Statut</label>
            <select v-model="filters.status" class="w-full p-2.5 border rounded-lg">
              <option value="">Tous</option>
              <option v-for="(status, index) in statusOptions" :value="status.value" :key="index">{{ status.label }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Méthode de paiement</label>
            <select v-model="filters.paymentMethod" class="w-full p-2.5 border rounded-lg">
              <option value="">Toutes</option>
              <option v-for="(method, index) in paymentMethods" :value="method" :key="index">{{ method }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date de début</label>
            <input v-model="filters.startDate" type="date" class="w-full p-2.5 border rounded-lg">
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date de fin</label>
            <input v-model="filters.endDate" type="date" class="w-full p-2.5 border rounded-lg">
          </div>
        </div>
      </div>

      <!-- Tableau -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th v-for="column in columns" :key="column.key"
                  @click="sortBy(column.key)"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  :class="{ 'bg-gray-100 dark:bg-gray-600': sort.field === column.key }">
                <div class="flex items-center">
                  {{ column.label }}
                  <span v-if="sort.field === column.key" class="ml-1">
                    {{ sort.order === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <tr v-for="transaction in paginatedItems" :key="transaction.id"
                @click="selectTransaction(transaction)"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                #{{ transaction.transaction_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      class="h-10 w-10 rounded-full"
                      :src="transaction.order.user.avatar_url || 'https://placehold.co/80?text=Client'"
                      alt="Client avatar"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ transaction.order.user.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ transaction.order.user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatCurrency(transaction.amount) }}
              </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ getPaymentMethod(transaction) }}
                </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="statusClasses(transaction.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusLabel(transaction.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(transaction.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click.stop="showActions(transaction)" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="pagination.currentPage"
        :total-items="filteredTransactions.length"
        :per-page="pagination.perPage"
        @page-changed="changePage"
        class="mt-6"
      />
    </div>

    <!-- Transaction Detail Modal -->
    <TransactionModal
      v-if="selectedTransaction"
      :transaction="selectedTransaction"
      @close="selectedTransaction = null"
      @refund="initiateRefund"
    />

    <!-- Action Menu -->
    <ContextMenu
      v-if="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @close="contextMenu.show = false"
    >
      <ContextMenuItem @click="viewDetails(contextMenu.transaction)">
        <EyeIcon class="h-4 w-4 mr-2" /> Voir détails
      </ContextMenuItem>
      <ContextMenuItem @click="initiateRefund(contextMenu.transaction)">
        <ArrowPathIcon class="h-4 w-4 mr-2" /> Rembourser
      </ContextMenuItem>
      <ContextMenuItem @click="exportReceipt(contextMenu.transaction)">
        <DocumentArrowDownIcon class="h-4 w-4 mr-2" /> Exporter reçu
      </ContextMenuItem>
    </ContextMenu>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  EyeIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/vue/24/outline'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Pagination from '@/components/ui/Pagination.vue'
import StatCard from '@/components/ui/StatCard.vue'
import TransactionModal from '@/components/transactions/TransactionModal.vue'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import { useDashboardStore } from '@/stores/dashboard'

const currentPageTitle = ref("Gestion des Transactions")

const dashboardStore = useDashboardStore()

// Données
const transactions = ref([])
const loading = ref(true)
const selectedTransaction = ref(null)
const totalRefunds = ref(0)
const netRevenue = ref(0)

// Colonnes du tableau
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'customer', label: 'Client' },
  { key: 'amount', label: 'Montant' },
  { key: 'paymentMethod', label: 'Méthode de paiement' },
  { key: 'status', label: 'Statut' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: 'Actions' }
]

// Filtres
const filters = ref({
  status: '',
  paymentMethod: '',
  startDate: '',
  endDate: ''
})

// Tri
const sort = ref({
  field: 'date',
  order: 'desc'
})

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 10
})

// Menu contextuel
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  transaction: null
})

// Options
const statusOptions = [
  { value: 'completed', label: 'Complétée' },
  { value: 'pending', label: 'En attente' },
  { value: 'failed', label: 'Échouée' },
  { value: 'refunded', label: 'Remboursée' }
]

const paymentMethods = [
  'Carte de crédit',
  'PayPal',
  'Virement',
  'Apple Pay',
  'Google Pay'
]

// Computed
const filteredTransactions = computed(() => {
  let result = [...transactions.value]

  // Filtrage
  if (filters.value.status) {
    result = result.filter(t => t.status === filters.value.status)
  }

  if (filters.value.paymentMethod) {
    result = result.filter(t => t.paymentMethod === filters.value.paymentMethod)
  }

  if (filters.value.startDate) {
    result = result.filter(t => new Date(t.date) >= new Date(filters.value.startDate))
  }

  if (filters.value.endDate) {
    result = result.filter(t => new Date(t.date) <= new Date(filters.value.endDate))
  }

  // Tri
  result.sort((a, b) => {
    const fieldA = a[sort.value.field]
    const fieldB = b[sort.value.field]

    if (fieldA < fieldB) return sort.value.order === 'asc' ? -1 : 1
    if (fieldA > fieldB) return sort.value.order === 'asc' ? 1 : -1
    return 0
  })

  return result
})

const paginatedItems = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return filteredTransactions.value.slice(start, end)
})

const totalTransactions = computed(() => {
  return transactions.value.reduce((sum, t) => sum + t.amount, 0)
})

const stats = computed(() => {
  const successCount = transactions.value.filter(t => t.status === 'completed').length
  const trend = ((successCount / transactions.value.length) * 100).toFixed(2)
  return { successCount, trend }
})

// Méthodes
const statusClasses = (status) => {
  const classes = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const getStatusLabel = (status) => {
  const labels = {
    completed: 'Complete',
    pending: 'En attente',
    failed: 'Échouée',
    refunded: 'Remboursée'
  }
  return labels[status] || status
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const sortBy = (field) => {
  if (sort.value.field === field) {
    sort.value.order = sort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.field = field
    sort.value.order = 'asc'
  }
}

const selectTransaction = (transaction) => {
  selectedTransaction.value = transaction
}

const showActions = (transaction, event) => {
  if (event) {
    contextMenu.value.x = event.clientX
    contextMenu.value.y = event.clientY
  }
  contextMenu.value.transaction = transaction
  contextMenu.value.show = true
}

const initiateRefund = (transaction) => {
  console.log('Initiate refund for:', transaction.id)
  // Implémenter la logique de remboursement
}

const changePage = (page) => {
  pagination.value.currentPage = page
}

const getPaymentMethod = (transaction) => {
  // Essayez d'extraire la méthode de paiement depuis metadata si elle existe
  if (transaction.metadata) {
    try {
      const meta = typeof transaction.metadata === 'string'
        ? JSON.parse(transaction.metadata)
        : transaction.metadata
      if (meta.payment_method) {
        // Vous pouvez adapter ici pour afficher un label plus lisible si besoin
        switch (meta.payment_method) {
            case 'mobile_money': return 'Mobile Money via le : ' + meta.phone
          case 'credit_card': return 'Carte de crédit'
          case 'paypal': return 'PayPal'
          // Ajoutez d'autres mappings si nécessaire
          default: return meta.payment_method
        }
      }
    } catch (e) {
      // ignore parsing error
    }
  }
  // fallback
  return transaction.paymentMethod || 'N/A'
}

// Initialisation
onMounted(async () => {
    // dashboardStore.fetchTransactions()
    loading.value = true
    try {
        // Attendre que les transactions soient chargées dans le store
        await dashboardStore.fetchTransactions()
        transactions.value = dashboardStore.transactions || []
        // Calculer les remboursements et le revenu net
        totalRefunds.value = transactions.value
            .filter(t => t.status === 'refunded')
            .reduce((sum, t) => sum + t.amount, 0)
        netRevenue.value = transactions.value
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0) - totalRefunds.value
    } catch (error) {
        console.error("Erreur lors du chargement des transactions :", error)
    } finally {
        loading.value = false
    }
})
</script>
