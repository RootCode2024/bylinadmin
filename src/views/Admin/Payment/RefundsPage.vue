<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <!-- Assistant de remboursement -->
      <div class="mb-6 p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
        <h3 class="text-lg font-medium mb-4">Initier un remboursement</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Transaction ID</label>
            <input v-model="refundData.transactionId" type="text" class="w-full p-2.5 border rounded-lg">
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Montant</label>
            <input v-model="refundData.amount" type="number" class="w-full p-2.5 border rounded-lg">
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Raison</label>
            <select v-model="refundData.reason" class="w-full p-2.5 border rounded-lg">
              <option value="customer">Demande client</option>
              <option value="error">Erreur système</option>
              <option value="fraud">Fraude suspectée</option>
            </select>
          </div>
        </div>
        <div class="mt-4">
          <button @click="processRefund" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Initier le remboursement
          </button>
        </div>
      </div>

      <!-- Historique des remboursements -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <tr v-for="refund in paginatedRefunds" :key="refund.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                #{{ refund.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ refund.transactionId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatCurrency(refund.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="refundStatusClasses(refund.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ refund.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(refund.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="viewRefundDetails(refund)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  Détails
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        :current-page="pagination.currentPage"
        :total-items="refunds.length"
        :per-page="pagination.perPage"
        @page-changed="changePage"
        class="mt-6"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Pagination from '@/components/ui/Pagination.vue'
import { useDashboardStore } from '@/stores/dashboard'

const currentPageTitle = ref("Gestion des Remboursements")

const dashboardStore = useDashboardStore()

// Données
const refunds = ref([])

const refundData = ref({
  transactionId: '',
  amount: 0,
  reason: 'customer'
})

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 10
})

// Computed
const paginatedRefunds = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return refunds.value.slice(start, end)
})

// Méthodes
const refundStatusClasses = (status) => {
  const classes = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  )
}

const processRefund = () => {
  if (!refundData.value.transactionId || !refundData.value.amount) return

  const newRefund = {
    id: 'R' + Math.floor(1000 + Math.random() * 9000),
    ...refundData.value,
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  }

  refunds.value.unshift(newRefund)
  refundData.value = { transactionId: '', amount: 0, reason: 'customer' }
}

const viewRefundDetails = (refund) => {
  console.log('View refund details:', refund.id)
}

onMounted(() => {
  dashboardStore.fetchTransactions()
  refunds.value = dashboardStore.transactionsRefunds || []
})
</script>
