<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <!-- Filtres -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recherche</label>
            <input
              v-model="filters.search"
              @input="debouncedSearch"
              type="text"
              placeholder="Nom, email..."
              class="w-full p-2.5 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Statut</label>
            <select
              v-model="filters.status"
              @change="applyFilters"
              class="w-full p-2.5 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
              <option value="banned">Banni</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date d'inscription</label>
            <select
              v-model="filters.registrationDate"
              @change="applyFilters"
              class="w-full p-2.5 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Toutes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tri</label>
            <select
              v-model="filters.sort"
              @change="applyFilters"
              class="w-full p-2.5 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="newest">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="most_orders">Plus de commandes</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tableau des clients -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                #
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Commandes
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Dépenses
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Inscrit le
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <tr v-for="(client, index) in customersStore.customers" :key="client.id" :class="{ 'opacity-50': client.deleted_at }">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="client.avatar_url"
                      class="h-10 w-10 rounded-full object-cover"
                      :src="client.avatar_url"
                      :alt="`Avatar de ${client.name}`"
                      @error="handleImageError"
                    >
                    <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                      <span class="text-gray-400" style="font-size: 10px;">Aucune <br> image</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ client.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ client.phone || '-' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ client.email || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(client.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusLabel(client.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ client.orders_count || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(client.total_spent || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(client.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="viewClient(client.id)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  title="Voir les détails"
                >
                  Voir
                </button>
                <button
                  v-if="!client.deleted_at"
                  @click="sendMessage(client)"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                  title="Envoyer un message"
                >
                  Message
                </button>
                <button
                  v-if="client.deleted_at"
                  @click="restoreClient(client.id)"
                  class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                  title="Restaurer le client"
                >
                  Restaurer
                </button>
              </td>
            </tr>

            <!-- Message si aucun client -->
            <tr v-if="!customersStore.isLoading && customersStore.customers && customersStore.customers.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                Aucun client trouvé
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="customersStore.totalPages > 1"
        :current-page="customersStore.currentPage"
        :total-items="customersStore.totalItems"
        :per-page="customersStore.itemsPerPage"
        @page-changed="changePage"
        class="mt-6"
      />

      <!-- Chargement -->
      <div v-if="customersStore.isLoading" class="mt-4 text-center">
        <div class="flex justify-center items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-500 dark:text-gray-400">Chargement en cours...</span>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-if="customersStore.error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
        <p class="text-red-800 dark:text-red-200">{{ customersStore.error }}</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Pagination from '@/components/ui/Pagination.vue'
import { useCustomersStore } from '@/stores/customers'
import { debounce } from 'lodash'

const currentPageTitle = ref("Liste des Clients")
const router = useRouter()
const customersStore = useCustomersStore()

const filters = ref({
  search: '',
  status: '',
  registrationDate: '',
  sort: 'newest'
})

// Debounce pour la recherche
const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

const applyFilters = async () => {
  try {
    customersStore.currentPage = 1 // Reset à la première page
    await customersStore.fetchCustomers({
      search: filters.value.search,
      status: filters.value.status,
      registration_date: filters.value.registrationDate,
      sort: filters.value.sort,
      page: 1
    })
  } catch (error) {
    console.error('Erreur lors de l\'application des filtres:', error)
  }
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    banned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return classes[status] || classes.active
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Actif',
    pending: 'En attente',
    suspended: 'Suspendu',
    banned: 'Banni'
  }
  return labels[status] || 'Actif'
}

// Formatage FCFA
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

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

const viewClient = (customerId) => {
  router.push({ name: 'details-customer', params: { customerId } })
}

const sendMessage = (client) => {
  console.log('Message envoyé à:', client.email)
  // Vous pouvez ouvrir une modal ou rediriger vers une page de messagerie
}

const restoreClient = async (id) => {
  try {
    await customersStore.restoreCustomer(id)
    await customersStore.fetchCustomers()
  } catch (error) {
    console.error('Erreur lors de la restauration:', error)
  }
}

const changePage = async (page) => {
  try {
    await customersStore.fetchCustomers({
      page,
      search: filters.value.search,
      status: filters.value.status,
      registration_date: filters.value.registrationDate,
      sort: filters.value.sort
    })
  } catch (error) {
    console.error('Erreur lors du changement de page:', error)
  }
}

// Chargement initial
onMounted(async () => {
  try {
    await customersStore.fetchCustomers()
  } catch (error) {
    console.error('Erreur lors du chargement initial des clients:', error)
  }
})
</script>
