<template>
  <Modal :show="true" @close="$emit('close')" :fullScreenBackup="true">
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Détails de la transaction</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">Informations</h3>
          <div class="space-y-2">
            <p><span class="font-medium">ID:</span> {{ transaction.id }}</p>
            <p><span class="font-medium">Montant:</span> {{ formatCurrency(transaction.amount) }}</p>
            <p><span class="font-medium">Statut:</span>
              <span :class="statusClasses(transaction.status)">
                {{ transaction.status }}
              </span>
            </p>
          </div>
        </div>

        <div>
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">Client</h3>
          <div class="flex items-center">
            <img :src="transaction.customer.avatar_url" class="w-10 h-10 rounded-full mr-3">
            <div>
              <p class="font-medium">{{ transaction.customer.name }}</p>
              <p class="text-sm text-gray-500">{{ transaction.customer.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="$emit('refund')"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Rembourser
        </button>
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Fermer
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { defineProps } from 'vue'
import Modal from '@/components/ui/Modal.vue'

defineProps({
  transaction: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'refund'])

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const statusClasses = (status) => {
  const classes = {
    completed: 'text-green-600 dark:text-green-400',
    pending: 'text-yellow-600 dark:text-yellow-400',
    failed: 'text-red-600 dark:text-red-400'
  }
  return classes[status] || 'text-gray-600 dark:text-gray-400'
}
</script>
