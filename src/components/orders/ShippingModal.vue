<template>
  <Modal :show="true" :width="`max-w-[70%]`" @close="$emit('close')">
    <div class="p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Assigner la commande #{{ order.order_number }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Montant: {{ formatPrice(order.total) }} | Articles: {{ order.items?.length || 0 }}
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Messages d'erreur -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <div class="space-y-6">
        <!-- Sélection du transporteur/livreur -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Service de livraison / Livreur
          </label>

          <!-- Chargement -->
          <div v-if="deliveryStore.loading" class="w-full p-3 border rounded-lg bg-gray-50">
            <div class="flex items-center space-x-2">
              <div class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span class="text-sm text-gray-600">Chargement des services de livraison...</span>
            </div>
          </div>

          <!-- Sélecteur -->
          <select
            v-else
            v-model="shippingData.deliveryId"
            @change="onDeliveryChange"
            class="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :disabled="submitting"
          >
            <option value="">Sélectionnez un service de livraison</option>
            <optgroup v-if="localDeliveries.length" label="🏠 Livreurs locaux">
              <option
                v-for="delivery in localDeliveries"
                :value="delivery.id"
                :key="delivery.id"
                :disabled="!delivery.is_available"
              >
                {{ delivery.name }}
                <span v-if="delivery.rating">(⭐ {{ delivery.rating }})</span>
                <span v-if="!delivery.is_available" class="text-red-500">(Indisponible)</span>
              </option>
            </optgroup>
            <optgroup v-if="externalServices.length" label="🌍 Services externes">
              <option
                v-for="service in externalServices"
                :value="service.id"
                :key="service.id"
                :disabled="!service.is_available"
              >
                {{ service.name }}
                <span v-if="!service.is_available" class="text-red-500">(Indisponible)</span>
              </option>
            </optgroup>
          </select>

          <!-- Pas de services disponibles -->
          <div v-if="!deliveryStore.loading && availableDeliveries.length === 0"
               class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-yellow-800">
              ⚠️ Aucun service de livraison disponible pour cette zone.
              <button @click="refreshDeliveries" class="underline">Actualiser</button>
            </p>
          </div>
        </div>

        <!-- Informations du service/livreur sélectionné -->
        <div v-if="selectedDelivery" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="flex items-start space-x-3">
            <div class="w-3 h-3 rounded-full mt-1" :class="deliveryStatusClass"></div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="font-medium" :class="deliveryTypeTextClass">
                  {{ selectedDelivery.name }}
                </span>
                <span class="text-xs px-2 py-1 rounded-full" :class="coverageTypeClass">
                  {{ formatCoverageType(selectedDelivery.coverage_type) }}
                </span>
                <span class="text-xs px-2 py-1 rounded-full" :class="deliveryTypeClass">
                  {{ formatDeliveryType(selectedDelivery.type) }}
                </span>
              </div>

              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p v-if="selectedDelivery.phone">📞 {{ selectedDelivery.phone }}</p>
                <p v-if="selectedDelivery.email">✉️ {{ selectedDelivery.email }}</p>
                <p v-if="selectedDelivery.vehicle_type">🚗 {{ formatVehicleType(selectedDelivery.vehicle_type) }}</p>
                <p v-if="selectedDelivery.working_hours">
                  🕐 {{ selectedDelivery.working_hours.start }} - {{ selectedDelivery.working_hours.end }}
                </p>
                <p v-if="selectedDelivery.rating">
                  ⭐ {{ selectedDelivery.rating }}/5 ({{ selectedDelivery.total_deliveries }} livraisons)
                </p>
                <p v-if="selectedDelivery.zones && selectedDelivery.zones.length">
                  📍 Zones: {{ selectedDelivery.zones.join(', ') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Type de livraison -->
        <div v-if="selectedDelivery && hasExpressOption">
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Type de livraison
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                v-model="shippingData.shippingType"
                value="standard"
                class="mr-3"
              >
              <div>
                <div class="font-medium">Standard</div>
                <div class="text-sm text-gray-500">24-48h</div>
              </div>
            </label>
            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                v-model="shippingData.shippingType"
                value="express"
                class="mr-3"
              >
              <div>
                <div class="font-medium">Express</div>
                <div class="text-sm text-gray-500">6-12h</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Numéro de suivi -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ trackingNumberLabel }}
          </label>
          <input
            v-model="shippingData.trackingNumber"
            type="text"
            :readonly="isTrackingReadonly"
            :class="trackingInputClass"
            :placeholder="trackingPlaceholder"
          >
          <p v-if="isLocalDelivery" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Numéro généré automatiquement pour le suivi interne
          </p>
        </div>

        <!-- Informations destinataire -->
        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Informations destinataire
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-xs text-gray-600 dark:text-gray-400">Nom complet</label>
              <input
                v-model="shippingData.recipientName"
                type="text"
                class="w-full p-2 border rounded text-sm"
                :placeholder="order.user?.name || 'Nom du destinataire'"
              >
            </div>
            <div>
              <label class="block mb-1 text-xs text-gray-600 dark:text-gray-400">Téléphone</label>
              <input
                v-model="shippingData.recipientPhone"
                type="tel"
                class="w-full p-2 border rounded text-sm"
                :placeholder="order.user?.phone || 'Numéro de téléphone'"
              >
            </div>
            <div class="md:col-span-2">
              <label class="block mb-1 text-xs text-gray-600 dark:text-gray-400">Email (optionnel)</label>
              <input
                v-model="shippingData.recipientEmail"
                type="email"
                class="w-full p-2 border rounded text-sm"
                :placeholder="order.user?.email || 'Email du destinataire'"
              >
            </div>
          </div>
          <div class="mt-3">
            <label class="block mb-1 text-xs text-gray-600 dark:text-gray-400">Adresse de livraison</label>
            <textarea
              v-model="shippingData.shippingAddress"
              rows="2"
              class="w-full p-2 border rounded text-sm"
              :placeholder="formattedAddress"
            ></textarea>
          </div>
        </div>

        <!-- Instructions pour le livreur -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ notesLabel }}
            <span v-if="isLocalDelivery" class="text-red-500">*</span>
          </label>
          <textarea
            v-model="shippingData.adminNotes"
            :rows="isLocalDelivery ? 4 : 3"
            class="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="notesPlaceholder"
            :required="isLocalDelivery"
          ></textarea>

          <!-- Exemple pour livreur local -->
          <div v-if="isLocalDelivery && !shippingData.adminNotes"
               class="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p class="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              💡 Exemple d'instructions pour le livreur :
            </p>
            <p class="text-xs text-yellow-700 dark:text-yellow-400 italic mb-2">
              "Récupérer les articles aux points de collecte, puis livrer à l'adresse indiquée.
              Appeler le client avant la livraison. Confirmer la livraison via WhatsApp."
            </p>
            <button
              @click="useExampleNote"
              class="text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 px-2 py-1 rounded text-yellow-800 dark:text-yellow-200"
            >
              Utiliser cet exemple
            </button>
          </div>
        </div>

        <!-- Informations service externe -->
        <div v-if="isExternalService" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div class="flex items-start space-x-2">
            <div class="text-green-600 dark:text-green-400 mt-1">ℹ️</div>
            <div class="text-sm text-green-800 dark:text-green-300">
              <p class="font-medium mb-1">Service externe sélectionné</p>
              <p>Le colis sera confié à {{ selectedDelivery?.name }}.
              Assurez-vous d'avoir préparé le colis selon leurs standards et
              que tous les documents nécessaires sont joints.</p>
            </div>
          </div>
        </div>

        <!-- Coût estimé -->
        <div v-if="selectedDelivery" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="font-medium">Coût de livraison estimé:</span>
            <span class="text-lg font-bold">{{ formatPrice(estimatedCost) }}</span>
          </div>
          <p v-if="order.total >= 100000 && isLocalDelivery" class="text-sm text-green-600 mt-1">
            🎉 Livraison gratuite (commande ≥ 100 000 FCFA)
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-8 flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          :disabled="submitting"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          @click="confirmAssignment"
          :disabled="!canSubmit || submitting"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <div v-if="submitting" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>{{ submitting ? 'Traitement...' : confirmButtonText }}</span>
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useDeliveryStore } from '@/stores/delivery'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const deliveryStore = useDeliveryStore()
const error = ref(null)
const submitting = ref(false)

