<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center overflow-y-auto z-[99999]">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 h-full w-full bg-gray-500/75 dark:bg-gray-900/80 backdrop-blur-[2px]"
      aria-hidden="true"
      @click="closeModal"
    ></div>

    <!-- Modal Container -->
    <div class="relative w-full max-w-[95%] md:max-w-[80%] lg:max-w-[60%] xl:max-w-[50%] mx-auto p-4 min-h-0">
      <!-- Modal Content -->
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh] min-h-0">

        <!-- Header -->
        <div class="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <UsersIcon class="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ title || 'Sélectionner des clients' }}
              </h2>
            </div>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <div class="px-6 py-6">
            <div class="space-y-6">
              <!-- Barre de recherche et filtres -->
              <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1 relative">
                  <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    v-model="searchQuery"
                    @input="debouncedSearch"
                    type="text"
                    placeholder="Rechercher par nom, email ou téléphone..."
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Filtres -->
                <div class="flex gap-2">
                  <select
                    v-model="selectedStatus"
                    @change="loadCustomers"
                    class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="pending">En attente</option>
                    <option value="suspended">Suspendu</option>
                    <option value="banned">Banni</option>
                  </select>

                  <select
                    v-model="sortOrder"
                    @change="loadCustomers"
                    class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Plus récents</option>
                    <option value="oldest">Plus anciens</option>
                    <option value="name_asc">Nom A-Z</option>
                    <option value="name_desc">Nom Z-A</option>
                  </select>
                </div>
              </div>

              <!-- Statistiques et sélection -->
              <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div class="flex items-center space-x-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ filteredCustomers.length }} utilisateur{{ filteredCustomers.length > 1 ? 's' : '' }} trouvé{{ filteredCustomers.length > 1 ? 's' : '' }}
                  </div>
                  <div class="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {{ selectedUserIds.length }} sélectionné{{ selectedUserIds.length > 1 ? 's' : '' }}
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <button
                    @click="selectAll"
                    v-if="!allSelected && filteredCustomers.length > 0"
                    class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    @click="deselectAll"
                    v-if="selectedUserIds.length > 0"
                    class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>

              <!-- Liste des utilisateurs -->
              <div class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <!-- En-tête -->
                <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                  <div class="flex items-center">
                    <input
                      v-if="multiple"
                      type="checkbox"
                      :checked="allCurrentPageSelected"
                      @change="toggleCurrentPageSelection"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Clients
                    </span>
                  </div>
                </div>

                <!-- Loading -->
                <div v-if="customersStore.isLoading" class="p-8">
                  <div class="animate-pulse space-y-4">
                    <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
                      <div class="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                      </div>
                      <div class="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </div>

                <!-- Error -->
                <div v-else-if="customersStore.error" class="p-8 text-center">
                  <div class="text-red-500 dark:text-red-400 mb-2">
                    <ExclamationTriangleIcon class="mx-auto h-12 w-12" />
                  </div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Erreur de chargement
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {{ customersStore.error }}
                  </p>
                  <button
                    @click="loadCustomers"
                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>

                <!-- Liste vide -->
                <div v-else-if="filteredCustomers.length === 0" class="p-8 text-center">
                  <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Aucun client trouvé
                  </h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ searchQuery ? 'Essayez de modifier vos critères de recherche.' : 'Aucun client disponible.' }}
                  </p>
                </div>

                <!-- Liste des utilisateurs -->
                <div v-else class="max-h-96 overflow-y-auto">
                  <div
                    v-for="customer in paginatedCustomers"
                    :key="customer.id"
                    @click="toggleUserSelection(customer.id)"
                    :class="{
                      'bg-blue-50 dark:bg-blue-900/20': selectedUserIds.includes(customer.id),
                      'hover:bg-gray-50 dark:hover:bg-gray-700': !selectedUserIds.includes(customer.id)
                    }"
                    class="flex items-center p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors last:border-b-0"
                  >
                    <input
                      :type="multiple ? 'checkbox' : 'radio'"
                      :name="multiple ? undefined : 'user-selection'"
                      :checked="selectedUserIds.includes(customer.id)"
                      @click.stop
                      @change="toggleUserSelection(customer.id)"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                    <div class="ml-4 flex-shrink-0">
                      <img
                        v-if="customer.avatar_url"
                        :src="customer.avatar_url"
                        class="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        :alt="`Avatar de ${getCustomerName(customer)}`"
                        @error="handleImageError"
                      />
                      <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                        <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
                      </div>

                    </div>

                    <div class="ml-4 flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {{ getCustomerName(customer) }}
                        </p>
                        <div class="flex items-center space-x-2">
                          <span :class="getStatusClass(customer.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                            {{ getStatusLabel(customer.status) }}
                          </span>
                        </div>
                      </div>
                      <div class="mt-1 flex items-center justify-between">
                        <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {{ customer.email }}
                        </p>
                        <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span v-if="customer.phone">{{ customer.phone }}</span>
                          <span v-if="customer.created_at">{{ formatDate(customer.created_at) }}</span>
                        </div>
                      </div>
                      <div v-if="customer.last_login_at" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Dernière connexion: {{ formatTimeAgo(customer.last_login_at) }}
                      </div>
                      <div v-if="customer.orders_count" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ customer.orders_count }} commande{{ customer.orders_count > 1 ? 's' : '' }}
                        <span v-if="customer.total_spent" class="ml-2">
                          • {{ formatCurrency(customer.total_spent) }} dépensé{{ customer.total_spent > 1 ? 's' : '' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                  <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-700 dark:text-gray-300">
                      Affichage de {{ (currentPage - 1) * itemsPerPage + 1 }} à {{ Math.min(currentPage * itemsPerPage, filteredCustomers.length) }} sur {{ filteredCustomers.length }}
                    </div>
                    <div class="flex items-center space-x-2">
                      <button
                        @click="currentPage--"
                        :disabled="currentPage <= 1"
                        class="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        Page {{ currentPage }} sur {{ totalPages }}
                      </span>
                      <button
                        @click="currentPage++"
                        :disabled="currentPage >= totalPages"
                        class="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Utilisateurs sélectionnés (aperçu) -->
              <div v-if="selectedCustomers.length > 0" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 class="text-sm font-medium text-blue-900 dark:text-blue-300 mb-3">
                  Clients sélectionnés ({{ selectedCustomers.length }})
                </h4>
                <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  <div
                    v-for="customer in selectedCustomers.slice(0, 10)"
                    :key="customer.id"
                    class="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <img
                      v-if="customer.avatar_url"
                      :src="customer.avatar_url"
                      class="h-6 w-6 rounded-full object-cover"
                      :alt="`Avatar de ${getCustomerName(customer)}`"
                      @error="handleImageError"
                    />
                    <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                      <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
                    </div>
                    <span class="text-gray-900 dark:text-white font-medium">{{ getCustomerName(customer) }}</span>
                    <button
                      @click="removeUserFromSelection(customer.id)"
                      class="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon class="h-4 w-4" />
                    </button>
                  </div>
                  <div v-if="selectedCustomers.length > 10" class="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                    +{{ selectedCustomers.length - 10 }} autres...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div class="flex justify-end space-x-3">
            <button
              @click="closeModal"
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              @click="confirmSelection"
              :disabled="selectedCustomers.length === 0"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Confirmer la sélection
              <span v-if="selectedCustomers.length > 0" class="ml-2 bg-blue-500 text-xs px-2 py-1 rounded-full">
                {{ selectedCustomers.length }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { debounce } from 'lodash'
import {
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { useCustomersStore } from '@/stores/customers'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Sélectionner des clients'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  excludeIds: {
    type: Array,
    default: () => []
  },
  roleFilter: {
    type: Array,
    default: () => []
  },
  statusFilter: {
    type: Array,
    default: () => []
  },
  preselectedIds: {
    type: Array,
    default: () => []
  }
})

// Émissions
const emit = defineEmits(['close', 'select'])

// Store
const customersStore = useCustomersStore()

// État local
const searchQuery = ref('')
const selectedUserIds = ref([])
const selectedStatus = ref('')
const sortOrder = ref('newest')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed
const filteredCustomers = computed(() => {
  let filtered = customersStore.customers

  // Exclure certains IDs
  if (props.excludeIds.length > 0) {
    filtered = filtered.filter(customer => !props.excludeIds.includes(customer.id))
  }

  // Filtrer par statut (si spécifié dans les props)
  if (props.statusFilter.length > 0) {
    filtered = filtered.filter(customer => props.statusFilter.includes(customer.status))
  }

  // Filtrer par statut sélectionné
  if (selectedStatus.value) {
    filtered = filtered.filter(customer => customer.status === selectedStatus.value)
  }

  // Filtrer par recherche
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter(customer =>
      getCustomerName(customer).toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      (customer.phone && customer.phone.includes(search))
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage.value))

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCustomers.value.slice(start, end)
})

