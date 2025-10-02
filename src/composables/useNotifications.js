import { ref, reactive, computed } from 'vue'

// État global des notifications (singleton)
const globalNotifications = ref([])
const globalUnreadCount = ref(0)

export function useNotifications() {
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      type: 'info',
      title: '',
      message: '',
      persistent: false,
      read: false,
      timestamp: new Date(),
      ...notification
    }

    globalNotifications.value.unshift(newNotification)
    if (!newNotification.read) {
      globalUnreadCount.value++
    }

    // Auto-supprimer après 5 secondes si pas persistante
    if (!newNotification.persistent) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, 5000)
    }

    return newNotification
  }

  const removeNotification = (id) => {
    const index = globalNotifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      const notification = globalNotifications.value[index]
      if (!notification.read) {
        globalUnreadCount.value--
      }
      globalNotifications.value.splice(index, 1)
    }
  }

  const markAsRead = (id) => {
    const notification = globalNotifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      globalUnreadCount.value--
    }
  }

  const markAllAsRead = () => {
    globalNotifications.value.forEach(n => {
      if (!n.read) {
        n.read = true
      }
    })
    globalUnreadCount.value = 0
  }

  const clearAll = () => {
    globalNotifications.value.splice(0)
    globalUnreadCount.value = 0
  }

  const getNotificationsByType = (type) => {
    return globalNotifications.value.filter(n => n.type === type)
  }

  const hasUnreadNotifications = computed(() => {
    return globalUnreadCount.value > 0
  })

  return {
    // États réactifs
    notifications: globalNotifications,
    unreadCount: globalUnreadCount,

    // Actions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    getNotificationsByType,
    hasUnreadNotifications
  }
}
