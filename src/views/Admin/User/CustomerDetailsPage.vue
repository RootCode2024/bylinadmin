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
            <div class="flex-shrink-0">
              <img
                v-if="client?.avatar_url"
                class="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                :src="client?.avatar_url"
                :alt="`Avatar de ${client?.name}`"
                @error="handleImageError"
              >
              <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ client?.name || 'Chargement...' }}
              </h1>
              <div class="flex items-center space-x-4 mt-1">
                <p class="text-gray-600 dark:text-gray-400">
                  {{ client?.email || '-' }}
                </p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ client?.phone || '-' }}
                </p>
                <span
                  v-if="client"
                  :class="getStatusClass(client.status)"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusLabel(client.status) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              @click="openMessageModal"
              :disabled="sendingMessage"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <ChatBubbleLeftIcon class="h-4 w-4 mr-2" />
              {{ sendingMessage ? 'Ouverture...' : 'Envoyer un message' }}
            </button>
            <button
            @click="editClient"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <PencilIcon class="h-4 w-4 mr-2" />
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Informations principales -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Statistiques -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Statistiques</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ client?.orders_count || 0 }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Commandes</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {{ formatCurrency(client?.total_spent || 0) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Total dépensé</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {{ formatCurrency(client?.average_order_value || 0) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Panier moyen</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {{ client?.points_balance || 0 }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Points fidélité</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dernières commandes -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Dernières commandes</h2>
              <router-link
                :to="{ name: 'order-lists', params: { customerId: $route.params.customerId } }"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir toutes
              </router-link>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Commande
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Statut
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                <tr v-for="order in recentOrders" :key="order.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <router-link
                      :to="{ name: 'order-details', params: { orderId: order.id } }"
                      class="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      #{{ order.order_number }}
                    </router-link>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(order.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getOrderStatusClass(order.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getOrderStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {{ formatCurrency(order.total) }}
                  </td>
                </tr>
                <tr v-if="recentOrders.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Aucune commande trouvée
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Activité récente -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Activité récente</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="activity in clientActivity" :key="activity.id" class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div :class="getActivityIconClass(activity.type)" class="w-8 h-8 rounded-full flex items-center justify-center">
                    <!-- <i :class="getActivityIcon(activity.type)" class="text-sm"></i> -->
                    <ShoppingBagIcon v-if="activity.type === 'order'" class="h-6 w-6 text-gray-500" />
                    <ArrowRightEndOnRectangleIcon v-if="activity.type === 'login'" class="h-6 w-6 text-gray-500" />
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 dark:text-white">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(activity.created_at) }}</p>
                </div>
              </div>
              <div v-if="clientActivity.length === 0" class="text-center text-gray-500 dark:text-gray-400">
                Aucune activité récente
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar droite -->
      <div class="space-y-6">

        <!-- Informations personnelles -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Informations personnelles</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Genre</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ getGenderLabel(client?.gender) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Date de naissance</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ client?.birth_date ? formatDate(client.birth_date) : '-' }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Pays</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ getCountryName(client?.country_code) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Langue</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ getLanguageLabel(client?.language) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Code de parrainage</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                {{ client?.referral_code || '-' }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Inscription</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(client?.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Adresses -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-1">
              <MapPinIcon class="h-5 w-5 text-gray-500" />
              <span>Adresses</span>
            </h2>
          </div>
          <div class="p-6">
            <div v-if="clientAddresses" class="space-y-4">
              <div v-for="address in clientAddresses" :key="address.id" class="border rounded-lg p-4 dark:border-gray-600">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ address.type === 'billing' ? 'Facturation' : 'Livraison' }}
                  </span>
                  <span v-if="address.is_default" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-300">
                    Par défaut
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ address.street_line }}<br>
                  <span v-if="address.landmark">{{ address.landmark }}<br></span>
                  {{ address.city }}<br>
                  {{ address.phone }}
                </p>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 dark:text-gray-400">
              Aucune adresse enregistrée
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-1">
              <ClockIcon class="w-5 h-5 text-gray-500" />
              <span>Actions rapides</span>
            </h2>
          </div>
          <div class="p-6 space-y-3">
            <button
              @click="resetPassword"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Réinitialiser le mot de passe
            </button>
            <button
              @click="suspendClient"
              class="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 rounded-lg dark:text-orange-300 dark:hover:bg-orange-900/20"
              v-if="client?.status !== 'suspended'"
            >
              Suspendre le compte
            </button>
            <button
              @click="activateClient"
              class="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg dark:text-green-300 dark:hover:bg-green-900/20"
              v-if="client?.status === 'suspended'"
            >
              Activer le compte
            </button>
            <button
              @click="deleteClient"
              class="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg dark:text-red-300 dark:hover:bg-red-900/20"
              v-if="!client?.deleted_at"
            >
              Supprimer le compte
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation -->
    <Modal v-if="showConfirmModal" @close="closeModal">
      <template #header>
        <div class="flex items-center">
          <div :class="confirmModal.actionClass" class="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center mr-3">
            <ExclamationTriangleIcon class="h-4 w-4" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ confirmModal.title }}
          </h2>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-300">
            {{ confirmModal.message }}
          </p>

          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              @click="confirmAction"
              :class="confirmModal.actionClass"
              class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ confirmModal.actionText }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import { useCustomersStore } from '@/stores/customers'
import Modal from '@/components/ui/Modal.vue'
import { ChatBubbleLeftIcon, ExclamationTriangleIcon, 
  PencilIcon, ArrowRightEndOnRectangleIcon, 
  ShoppingBagIcon, MapPinIcon, ClockIcon   } from '@heroicons/vue/24/outline'
import { useConversationsStore } from '@/stores/conversations'

const route = useRoute()
const router = useRouter()

const customersStore = useCustomersStore()
const conversationsStore = useConversationsStore()

// État local
const sendingMessage = ref(false)

// Ouvrir une conversation avec ce client
const openMessageModal = async () => {
  if (!props.customer?.id) return
  
  sendingMessage.value = true
  
  try {
    // Rediriger vers la messagerie avec le clientId en paramètre
    await router.push({
      name: 'messages', // Nom de la route de la messagerie
      query: {
        clientId: props.customer.id
      }
    })
  } catch (error) {
    console.error('Erreur lors de l\'ouverture de la messagerie:', error)
  } finally {
    sendingMessage.value = false
  }
}

// État local
const client = ref(null)
const recentOrders = ref([])
const clientActivity = ref([])
const clientAddresses = ref([])
const showConfirmModal = ref(false)
const confirmModal = ref({
  title: '',
  message: '',
  actionText: '',
  actionClass: '',
  action: null
})

// Computed
const pageTitle = computed(() => {
  return client.value ? `Client: ${client.value.name}` : 'Détails du client'
})

const breadcrumbs = computed(() => [
  { name: 'Accueil', href: '/' },
  { name: 'Clients', href: '/customers' },
  { name: client.value?.name || 'Chargement...', href: '#' }
])

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

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'
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
    paid: 'Payé',
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refunded: 'Remboursée'
  }
  return labels[status] || 'En attente'
}

