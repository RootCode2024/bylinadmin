<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <!-- Outils de facturation -->
      <div class="mb-6 flex justify-between items-center">
        <div>
          <button @click="generateInvoice" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-3">
            + Nouvelle facture
          </button>
          <button @click="exportAll" class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600">
            Exporter tout
          </button>
        </div>
        <div class="w-64">
          <input v-model="searchQuery" type="text" placeholder="Rechercher..." class="w-full p-2.5 border rounded-lg">
        </div>
      </div>

      <!-- Liste des factures -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="invoice in filteredInvoices" :key="invoice.id"
             class="border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-medium">Facture #{{ invoice.number }}</h3>
            <span :class="invoiceStatusClasses(invoice.status)" class="px-2 py-1 text-xs rounded-full">
              {{ invoice.status }}
            </span>
          </div>
          <div class="mb-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">Client: {{ invoice.client.name }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Date: {{ formatDate(invoice.date) }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Montant: {{ formatCurrency(invoice.amount) }}</p>
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="downloadInvoice(invoice)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
              Télécharger
            </button>
            <button @click="sendInvoice(invoice)" class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm">
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"

const currentPageTitle = ref("Gestion des Factures")

// Données
const invoices = ref([
  {
    id: 'F1001',
    number: '2023-001',
    client: { name: 'Jean Dupont', email: 'jean@example.com' },
    date: '2023-06-01',
    amount: 125.99,
    status: 'paid'
  },
  // Plus de factures...
])

const searchQuery = ref('')

// Computed
const filteredInvoices = computed(() => {
  if (!searchQuery.value) return invoices.value

  const query = searchQuery.value.toLowerCase()
  return invoices.value.filter(invoice =>
    invoice.number.toLowerCase().includes(query) ||
    invoice.client.name.toLowerCase().includes(query) ||
    invoice.client.email.toLowerCase().includes(query))
})

// Méthodes
const invoiceStatusClasses = (status) => {
  const classes = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    unpaid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const generateInvoice = () => {
  console.log('Generate new invoice')
}

const downloadInvoice = (invoice) => {
  console.log('Download invoice:', invoice.id)
}

const sendInvoice = (invoice) => {
  console.log('Send invoice:', invoice.id)
}

const exportAll = () => {
  console.log('Export all invoices')
}
</script>
