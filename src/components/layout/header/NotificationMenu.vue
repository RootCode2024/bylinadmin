<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      @click="toggleDropdown"
    >
      <!-- Badge de notification avec animation -->
      <span
        v-if="unreadCount > 0"
        :class="{ 'animate-ping': hasNewNotification }"
        class="absolute -top-1 -right-1 z-10 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>

      <!-- Point orange clignotant -->
      <span
        v-if="unreadCount > 0"
        :class="{ hidden: !notifying, flex: notifying }"
        class="absolute right-0 top-0.5 z-1 h-2 w-2 rounded-full bg-orange-400"
      >
        <span
          class="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 -z-1 animate-ping"
        ></span>
      </span>

      <svg
        class="fill-current"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
          fill=""
        />
      </svg>
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0 z-50"
    >
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
        <h5 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Notifications
          <span v-if="unreadCount > 0" class="ml-2 text-sm font-normal text-gray-500">
            ({{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }})
          </span>
        </h5>

        <div class="flex items-center space-x-2">
          <!-- Bouton marquer tout lu -->
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            :disabled="loading.markAllRead"
            class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
            title="Marquer tout comme lu"
          >
            <svg v-if="loading.markAllRead" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </button>

          <!-- Bouton fermer -->
          <button @click="closeDropdown" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <svg
              class="fill-current"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Liste des notifications -->
      <ul class="flex flex-col h-auto overflow-y-auto custom-scrollbar">
        <!-- État de chargement -->
        <li v-if="loading.fetch" v-for="n in 5" :key="`skeleton-${n}`" class="animate-pulse p-3">
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
            </div>
          </div>
        </li>

        <!-- Notifications réelles -->
        <li v-else v-for="notification in notifications" :key="notification.id">
          <div
            :class="[
              'flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer transition-colors',
              !notification.read_at ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            ]"
            @click="handleNotificationClick(notification)"
          >
            <!-- Icône de notification -->
            <span class="relative block w-10 h-10 rounded-full z-1 flex-shrink-0">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium',
                  getNotificationIconClass(notification.data.type)
                ]"
              >
                {{ notification.data.icon || '🔔' }}
              </div>
              <!-- Indicateur non lu -->
              <span
                v-if="!notification.read_at"
                class="absolute -top-1 -right-1 z-10 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-gray-dark"
              ></span>
            </span>

            <!-- Contenu de la notification -->
            <div class="flex-1 min-w-0">
              <div class="mb-1.5 text-theme-sm text-gray-500 dark:text-gray-400">
                <span class="font-medium text-gray-800 dark:text-white/90">
                  {{ notification.data.title }}
                </span>
              </div>

              <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {{ notification.data.message }}
              </p>

              <!-- Détails du produit si applicable -->
              <div v-if="notification.data.product" class="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <div class="flex items-center space-x-2">
                  <img
                    v-if="notification.data.product.image_url"
                    :src="notification.data.product.image_url"
                    :alt="notification.data.product.name"
                    class="w-6 h-6 rounded object-cover"
                    @error="$event.target.style.display='none'"
                  >
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate">
                      {{ notification.data.product.name }}
                    </p>
                    <p class="text-gray-500 dark:text-gray-400">
                      {{ formatPrice(notification.data.product.price) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Metadata -->
              <div class="flex items-center justify-between text-theme-xs text-gray-500 dark:text-gray-400">
                <div class="flex items-center space-x-2">
                  <span>{{ getNotificationTypeLabel(notification.data.type) }}</span>
                  <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{{ formatTimeAgo(notification.created_at) }}</span>
                </div>

                <!-- Actions rapides -->
                <div class="flex items-center space-x-1">
                  <button
                    v-if="!notification.read_at"
                    @click.stop="markAsRead(notification.id)"
                    :disabled="loading.markRead"
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                    title="Marquer comme lu"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>
                  <button
                    v-if="authStore.isSuperAdmin"
                    @click.stop="deleteNotification(notification.id)"
                    :disabled="loading.delete"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    title="Supprimer"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </li>

        <!-- État vide -->
        <li v-if="!loading.fetch && notifications.length === 0" class="p-8 text-center">
          <div class="text-gray-400 dark:text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5M9 7H4l5-5M7 7V3a1 1 0 011-1h8a1 1 0 011 1v4m-4 9v5"></path>
            </svg>
            <p class="text-sm">Aucune notification</p>
          </div>
        </li>
      </ul>

      <!-- Pied de page -->
      <router-link
        to="/notifications"
        class="mt-3 flex justify-center rounded-lg border border-gray-300 bg-white p-3 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-colors"
        @click="handleViewAllClick"
      >
        Voir toutes les notifications
      </router-link>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axiosConfig'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const instance = getCurrentInstance()
const echo = instance?.appContext.config.globalProperties.$echo

// État local
const dropdownOpen = ref(false)
const notifying = ref(false)
const dropdownRef = ref(null)
const hasNewNotification = ref(false)

// Données des notifications
const notifications = ref([])
const unreadCount = ref(0)

// États de chargement
const loading = ref({
  fetch: false,
  markRead: false,
  markAllRead: false,
  delete: false
})

// Polling pour les nouvelles notifications
let pollingInterval = null
let notificationChannel = null

// Computed
const totalNotifications = computed(() => notifications.value.length)

// Méthodes
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  notifying.value = false
  hasNewNotification.value = false

  if (dropdownOpen.value) {
    fetchNotifications()
  }
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const fetchNotifications = async () => {
  try {
    loading.value.fetch = true
    const response = await api.get('/api/admin/notifications', { params: { per_page: 10 } })

    if (response.success) {
      const newNotifications = response.data || []
      const previousIds = notifications.value.map(n => n.id)
      const hasNew = newNotifications.some(n => !previousIds.includes(n.id))

      if (hasNew && notifications.value.length > 0) {
        hasNewNotification.value = true
        notifying.value = true
        setTimeout(() => { hasNewNotification.value = false }, 3000)
      }

      notifications.value = newNotifications
      unreadCount.value = response.meta?.unread_count || 0
      notifying.value = unreadCount.value > 0
    }
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error)
  } finally {
    loading.value.fetch = false
  }
}

const fetchUnreadCount = async () => {
  try {
    const response = await api.get('/api/admin/notifications/unread-count')
    if (response.success) {
      const newCount = response.unread_count || 0
      if (newCount > unreadCount.value) {
        hasNewNotification.value = true
        notifying.value = true
        setTimeout(() => { hasNewNotification.value = false }, 3000)
      }
      unreadCount.value = newCount
      notifying.value = newCount > 0
    }
  } catch (error) {
    console.error('Erreur lors du comptage des notifications:', error)
  }
}

const markAsRead = async (notificationId) => {
  try {
    loading.value.markRead = true
    const response = await api.patch(`/notifications/${notificationId}/read`)
    if (response.data.success) {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) notification.read_at = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      notifying.value = unreadCount.value > 0
    }
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error)
  } finally {
    loading.value.markRead = false
  }
}