// Données du formulaire
const shippingData = ref({
  deliveryId: '',
  shippingType: 'standard',
  recipientName: props.order.user?.name || '',
  recipientPhone: props.order.user?.phone || '',
  recipientEmail: props.order.user?.email || '',
  shippingAddress: '',
  adminNotes: '',
  trackingNumber: ''
})

// Initialisation
onMounted(async () => {
  console.log('Commande à assigner:', props.order)
  try {
    await deliveryStore.fetchDeliveries({ is_active: true, is_available: true })

    // Pré-remplir l'adresse
    shippingData.value.shippingAddress = formattedAddress.value

    // Suggestion automatique du meilleur service
    if (typeof deliveryStore.getBestDeliveryForOrder === 'function') {
      const bestDelivery = deliveryStore.getBestDeliveryForOrder(
        props.order.total,
        getOrderCity(),
        shippingData.value.shippingType
      )

      if (bestDelivery) {
        shippingData.value.deliveryId = bestDelivery.id
        updateTrackingNumber()
      }
    }
  } catch (err) {
    error.value = 'Erreur lors du chargement des services de livraison'
    console.error('Failed to load deliveries:', err)
  }
})

// Computed properties
const availableDeliveries = computed(() => {
  if (!deliveryStore.availableDeliveries) return []
  
  return deliveryStore.availableDeliveries.filter(delivery => {
    const orderCity = getOrderCity()
    return delivery.zones?.includes(orderCity) ||
           delivery.zones?.includes('all') ||
           delivery.coverage_type === 'international'
  })
})

