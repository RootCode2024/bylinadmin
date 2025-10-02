<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div class="fixed top-4 right-4 z-50 max-w-sm w-full pointer-events-auto">
      <div 
        class="rounded-lg shadow-lg pointer-events-auto"
        :class="toastClasses"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Icône Success -->
              <svg
                v-if="type === 'success'"
                class="h-6 w-6"
                :class="iconClasses"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              
              <!-- Icône Error -->
              <svg
                v-else-if="type === 'error'"
                class="h-6 w-6"
                :class="iconClasses"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              
              <!-- Icône Warning -->
              <svg
                v-else-if="type === 'warning'"
                class="h-6 w-6"
                :class="iconClasses"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
              
              <!-- Icône Info -->
              <svg
                v-else-if="type === 'info'"
                class="h-6 w-6"
                :class="iconClasses"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium" :class="titleClasses">
                {{ getTitle() }}
              </p>
              <p v-if="message" class="mt-1 text-sm" :class="messageClasses">
                {{ message }}
              </p>
            </div>
            
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="close"
                class="rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="closeButtonClasses"
              >
                <span class="sr-only">Fermer</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path 
                    fill-rule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clip-rule="evenodd" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 3000
  },
  persistent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// Classes dynamiques basées sur le type
const toastClasses = computed(() => {
  const baseClasses = 'bg-white dark:bg-gray-800 border-l-4'
  
  switch (props.type) {
    case 'success':
      return `${baseClasses} border-green-400`
    case 'error':
      return `${baseClasses} border-red-400`
    case 'warning':
      return `${baseClasses} border-yellow-400`
    case 'info':
    default:
      return `${baseClasses} border-blue-400`
  }
})

const iconClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-400'
    case 'error':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'info':
    default:
      return 'text-blue-400'
  }
})

const titleClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-800 dark:text-green-200'
    case 'error':
      return 'text-red-800 dark:text-red-200'
    case 'warning':
      return 'text-yellow-800 dark:text-yellow-200'
    case 'info':
    default:
      return 'text-blue-800 dark:text-blue-200'
  }
})

const messageClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-700 dark:text-green-300'
    case 'error':
      return 'text-red-700 dark:text-red-300'
    case 'warning':
      return 'text-yellow-700 dark:text-yellow-300'
    case 'info':
    default:
      return 'text-blue-700 dark:text-blue-300'
  }
})

const closeButtonClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-400 hover:text-green-600 focus:ring-green-500'
    case 'error':
      return 'text-red-400 hover:text-red-600 focus:ring-red-500'
    case 'warning':
      return 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500'
    case 'info':
    default:
      return 'text-blue-400 hover:text-blue-600 focus:ring-blue-500'
  }
})

// Méthodes
const getTitle = () => {
  if (props.title) return props.title
  
  switch (props.type) {
    case 'success':
      return 'Succès'
    case 'error':
      return 'Erreur'
    case 'warning':
      return 'Attention'
    case 'info':
    default:
      return 'Information'
  }
}

const close = () => {
  emit('close')
}

// Auto-fermeture
onMounted(() => {
  if (!props.persistent && props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>