const markAllAsRead = async () => {
  try {
    loading.value.markAllRead = true
    const response = await api.patch('/notifications/mark-all-read')
    if (response.data.success) {
      notifications.value.forEach(n => { n.read_at = new Date().toISOString() })
      unreadCount.value = 0
      notifying.value = false
    }
  } catch (error) {
    console.error('Erreur lors du marquage global:', error)
  } finally {
    loading.value.markAllRead = false
  }
}

const deleteNotification = async (notificationId) => {
  try {
    loading.value.delete = true
    const response = await api.delete(`/api/admin/notifications/${notificationId}`)
    if (response.data.success) {
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        const notification = notifications.value[index]
        if (!notification.read_at) unreadCount.value = Math.max(0, unreadCount.value - 1)
        notifications.value.splice(index, 1)
        notifying.value = unreadCount.value > 0
      }
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    loading.value.delete = false
  }
}

const handleNotificationClick = (notification) => {
  if (!notification.read_at) markAsRead(notification.id)
  if (notification.data.action_url) {
    router.push(notification.data.action_url)
    closeDropdown()
  }
}

const getNotificationIconClass = (type) => {
  const classes = {
    product_created: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    order_placed: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    stock_low: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    user_registered: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    system: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[type] || classes.system
}

const getNotificationTypeLabel = (type) => {
  const labels = {
    product_created: 'Produit',
    order_placed: 'Commande',
    stock_low: 'Stock',
    user_registered: 'Utilisateur',
    system: 'Système'
  }
  return labels[type] || 'Notification'
}

const formatPrice = (amount) => {
  if (!amount) return ''
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })
    .format(amount).replace('XOF', 'F CFA')
}

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  if (diffInSeconds < 60) return "À l'instant"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) closeDropdown()
}

const handleViewAllClick = () => {
  closeDropdown()
}

const listenToNotifications = () => {
  if (!echo || !authStore.user) return
  const userId = authStore.user.id
  notificationChannel = echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
      notifications.value.unshift({
        id: notification.id,
        type: notification.type,
        data: notification,
        read_at: null,
        created_at: new Date().toISOString()
      })
      unreadCount.value++
      notifying.value = true
      hasNewNotification.value = true
      playNotificationSound()
      showBrowserNotification(notification)
      setTimeout(() => { hasNewNotification.value = false }, 3000)
    })

  echo.connector.pusher.connection.bind('error', (error) => console.error('Erreur de connexion Pusher:', error))
  echo.connector.pusher.connection.bind('connected', () => console.log('Connecté à Pusher'))
}

const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification-sound.mp3')
    audio.volume = 0.5
    audio.play().catch(err => console.log('Impossible de jouer le son:', err))
  } catch {}
}

const showBrowserNotification = (notification) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title || 'Nouvelle notification', {
      body: notification.message,
      icon: '/logo.png',
      badge: '/logo.png'
    })
  }
}

const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission()
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchUnreadCount()
  listenToNotifications()
  requestNotificationPermission()
  pollingInterval = setInterval(fetchUnreadCount, 120000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollingInterval) clearInterval(pollingInterval)
  if (notificationChannel && echo) echo.leave(`App.Models.User.${authStore.user?.id}`)
})
</script>




<style scoped>
/* Scrollbar personnalisée */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}

/* Animation pour le badge */
@keyframes pulse-notification {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.animate-ping {
  animation: pulse-notification 1s infinite;
}

/* Limitation du texte */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
