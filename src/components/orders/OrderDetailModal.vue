<template>
  <Modal :show="true" :width="`max-w-[95%]`" @close="$emit('close')">
    <div class="p-6">
      <!-- En-tête -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Commande #{{ order.order_number }}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Passée le {{ formatDate(order.date) }}
          </p>
          <div v-if="order.shipment?.tracking_number" class="mt-1">
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              📦 {{ order.shipment.tracking_number }}
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span :class="statusBadgeClasses" class="px-3 py-1 rounded-full text-sm font-medium">
            {{ statusLabel }}
          </span>
          <button @click="$emit('close')" class="text-gray-400 hover:text-red-500 dark:hover:text-red-300">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Contenu en 2 colonnes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Colonne de gauche - Produits -->
        <div class="md:col-span-2">
          <h3 class="font-medium text-lg mb-4 text-gray-900 dark:text-white">Articles</h3>
          <div class="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
            <div v-for="(item, index) in order.items" :key="index"
                 class="py-3 border-b last:border-b-0 dark:border-gray-600">
              <div class="flex justify-between">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ item.product_name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Quantité: {{ item.quantity }} × {{ formatCurrency(item.unit_price) }}
                  </p>
                </div>
                <p class="font-medium">
                  {{ formatCurrency(item.quantity * item.unit_price) }}
                </p>
              </div>
            </div>

            <!-- Total -->
            <div class="mt-4 pt-4 border-t dark:border-gray-600">
              <div class="flex justify-between py-2">
                <span>Sous-total</span>
                <span>{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between py-2">
                <span>Livraison</span>
                <span>{{ formatCurrency(order.shipping_cost || 0) }}</span>
              </div>
              <div class="flex justify-between py-2 font-bold text-lg">
                <span>Total</span>
                <span>{{ formatCurrency(order.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Section d'assignation (visible si commande assignée) -->
          <div v-if="order.is_assigned && (order.assigned_by || order.delivery_person)" class="mt-6">
            <h3 class="font-medium text-lg mb-4 text-gray-900 dark:text-white">Informations d'assignation</h3>
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">

              <!-- Assigné par -->
              <div v-if="order.assigned_by" class="mb-4">
                <h4 class="flex items-center text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  <UserIcon class="h-4 w-4 mr-1" />
                  Assigné par
                </h4>
                <div class="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <img v-if="order.assigned_by?.avatar_url"
                       :src="order.assigned_by.avatar_url"
                       class="w-10 h-10 rounded-full border-2 border-blue-200">
                  <div v-else class="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <UserIcon class="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">{{ order.assigned_by?.name || 'Non spécifié' }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ order.assigned_by?.email || 'Email non disponible' }}</p>
                    <p class="text-xs text-blue-600 dark:text-blue-400" v-if="order.assigned_at">
                      Le {{ formatDate(order.assigned_at) }} à {{ formatTime(order.assigned_at) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Assigné à (Livreur/Service) -->
              <div v-if="order.delivery_person">
                <h4 class="flex items-center text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                  <TruckIcon class="h-4 w-4 mr-1" />
                  {{ order.delivery_person.type === 'livreur' ? 'Assigné au livreur' : 'Service de livraison' }}
                </h4>
                <div class="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <img v-if="order.delivery_person?.avatar_url"
                       :src="order.delivery_person.avatar_url"
                       class="w-10 h-10 rounded-full border-2 border-green-200">
                  <div v-else class="h-10 w-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <TruckIcon class="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">{{ order.delivery_person?.name || 'Non assigné' }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ order.delivery_person?.email || order.delivery_person?.phone || 'Contact non disponible' }}</p>
                    <div class="flex items-center space-x-4 mt-1">
                      <p class="text-sm text-gray-500 dark:text-gray-400" v-if="order.delivery_person?.phone">
                        <PhoneIcon class="h-3 w-3 inline-block mr-1" />
                        {{ order.delivery_person.phone }}
                      </p>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            :class="deliveryPersonStatusClasses"
                            v-if="order.delivery_person?.status || order.delivery_person?.is_available !== undefined">
                        <span class="w-2 h-2 rounded-full mr-1" :class="deliveryPersonStatusDot"></span>
                        {{ getDeliveryPersonStatus() }}
                      </span>
                      <span v-if="order.delivery_person?.rating" class="text-xs text-yellow-600">
                        ⭐ {{ order.delivery_person.rating }}/5
                      </span>
                    </div>
                    <div v-if="order.delivery_person?.type" class="mt-1">
                      <span class="text-xs px-2 py-1 rounded-full" :class="deliveryTypeClasses">
                        {{ formatDeliveryType(order.delivery_person.type) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Statut de livraison -->
              <div v-if="order.shipment?.status" class="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">Statut de livraison :</span>
                  <span :class="shipmentStatusClasses(order.shipment.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ getShipmentStatusLabel(order.shipment.status) }}
                  </span>
                </div>
                <div v-if="order.shipment.shipping_type" class="mt-2 text-xs text-gray-500">
                  Type : {{ order.shipment.shipping_type === 'express' ? 'Express' : 'Standard' }}
                </div>
              </div>

              <!-- Notes d'assignation -->
              <div v-if="order.assignment_note || order.shipment?.admin_notes" class="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <p class="text-sm text-yellow-800 dark:text-yellow-200">
                  <span class="font-medium">Note :</span>
                  {{ order.assignment_note || order.shipment?.admin_notes }}
                </p>
              </div>

              <!-- Notes du livreur -->
              <div v-if="order.shipment?.delivery_notes" class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <p class="text-sm text-green-800 dark:text-green-200">
                  <span class="font-medium">Note du livreur :</span>
                  {{ order.shipment.delivery_notes }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne de droite - Infos client et statut -->
        <div>
          <div class="mb-6">
            <h3 class="font-medium text-lg mb-3 text-gray-900 dark:text-white">Client</h3>
            <div class="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
              <div class="flex items-center mb-3">
                <img v-if="order.user.avatar_url" :src="order.user.avatar_url" class="w-10 h-10 rounded-full mr-3">
                <div v-else class="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-center">
                  <span class="text-gray-400" style="font-size: 10px;">Aucune <br/> image</span>
                </div>
                <div>
                  <p class="font-medium">{{ order.user.name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ order.user.email }}</p>
                </div>
              </div>
              <p class="text-sm" v-if="order.user.phone">
                <PhoneIcon class="h-4 w-4 inline-block mr-1" />
                {{ order.user.phone }}
              </p>
            </div>
          </div>

          <div>
            <h3 class="font-medium text-lg mb-3 text-gray-900 dark:text-white">Adresse</h3>
            <div class="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
              <p class="text-sm">{{ order.shipping_address.street_line }}</p>
              <p class="text-sm">{{ order.shipping_address.city }}</p>
              <p class="text-sm">{{ order.shipping_address.country_name }} ({{ order.shipping_address.country_code }})</p>
            </div>
          </div>

          <!-- Changer statut -->
          <div class="mt-6">
            <h3 class="font-medium text-lg mb-3 text-gray-900 dark:text-white">Statut</h3>
            <div class="flex items-center space-x-2">
              <select v-model="newStatus" class="flex-1 p-2 border rounded-lg">
                <option v-for="(status, index) in availableStatuses" :value="status.value" :disabled="status.value === order.status" :key="index">
                  {{ status.label }}
                </option>
              </select>
              <button
                @click="updateStatus"
                :disabled="newStatus === order.status"
                class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Fermer
        </button>
        <button
          v-if="order.status === 'processing'"
          @click="processShipping"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Assigner à un livreur
        </button>
        <button
          v-if="order.is_assigned && order.delivery_person"
          @click="contactDeliveryPerson"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Contacter le livreur
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { XMarkIcon, PhoneIcon, UserIcon, TruckIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update-status', 'prepare-shipping', 'contact-delivery-person'])

// Gestion du statut
const newStatus = ref(props.order.status)
const availableStatuses = [
  { value: 'paid', label: 'Payé' },
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En traitement' },
  { value: 'assigned', label: 'Assignée' },
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

const statusLabel = computed(() => {
  const status = availableStatuses.find(s => s.value === props.order.status)
  return status ? status.label : props.order.status
})

const statusBadgeClasses = computed(() => {
  const classes = {
    paid: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    assigned: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[props.order.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
})

const deliveryPersonStatusClasses = computed(() => {
  const isAvailable = props.order.delivery_person?.is_available
  return isAvailable
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
})

const deliveryPersonStatusDot = computed(() => {
  const isAvailable = props.order.delivery_person?.is_available
  return isAvailable ? 'bg-green-400' : 'bg-red-400'
})

const deliveryTypeClasses = computed(() => {
  const type = props.order.delivery_person?.type
  return {
    'bg-blue-100 text-blue-800': type === 'livreur',
    'bg-green-100 text-green-800': type === 'service'
  }
})

// Calculs
const subtotal = computed(() => {
  return props.order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
})

// Méthodes
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
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDeliveryType = (type) => {
  const types = {
    'livreur': 'Livreur individuel',
    'service': 'Service de livraison'
  }
  return types[type] || type
}

const getDeliveryPersonStatus = () => {
  const deliveryPerson = props.order.delivery_person
  if (!deliveryPerson) return ''

  if (deliveryPerson.status) {
    return deliveryPerson.status
  }

  return deliveryPerson.is_available ? 'Disponible' : 'Occupé'
}

const updateStatus = () => {
  emit('update-status', {
    orderId: props.order.id,
    shipmentId: props.order.shipment.id,
    newStatus: newStatus.value
  })
}

const processShipping = () => {
  emit('prepare-shipping', props.order)
  emit('close')
}

const contactDeliveryPerson = () => {
  emit('contact-delivery-person', props.order.delivery_person)
}
</script>
