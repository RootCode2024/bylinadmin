<template>
  <div class="p-4 bg-white rounded-lg shadow dark:bg-gray-800 border dark:border-gray-700">
    <div class="flex items-start justify-between">
      <div class="flex items-start">
        <div class="bg-blue-100 p-3 rounded-full mr-4 dark:bg-blue-900/30">
          <span class="text-xl">{{ integration.icon }}</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-900 dark:text-white">{{ integration.name }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ integration.description }}</p>
        </div>
      </div>
      <button
        @click="$emit('connect')"
        class="px-3 py-1 text-sm rounded-full"
        :class="connected ?
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
      >
        {{ connected ? 'Connecté' : 'Connecter' }}
      </button>
    </div>

    <div v-if="connected" class="mt-4 pt-4 border-t dark:border-gray-700">
      <button class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
        Paramètres
      </button>
      <button class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
        Documentation
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  integration: {
    type: Object,
    required: true
  },
  connected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['connect'])
</script>
