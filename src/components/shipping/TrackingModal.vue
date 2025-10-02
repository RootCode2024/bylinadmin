<!-- components/shipping/TrackingModal.vue -->
<template>
  <Modal :show="show" @close="$emit('close')" size="2xl">
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
            Suivi de l'expédition
          </h3>
          <div class="mt-1 flex items-center space-x-3">
            <p class="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {{ trackingData?.tracking_number }}
            </p>
            <button
              @click="copyTrackingNumber"
              class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
            >
              Copier
            </button>
          </div>
        </div>
      </div>
    </template>

    <div v-if="trackingData" class="mt-4">
      <!-- Statut actuel -->
      <div class="text-center mb-8">
        <div class="mb-4">
          <span
            :class="getStatusClass(trackingData.status)"
            class="inline-flex px-4 py-2 text-lg font-semibold rounded-full"
          >
            {{ getStatusLabel(trackingData.status) }}
          </span>
        </div>
        
        <!-- Informations de livraison -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div v-if="trackingData.estimated_delivery_at" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div class="text-blue-600 dark:text-blue-400 font-medium">Livraison estimée</div>
            <div class="text-blue-800 dark:text-blue-200">
              {{ formatDateTime(trackingData.estimated_delivery_at) }}
            </div>
          </div>
          
          <div v-if="trackingData.delivered_at" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div class="text-green-600 dark:text-green-400 font-medium">Livré le</div>
            <div class="text-green-800 dark:text-green-200">
              {{ formatDateTime(trackingData.delivered_at) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Informations destinataire -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Destinataire</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">Nom:</span>
            <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ trackingData.recipient.name }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Téléphone:</span>
            <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ trackingData.recipient.phone }}</span>
          </div>
        </div>
      </div>

      <!-- Barre de progression -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Progression</span>
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ getProgressPercentage(trackingData.status) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            :class="getProgressBarClass(trackingData.status)"
            class="h-2 rounded-full transition-all duration-300"
            :style="{ width: `${getProgressPercentage(trackingData.status)}%` }"
          ></div>
        </div>
      </div>

      <!-- Timeline des événements -->
      <div v-if="trackingData.history && trackingData.history.length > 0">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Historique de suivi</h4>
        <div class="flow-root">
          <ul class="-mb-8">
            <li v-for="(event, idx) in trackingData.history" :key="idx" class="relative pb-8">
              <span
                v-if="idx !== trackingData.history.length - 1"
                class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600"
                aria-hidden="true"
              />
              <div class="relative flex space-x-3">
                <div>
                  <span
                    :class="getStatusClass(event.status)"
                    class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800"
                  >
                    <component :is="getStatusIcon(event.status)" class="h-4 w-4" />
                  </span>
                </div>
                <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ getStatusLabel(event.status) }}
                    </p>
                    <p v-if="event.notes" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {{ event.notes }}
                    </p>
                    <div v-if="event.location" class="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <MapPinIcon class="h-3 w-3 mr-1" />
                      {{ event.location.city }}, {{ event.location.country }}
                    </div>
                  </div>
                  <div class="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    <div>{{ formatDate(event.created_at) }}</div>
                    <div class="text-xs">{{ formatTime(event.created_at) }}</div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="refreshTracking"
          :disabled="refreshing"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <ArrowPathIcon :class="{ 'animate-spin': refreshing }" class="h-4 w-4 mr-2" />
          Actualiser
        </button>
        <button
          @click="shareTracking"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ShareIcon class="h-4 w-4 mr-2" />
          Partager
        </button>
        <button
          @click="$emit('close')"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Fermer
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { 
  ArrowPathIcon, 
  ShareIcon, 
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { useShipmentsStore } from '@/stores/shippings'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  show: Boolean,
  trackingData: Object
})

const emit = defineEmits(['close'])

const shipmentsStore = useShipmentsStore()
const { addNotification } = useNotifications()
const refreshing = ref(false)

// Méthodes utilitaires
const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    assigned: 'Assigné',
    picked_up: 'Récupéré',
    in_transit: 'En transit',
    out_for_delivery: 'En cours de livraison',
    delivered: 'Livré',
    failed: 'Échec de livraison',
    returned: 'Retourné',
    cancelled: 'Annulé'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    picked_up: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: ClockIcon,
    assigned: TruckIcon,
    picked_up: TruckIcon,
    in_transit: TruckIcon,
    out_for_delivery: TruckIcon,
    delivered: CheckCircleIcon,
    failed: XCircleIcon,
    returned: ExclamationTriangleIcon,
    cancelled: XCircleIcon
  }
  return icons[status] || ClockIcon
}

const getProgressPercentage = (status) => {
  const progress = {
    pending: 10,
    assigned: 25,
    picked_up: 40,
    in_transit: 60,
    out_for_delivery: 80,
    delivered: 100,
    failed: 100,
    returned: 100,
    cancelled: 100
  }
  return progress[status] || 0
}

const getProgressBarClass = (status) => {
  if (['delivered'].includes(status)) {
    return 'bg-green-500'
  } else if (['failed', 'returned', 'cancelled'].includes(status)) {
    return 'bg-red-500'
  } else {
    return 'bg-blue-500'
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Actions
const copyTrackingNumber = async () => {
  try {
    await navigator.clipboard.writeText(props.trackingData.tracking_number)
    addNotification({
      type: 'success',
      title: 'Copié',
      message: 'Numéro de suivi copié dans le presse-papier'
    })
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de copier le numéro'
    })
  }
}

const refreshTracking = async () => {
  if (!props.trackingData?.tracking_number) return
  
  refreshing.value = true
  try {
    const updatedData = await shipmentsStore.trackShipment(props.trackingData.tracking_number)
    // Émettre un événement pour mettre à jour les données dans le parent
    emit('tracking-updated', updatedData)
    
    addNotification({
      type: 'success',
      title: 'Actualisé',
      message: 'Informations de suivi mises à jour'
    })
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible d\'actualiser les informations'
    })
  } finally {
    refreshing.value = false
  }
}

const shareTracking = async () => {
  const trackingUrl = `${window.location.origin}/tracking/${props.trackingData.tracking_number}`
  
  try {
    if (navigator.share) {
      // Utiliser l'API native de partage si disponible
      await navigator.share({
        title: 'Suivi de colis',
        text: `Suivez votre colis ${props.trackingData.tracking_number}`,
        url: trackingUrl
      })
    } else {
      // Fallback : copier l'URL
      await navigator.clipboard.writeText(trackingUrl)
      addNotification({
        type: 'success',
        title: 'Lien copié',
        message: 'Le lien de suivi a été copié dans le presse-papier'
      })
    }
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de partager le lien de suivi'
    })
  }
}
</script>

<style scoped>
/* Animation pour la barre de progression */
.progress-bar {
  transition: width 0.5s ease-in-out;
}

/* Animation pour les icônes de statut */
.status-icon {
  transition: all 0.3s ease;
}

/* Styles pour le timeline */
.timeline-item {
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 32px;
  bottom: -8px;
  width: 2px;
  background: linear-gradient(to bottom, #e5e7eb, transparent);
}

.timeline-item:last-child::before {
  display: none;
}

/* Responsive design */
@media (max-width: 640px) {
  .tracking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .tracking-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .tracking-actions button {
    width: 100%;
    justify-content: center;
  }
}

/* Dark mode amélioré */
@media (prefers-color-scheme: dark) {
  .progress-bar-bg {
    background-color: #374151;
  }
  
  .timeline-connector {
    background-color: #4b5563;
  }
}
</style>