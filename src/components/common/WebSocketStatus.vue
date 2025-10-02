<template>
  <div
    v-if="showStatus"
    :class="statusClasses"
    class="fixed bottom-4 right-4 px-3 py-2 rounded-lg text-xs font-medium z-50 transition-all duration-300"
  >
    <div class="flex items-center space-x-2">
      <div :class="indicatorClasses" class="w-2 h-2 rounded-full"></div>
      <span>{{ statusText }}</span>
      <span class="text-gray-400">{{ stats.activeChannels }} canaux</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@/services/websocket'

const { getStats, isConnected } = useWebSocket()

const stats = ref({ isConnected: false, activeChannels: 0, connectionState: 'disconnected' })
const showStatus = ref(true)

const statusClasses = computed(() => {
  if (stats.value.isConnected) {
    return 'bg-green-100 text-green-800 border border-green-200'
  } else {
    return 'bg-red-100 text-red-800 border border-red-200'
  }
})

const indicatorClasses = computed(() => {
  if (stats.value.isConnected) {
    return 'bg-green-500 animate-pulse'
  } else {
    return 'bg-red-500'
  }
})

const statusText = computed(() => {
  return stats.value.isConnected ? 'Connecté' : 'Déconnecté'
})

let interval = null

onMounted(() => {
  updateStats()
  interval = setInterval(updateStats, 2000)

  // Masquer après 10 secondes si tout va bien
  setTimeout(() => {
    if (stats.value.isConnected) {
      showStatus.value = false
    }
  }, 10000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})

const updateStats = () => {
  const currentStats = getStats()
  if (currentStats) {
    stats.value = currentStats
  }
}
</script>
