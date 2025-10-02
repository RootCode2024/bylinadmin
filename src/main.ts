import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'
import { createPinia } from 'pinia'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import websocketService from './services/websocket'
import { useAuthStore } from './stores/auth'
import echo from './plugins/echo'

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(VueApexCharts)

app.config.globalProperties.$echo = echo

app.use(pinia)

// Initialiser WebSocket après l'authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Si l'utilisateur est connecté et WebSocket pas encore initialisé
  if (authStore.isAuthenticated && !websocketService.isConnected) {
    websocketService.init()
    websocketService.requestNotificationPermission()
  }

  // Si l'utilisateur se déconnecte
  if (!authStore.isAuthenticated && websocketService.isConnected) {
    websocketService.disconnect()
  }

  next()
})

// Gérer la fermeture de l'application
window.addEventListener('beforeunload', () => {
  websocketService.disconnect()
})

app.mount('#app')
