<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import { useAuthStore } from '@/stores/auth.js'
import { useWebSocket } from '@/services/websocket.js'
import WebSocketStatus from '@/components/common/WebSocketStatus.vue'

const authStore = useAuthStore()
const { websocketService } = useWebSocket()

const showConnectionStatus = ref(false)

onMounted(() => {
  // Initialiser WebSocket si utilisateur connecté
  if (authStore.isAuthenticated) {
    websocketService.init()
  }

  // Montrer le statut de connexion en développement
  showConnectionStatus.value = import.meta.env.DEV
})

onUnmounted(() => {
  websocketService.disconnect()
})
</script>
