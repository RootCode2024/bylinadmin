<template>
  <Modal :show="show" @close="$emit('cancel')" size="md">
    <template #header>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        {{ title }}
      </h3>
    </template>

    <template #body>
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          {{ message }}
        </p>
        <p v-if="warning" class="text-yellow-600 dark:text-yellow-400 text-sm">
          {{ warning }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          type="button"
          @click="$emit('confirm')"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
          :class="{
            'bg-green-600 hover:bg-green-700': action === 'restore',
            'bg-red-600 hover:bg-red-700': action === 'delete' || action === 'forceDelete',
            'bg-blue-600 hover:bg-blue-700': action === 'activate',
            'bg-yellow-600 hover:bg-yellow-700': action === 'activate'
          }"
        >
          <span v-if="isLoading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            En cours...
            </span>
          <span v-else>{{ action === 'restore' ? 'Rétablir' : action === 'delete' ? 'Supprimer' : action === 'forceDelete' ? 'Supprimer définitivement' : 'Activer' }}</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue'

defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirmer la suppression'
  },
  message: {
    type: String,
    required: true
  },
  action: {
    type: String,
    default: 'delete'
  },
  warning: String,
  isLoading: Boolean
})

defineEmits(['confirm', 'cancel'])
</script>