const getGenderLabel = (gender) => {
  const labels = {
    male: 'Homme',
    female: 'Femme',
    other: 'Autre'
  }
  return labels[gender] || '-'
}

const getCountryName = (countryCode) => {
  const countries = {
    BJ: 'Bénin',
    NG: 'Nigeria',
    TG: 'Togo',
    GH: 'Ghana',
    CI: 'Côte d\'Ivoire',
    FR: 'France',
    US: 'États-Unis',
    CA: 'Canada'
  }
  return countries[countryCode] || countryCode
}

const getLanguageLabel = (language) => {
  const languages = {
    fr: 'Français',
    en: 'Anglais'
  }
  return languages[language] || '-'
}

const getActivityIconClass = (type) => {
  const classes = {
    order: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    payment: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    account: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    login: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300'
  }
  return classes[type] || classes.account
}

const getActivityIcon = (type) => {
  const icons = {
    order: 'fas fa-shopping-cart',
    payment: 'fas fa-credit-card',
    account: 'fas fa-user',
    login: 'fas fa-sign-in-alt'
  }
  return icons[type] || 'fas fa-info'
}

// Actions
const sendMessage = () => {
  console.log('Envoi de message à:', client.value?.email)
  // Implémentation de l'envoi de message
}

const editClient = () => {
  router.push({ name: 'edit-customer', params: { customerId: route.params.customerId } })
}

const resetPassword = () => {
  showModal(
    'Réinitialiser le mot de passe',
    'Êtes-vous sûr de vouloir réinitialiser le mot de passe de ce client ? Un nouveau mot de passe temporaire sera envoyé par email.',
    'Réinitialiser',
    'bg-blue-600 hover:bg-blue-700 text-white',
    async () => {
      try {
        await customersStore.resetPassword(route.params.customerId)
        // Afficher un message de succès
        console.log('Mot de passe réinitialisé avec succès')
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error)
      }
    }
  )
}

const suspendClient = () => {
  showModal(
    'Suspendre le compte',
    'Êtes-vous sûr de vouloir suspendre ce compte client ? L\'utilisateur ne pourra plus se connecter.',
    'Suspendre',
    'bg-orange-600 hover:bg-orange-700 text-white',
    async () => {
      try {
        await customersStore.updateStatus(route.params.customerId, 'suspended')
        client.value.status = 'suspended'
        console.log('Client suspendu avec succès')
      } catch (error) {
        console.error('Erreur lors de la suspension:', error)
      }
    }
  )
}

const activateClient = () => {
  showModal(
    'Activer le compte',
    'Êtes-vous sûr de vouloir activer ce compte client ?',
    'Activer',
    'bg-green-600 hover:bg-green-700',
    async () => {
      try {
        await customersStore.updateStatus(route.params.customerId, 'active')
        client.value.status = 'active'
        console.log('Client activé avec succès')
      } catch (error) {
        console.error('Erreur lors de l\'activation:', error)
      }
    }
  )
}

const deleteClient = () => {
  showModal(
    'Supprimer le compte',
    'Êtes-vous sûr de vouloir supprimer définitivement ce compte client ? Cette action est irréversible.',
    'Supprimer',
    'bg-red-600 hover:bg-red-700 text-white',
    async () => {
      try {
        await customersStore.deleteCustomer(route.params.customerId)
        router.push({ name: 'clients' })
        console.log('Client supprimé avec succès')
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  )
}

const showModal = (title, message, actionText, actionClass, action) => {
  confirmModal.value = {
    title,
    message,
    actionText,
    actionClass,
    action
  }
  showConfirmModal.value = true
}

const closeModal = () => {
  showConfirmModal.value = false
}

const confirmAction = () => {
  if (confirmModal.value.action) {
    confirmModal.value.action()
  }
  closeModal()
}

// Chargement des données
const loadClientData = async () => {
  try {
    const clientId = route.params.customerId

    console.log(clientId)

    // Charger les détails du client
    client.value = await customersStore.getCustomer(clientId)

    // // Charger les commandes récentes
    recentOrders.value = client.value.orders

    // // Charger les adresses
    clientAddresses.value = client.value.addresses

    // // Charger l'activité récente
    clientActivity.value = await customersStore.getCustomerActivity(clientId, { limit: 10 })

  } catch (error) {
    console.error('Erreur lors du chargement des données client:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadClientData()
})
</script>