const localDeliveries = computed(() =>
  availableDeliveries.value.filter(d => d.coverage_type === 'local')
)

const externalServices = computed(() =>
  availableDeliveries.value.filter(d => d.coverage_type !== 'local')
)

const selectedDelivery = computed(() => {
  if (!shippingData.value.deliveryId) return null
  return deliveryStore.getDeliveryById ? 
    deliveryStore.getDeliveryById(shippingData.value.deliveryId) :
    availableDeliveries.value.find(d => d.id == shippingData.value.deliveryId)
})

const isLocalDelivery = computed(() =>
  selectedDelivery.value?.coverage_type === 'local'
)

const isExternalService = computed(() =>
  selectedDelivery.value?.coverage_type !== 'local'
)

const hasExpressOption = computed(() =>
  selectedDelivery.value?.coverage_type === 'local'
)

const deliveryStatusClass = computed(() =>
  selectedDelivery.value?.is_available ? 'bg-green-500' : 'bg-red-500'
)

const deliveryTypeTextClass = computed(() =>
  isLocalDelivery.value ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'
)

const coverageTypeClass = computed(() => {
  const type = selectedDelivery.value?.coverage_type
  return {
    'bg-blue-100 text-blue-800': type === 'local',
    'bg-yellow-100 text-yellow-800': type === 'national',
    'bg-green-100 text-green-800': type === 'international'
  }
})

const deliveryTypeClass = computed(() => {
  const type = selectedDelivery.value?.type
  return {
    'bg-purple-100 text-purple-800': type === 'livreur',
    'bg-orange-100 text-orange-800': type === 'service'
  }
})

const trackingNumberLabel = computed(() =>
  isLocalDelivery.value ? 'Numéro de suivi interne' : 'Numéro de suivi'
)

const trackingPlaceholder = computed(() =>
  isExternalService.value ? 'Sera fourni par le service' : 'Numéro généré automatiquement'
)

const isTrackingReadonly = computed(() => isLocalDelivery.value)