const selectedCustomers = computed(() => {
  return customersStore.customers.filter(customer => selectedUserIds.value.includes(customer.id))
})

const allSelected = computed(() => {
  return filteredCustomers.value.length > 0 && filteredCustomers.value.every(customer => selectedUserIds.value.includes(customer.id))
})

const allCurrentPageSelected = computed(() => {
  return paginatedCustomers.value.length > 0 && paginatedCustomers.value.every(customer => selectedUserIds.value.includes(customer.id))
})

// Méthodes utilitaires
const getCustomerName = (customer) => {
  if (customer.name && customer.name) {
    return `${customer.name} ${customer.name}`
  }
  if (customer.name) {
    return customer.name
  }
  return customer.name || customer.name || customer.email
}

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`
  return formatDate(dateString)
}

const formatCurrency = (amount) => {
  if (!amount) return '0 F CFA'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
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
  return labels[status] || status
}

// Actions
const loadCustomers = async () => {
  try {
    const filters = {
      search: searchQuery.value,
      status: selectedStatus.value,
      sort: sortOrder.value,
      page: 1 // Reset to first page on filter change
    }

    await customersStore.fetchCustomers(filters)
    currentPage.value = 1
  } catch (error) {
    console.error('Erreur lors du chargement des clients:', error)
  }
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1 // Reset à la première page lors d'une recherche
  loadCustomers()
}, 300)

const toggleUserSelection = (customerId) => {
  if (!props.multiple) {
    selectedUserIds.value = [customerId]
    return
  }

  const index = selectedUserIds.value.indexOf(customerId)
  if (index > -1) {
    selectedUserIds.value.splice(index, 1)
  } else {
    selectedUserIds.value.push(customerId)
  }
}

const removeUserFromSelection = (customerId) => {
  const index = selectedUserIds.value.indexOf(customerId)
  if (index > -1) {
    selectedUserIds.value.splice(index, 1)
  }
}

const selectAll = () => {
  const customerIds = filteredCustomers.value.map(customer => customer.id)
  selectedUserIds.value = [...new Set([...selectedUserIds.value, ...customerIds])]
}

const deselectAll = () => {
  selectedUserIds.value = []
}

const toggleCurrentPageSelection = () => {
  if (allCurrentPageSelected.value) {
    // Désélectionner tous les clients de la page actuelle
    const currentPageIds = paginatedCustomers.value.map(customer => customer.id)
    selectedUserIds.value = selectedUserIds.value.filter(id => !currentPageIds.includes(id))
  } else {
    // Sélectionner tous les clients de la page actuelle
    const currentPageIds = paginatedCustomers.value.map(customer => customer.id)
    selectedUserIds.value = [...new Set([...selectedUserIds.value, ...currentPageIds])]
  }
}

const confirmSelection = () => {
  console.log('Confirmation de la sélection:', selectedCustomers.value)

  // Transformer les données des clients sélectionnés pour correspondre au format attendu
  const transformedCustomers = selectedCustomers.value.map(customer => ({
    id: customer.id,
    name: getCustomerName(customer),
    email: customer.email,
    phone: customer.phone,
    avatar: customer.avatar_url,
    status: customer.status,
    role: 'customer', // Tous les clients ont le rôle 'customer'
    created_at: customer.created_at,
    last_login_at: customer.last_login_at,
    name: customer.name,
    name: customer.name
  }))

  // Émettre l'événement de sélection
  emit('select', transformedCustomers)

  // Fermer la modal immédiatement
  nextTick(() => {
    emit('close')
  })
}

const closeModal = () => {
  console.log('=== DÉBUT closeModal ===')
  console.log('props.show avant reset:', props.show)
  resetModal()
  console.log('Émission de l\'événement close depuis closeModal')
  emit('close')
  console.log('=== FIN closeModal ===')
}

const resetModal = () => {
  searchQuery.value = ''
  selectedUserIds.value = []
  selectedStatus.value = ''
  sortOrder.value = 'newest'
  currentPage.value = 1
}

// Watchers
watch(() => props.show, (newValue) => {
  console.log('Modal show state changed:', newValue)

  if (newValue) {
    // Charger les clients quand la modal s'ouvre
    loadCustomers()

    // Préremplir avec les IDs présélectionnés
    if (props.preselectedIds.length > 0) {
      selectedUserIds.value = [...props.preselectedIds]
    }
  } else {
    // Réinitialiser quand la modal se ferme
    resetModal()
  }
})

watch(() => props.preselectedIds, (newIds) => {
  if (newIds && newIds.length > 0) {
    selectedUserIds.value = [...newIds]
  }
}, { immediate: true })

watch(currentPage, () => {
  if (props.show) {
    loadCustomers()
  }
})

// Lifecycle
onMounted(() => {
  if (props.show) {
    loadCustomers()
  }
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Style pour la sélection */
.user-selected {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

.dark .user-selected {
  background-color: rgba(59, 130, 246, 0.1);
}

/* Style pour les checkbox et radio buttons */
input[type="checkbox"]:checked,
input[type="radio"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Scrollbar personnalisée */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Style responsive */
@media (max-width: 640px) {
  .flex.flex-col.sm\\:flex-row {
    flex-direction: column;
  }

  .space-x-3 > * + * {
    margin-left: 0;
    margin-top: 0.75rem;
  }

  .flex.justify-end.space-x-3 {
    flex-direction: column;
  }

  .gap-2 {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Style pour les badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
}

/* Hover effects */
.customer-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Focus states */
.focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading shimmer effect */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Style pour les messages d'erreur */
.error-message {
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
}

.dark .error-message {
  color: #f87171;
  background-color: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.3);
}

/* Style pour les états vides */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-state-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #9ca3af;
}

/* Animation pour les sélections */
.selection-bounce {
  animation: selection-bounce 0.3s ease-in-out;
}

@keyframes selection-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Style pour la pagination */
.pagination-button {
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Style pour les avatars */
.avatar {
  transition: transform 0.2s ease;
}

.avatar:hover {
  transform: scale(1.1);
}

/* Style pour les badges de statut */
.status-badge {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Animation pour les nouveaux éléments */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Style pour les tooltips */
[data-tooltip] {
  position: relative;
}

[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 0.25rem;
}

[data-tooltip]:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
  z-index: 1000;
}
</style>
