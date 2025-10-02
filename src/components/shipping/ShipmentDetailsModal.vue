<template>
  <SimpleModal :show="show" title="Détails de l'expédition" @close="$emit('close')">
    <div v-if="shipment" class="space-y-6">
      <!-- Informations principales -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Informations</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">N° de suivi:</span>
            <span class="font-medium text-gray-900 dark:text-white font-mono">{{ shipment.tracking_number }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Statut:</span>
            <span 
              :class="getStatusClass(shipment.status)"
              class="px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ getStatusLabel(shipment.status) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Client:</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ shipment.customer_name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Destinataire:</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ shipment.recipient_name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Téléphone:</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ shipment.recipient_phone }}</span>
          </div>
        </div>
      </div>

      <!-- Livreur -->
      <div v-if="shipment.delivery" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Livreur</h4>
        <div class="space-y-1 text-sm">
          <div class="font-medium text-gray-900 dark:text-white">{{ shipment.delivery.name }}</div>
          <div class="text-gray-500 dark:text-gray-400">{{ shipment.delivery.phone }}</div>
        </div>
      </div>

      <!-- Adresse -->
      <div v-if="shipment.shipping_address" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Adresse de livraison</h4>
        <div class="text-sm text-gray-600 dark:text-gray-300">
          <div>{{ shipment.shipping_address.street }}</div>
          <div>{{ shipment.shipping_address.city }}, {{ shipment.shipping_address.postal_code }}</div>
          <div>{{ shipment.shipping_address.country }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        @click="$emit('close')"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
      >
        Fermer
      </button>
      <button
        @click="$emit('update-status', shipment)"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Mettre à jour le statut
      </button>
    </template>
  </SimpleModal>
</template>

<script setup>
import SimpleModal from '@/components/ui/Modal.vue'

const props = defineProps({
  show: Boolean,
  shipment: Object
})

const emit = defineEmits(['close', 'update-status'])

const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    assigned: 'Assigné',
    picked_up: 'Récupéré',
    in_transit: 'En transit',
    out_for_delivery: 'En cours de livraison',
    delivered: 'Livré',
    failed: 'Échec',
    returned: 'Retourné',
    cancelled: 'Annulé'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    returned: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>