const trackingInputClass = computed(() => {
  const baseClass = 'w-full p-2.5 border rounded-lg'
  const focusClass = 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  const readonlyClass = 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'

  return isTrackingReadonly.value
    ? `${baseClass} ${readonlyClass}`
    : `${baseClass} ${focusClass}`
})

const notesLabel = computed(() =>
  isLocalDelivery.value ? 'Instructions pour le livreur' : 'Notes d\'assignation (optionnel)'
)

const notesPlaceholder = computed(() =>
  isLocalDelivery.value
    ? 'Instructions détaillées pour le livreur (points de collecte, consignes de livraison, etc.)'
    : 'Notes ou instructions spéciales...'
)

const confirmButtonText = computed(() =>
  isLocalDelivery.value ? 'Assigner au livreur' : 'Assigner au service'
)

const canSubmit = computed(() => {
  const hasDelivery = !!shippingData.value.deliveryId
  const hasRecipientInfo = !!shippingData.value.recipientName.trim() && 
                           !!shippingData.value.recipientPhone.trim()
  const hasAddress = !!shippingData.value.shippingAddress.trim()
  const hasNotes = isLocalDelivery.value ? !!shippingData.value.adminNotes.trim() : true

  return hasDelivery && hasRecipientInfo && hasAddress && hasNotes && !submitting.value
})

const formattedAddress = computed(() => {
  const address = props.order.shipping_address
  if (typeof address === 'string') return address
  if (typeof address === 'object' && address) {
    const parts = [
      address.street_line || address.street,
      address.district,
      address.city,
      address.country_name || address.country
    ].filter(Boolean)
    return parts.join(', ')
  }
  return 'Adresse non disponible'
})

const estimatedCost = computed(() => {
  if (!selectedDelivery.value) return 0

  // Si livraison gratuite pour commandes locales ≥ 100k
  if (isLocalDelivery.value && props.order.total >= 100000) {
    return 0
  }

  // Coût de base selon le type de livraison
  const basePrice = selectedDelivery.value.base_price || 5000 // Prix par défaut
  const multiplier = shippingData.value.shippingType === 'express' ? 1.5 : 1

  return basePrice * multiplier
})

// Watchers
watch(() => shippingData.value.deliveryId, () => {
  updateTrackingNumber()
  shippingData.value.adminNotes = ''
})

watch(() => shippingData.value.shippingType, () => {
  updateTrackingNumber()
})

// Méthodes
const getOrderCity = () => {
  const address = props.order.shipping_address
  if (typeof address === 'object' && address?.city) {
    return address.city
  }
  // Par défaut, essayer d'extraire la ville de l'adresse string
  if (typeof address === 'string') {
    // Simple heuristique pour détecter Cotonou, Porto-Novo, Lomé
    if (address.toLowerCase().includes('cotonou')) return 'Cotonou'
    if (address.toLowerCase().includes('porto-novo')) return 'Porto-Novo'
    if (address.toLowerCase().includes('lomé') || address.toLowerCase().includes('lome')) return 'Lomé'
  }
  return 'Cotonou' // Par défaut
}

const updateTrackingNumber = () => {
  if (selectedDelivery.value && props.order?.id) {
    const deliveryType = selectedDelivery.value.coverage_type === 'local' ? 'local' : 'external'
    const prefix = deliveryType === 'local' ? 'BYL' : 'EXT'
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const orderNumber = String(props.order.id).padStart(6, '0')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    shippingData.value.trackingNumber = `${prefix}-${date}-${orderNumber}-${random}`
  }
}

const onDeliveryChange = () => {
  updateTrackingNumber()
  shippingData.value.adminNotes = ''
  error.value = null
}

const useExampleNote = () => {
  const customerInfo = shippingData.value.recipientPhone ? ` Contact client : ${shippingData.value.recipientPhone}.` : ''
  const orderItems = props.order.items?.map(item => item.product_name || item.name).join(', ') || 'les articles'

  shippingData.value.adminNotes = `Récupérer ${orderItems} aux points de collecte indiqués, puis livrer à l'adresse : ${shippingData.value.shippingAddress}. ${customerInfo} Appeler le client avant la livraison. Confirmer la livraison via WhatsApp une fois terminée.`
}

