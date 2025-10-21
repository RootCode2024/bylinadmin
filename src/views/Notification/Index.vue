<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="max-w-4xl mx-auto p-5 mt-10">
      <h1 class="text-2xl font-bold mb-6">Toutes les notifications</h1>

      <ul class="flex flex-col space-y-3 custom-scrollbar max-h-[600px] overflow-y-auto">
        <li
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'flex gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer transition-colors',
            !notification.read_at ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          ]"
          @click="handleNotificationClick(notification)"
        >
          <!-- Icône -->
          <span class="relative block w-10 h-10 rounded-full flex-shrink-0">
            <div
              :class="['w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium', getNotificationIconClass(notification.data.type)]"
            >
              {{ notification.data.icon || '🔔' }}
            </div>
            <span
              v-if="!notification.read_at"
              class="absolute -top-1 -right-1 z-10 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-gray-dark"
            ></span>
          </span>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <div class="mb-1 text-gray-500 dark:text-gray-400">
              <span class="font-medium text-gray-800 dark:text-white/90">{{ notification.data.title }}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">{{ notification.data.message }}</p>
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{{ getNotificationTypeLabel(notification.data.type) }}</span>
              <span>{{ formatTimeAgo(notification.created_at) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col justify-center space-y-1 ml-2">
            <button
              v-if="!notification.read_at"
              @click.stop="markAsRead(notification.id)"
              :disabled="loading.markRead"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
              title="Marquer comme lu"
            >
              ✔
            </button>
            <button
              v-if="authStore.isSuperAdmin"
              @click.stop="deleteNotification(notification.id)"
              :disabled="loading.delete"
              class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
              title="Supprimer"
            >
              ✖
            </button>
          </div>
        </li>

        <li v-if="!loading.fetch && notifications.length === 0" class="p-8 text-center text-gray-400 dark:text-gray-500">
          Aucune notification
        </li>
      </ul>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axiosConfig'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"

const currentPageTitle = ref("Toutes les Notifications")

const router = useRouter()
const authStore = useAuthStore()
const instance = getCurrentInstance()
const echo = instance?.appContext.config.globalProperties.$echo

// États
const notifications = ref([])
const loading = ref({ fetch: false, markRead: false, delete: false })

// Méthodes
const fetchNotifications = async () => {
  try {
    loading.value.fetch = true
    const response = await api.get('/api/admin/notifications', { params: { per_page: 50 } })
    if (response.success) {
      notifications.value = response.data || []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error)
  } finally {
    loading.value.fetch = false
  }
}

const markAsRead = async (notificationId) => {
  try {
    loading.value.markRead = true
    const response = await api.patch(`/notifications/${notificationId}/read`)
    if (response.data.success) {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) notification.read_at = new Date().toISOString()
    }
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error)
  } finally {
    loading.value.markRead = false
  }
}

const deleteNotification = async (notificationId) => {
  try {
    loading.value.delete = true
    const response = await api.delete(`/api/admin/notifications/${notificationId}`)
    if (response.data.success) {
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    loading.value.delete = false
  }
}

const handleNotificationClick = (notification) => {
  if (!notification.read_at) markAsRead(notification.id)
  if (notification.data.action_url) router.push(notification.data.action_url)
}

// Icônes et labels
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

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// Real-time avec Echo (optionnel)
const listenToNotifications = () => {
  if (!echo || !authStore.user) return
  const userId = authStore.user.id
  const notificationChannel = echo.private(`App.Models.User.${userId}`)
  notificationChannel.notification((notification) => {
    notifications.value.unshift({
      id: notification.id,
      type: notification.type,
      data: notification,
      read_at: null,
      created_at: new Date().toISOString()
    })
  })
}

// Lifecycle
onMounted(() => {
  fetchNotifications()
  listenToNotifications()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.5); border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(156,163,175,0.7); }

.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