const refreshDeliveries = async () => {
  try {
    await deliveryStore.fetchDeliveries({ is_active: true, is_available: true })
    error.value = null
  } catch (err) {
    error.value = 'Erreur lors de l\'actualisation '
  }
}

const formatPrice = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

const formatCoverageType = (type) => {
  const types = {
    'local': 'Local',
    'national': 'National',
    'international': 'International'
  }
  return types[type] || type
}

const formatDeliveryType = (type) => {
  const types = {
    'livreur': 'Livreur',
    'service': 'Service'
  }
  return types[type] || type
}

const formatVehicleType = (type) => {
  const types = {
    'moto': 'Moto',
    'voiture': 'Voiture',
    'camion': 'Camion',
    'avion': 'Avion'
  }
  return types[type] || type
}

const validateForm = () => {
  if (!shippingData.value.deliveryId) {
    error.value = 'Veuillez sélectionner un service de livraison'
    return false
  }

  if (!shippingData.value.recipientName.trim()) {
    error.value = 'Le nom du destinataire est requis'
    return false
  }

  if (!shippingData.value.recipientPhone.trim()) {
    error.value = 'Le téléphone du destinataire est requis'
    return false
  }

  if (!shippingData.value.shippingAddress.trim()) {
    error.value = 'L\'adresse de livraison est requise'
    return false
  }

  if (isLocalDelivery.value && !shippingData.value.adminNotes.trim()) {
    error.value = 'Les instructions pour le livreur sont obligatoires'
    return false
  }

  return true
}

const confirmAssignment = async () => {
  if (!validateForm()) return

  submitting.value = true
  error.value = null

  try {
    // Préparer les données avec tous les champs requis
    const assignmentData = {
      orderId: props.order.id,
      deliveryId: parseInt(shippingData.value.deliveryId),
      shippingType: shippingData.value.shippingType,
      recipientName: shippingData.value.recipientName.trim(),
      recipientPhone: shippingData.value.recipientPhone.trim(),
      recipientEmail: shippingData.value.recipientEmail?.trim() || null,
      shippingAddress: shippingData.value.shippingAddress.trim(),
      adminNotes: shippingData.value.adminNotes?.trim() || null,
      trackingNumber: shippingData.value.trackingNumber || null
    }

    console.log("Données d'assignation complètes :", assignmentData)

    // Vérifier que toutes les données requises sont présentes
    const requiredFields = ['orderId', 'deliveryId', 'shippingType', 'recipientName', 'recipientPhone', 'shippingAddress']
    const missingFields = requiredFields.filter(field => !assignmentData[field])
    
    if (missingFields.length > 0) {
      throw new Error(`Champs manquants: ${missingFields.join(', ')}`)
    }

    // Créer l'assignation via le store
    const result = await deliveryStore.updateShipment(assignmentData)
    
    console.log('Résultat de l\'assignation:', result)

    emit('confirm', {
      ...assignmentData,
      result
    })
    emit('close')
  } catch (err) {
    console.error('Assignment error:', err)
    
    // Gestion des erreurs de validation Laravel
    if (err.response?.status === 422) {
      const errors = err.response.data?.errors || {}
      const messages = Object.values(errors).flat()
      error.value = messages.length > 0 ? messages[0] : 'Erreur de validation des données'
    } else {
      error.value = err.response?.data?.message || err.message || 'Erreur lors de l\'assignation'
    }
    
    // Afficher les détails de l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('Détails de l\'erreur:', {
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      })
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Animation pour les alertes */
.alert-enter-active, .alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from, .alert-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Style pour les options désactivées */
option:disabled {
  color: #9CA3AF;
  background-color: #F3F4F6;
}

/* Style pour les champs requis */
.required-field::after {
  content: ' *';
  color: #EF4444;
}
</style>