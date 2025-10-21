import { defineStore } from 'pinia'
import api from '@/api/axiosConfig'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    filters: {
      type: '',
      unread_only: false
    },
    pagination: {
      currentPage: 1,
      perPage: 15,
      total: 0,
      lastPage: 1
    }
  }),

  getters: {
    unreadNotifications: (state) =>
      state.notifications.filter(n => !n.read_at),

    notificationsByType: (state) => (type) =>
      state.notifications.filter(n => n.data.type === type),

    hasUnread: (state) => state.unreadCount > 0,

    filteredNotifications: (state) => {
      let result = [...state.notifications]

      if (state.filters.type) {
        result = result.filter(n => n.data.type === state.filters.type)
      }

      if (state.filters.unread_only) {
        result = result.filter(n => !n.read_at)
      }

      return result
    }
  },

  actions: {
    async fetchNotifications(params = {}) {
      try {
        this.loading = true
        const response = await api.get('/api/admin/notifications', {
          params: {
            page: this.pagination.currentPage,
            per_page: this.pagination.perPage,
            ...this.filters,
            ...params
          }
        })

        if (response.data.success) {
          this.notifications = response.data.data || []
          this.unreadCount = response.data.meta?.unread_count || 0

          // Mettre à jour la pagination
          const meta = response.data.meta
          this.pagination = {
            currentPage: meta.current_page,
            perPage: meta.per_page,
            total: meta.total,
            lastPage: meta.last_page
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUnreadCount() {
      try {
        const response = await api.get('/api/admin/notifications/unread-count')
        if (response.data.success) {
          this.unreadCount = response.data.unread_count || 0
        }
      } catch (error) {
        console.error('Erreur lors du comptage:', error)
      }
    },

    async markAsRead(notificationId) {
      try {
        const response = await api.patch(`/notifications/${notificationId}/read`)

        if (response.data.success) {
          const notification = this.notifications.find(n => n.id === notificationId)
          if (notification && !notification.read_at) {
            notification.read_at = new Date().toISOString()
            this.unreadCount = Math.max(0, this.unreadCount - 1)
          }
        }

        return response.data
      } catch (error) {
        console.error('Erreur lors du marquage:', error)
        throw error
      }
    },

    async markAllAsRead() {
      try {
        const response = await api.patch('/notifications/mark-all-read')

        if (response.data.success) {
          this.notifications.forEach(notification => {
            notification.read_at = new Date().toISOString()
          })
          this.unreadCount = 0
        }

        return response.data
      } catch (error) {
        console.error('Erreur lors du marquage global:', error)
        throw error
      }
    },

    async deleteNotification(notificationId) {
      try {
        const response = await api.delete(`/api/admin/notifications/${notificationId}`)

        if (response.data.success) {
          const index = this.notifications.findIndex(n => n.id === notificationId)
          if (index !== -1) {
            const notification = this.notifications[index]
            if (!notification.read_at) {
              this.unreadCount = Math.max(0, this.unreadCount - 1)
            }
            this.notifications.splice(index, 1)
            this.pagination.total--
          }
        }

        return response.data
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        throw error
      }
    },

    async bulkDelete(notificationIds) {
      try {
        const promises = notificationIds.map(id => this.deleteNotification(id))
        await Promise.all(promises)
      } catch (error) {
        console.error('Erreur lors de la suppression en lot:', error)
        throw error
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.currentPage = 1
    },

    setPage(page) {
      this.pagination.currentPage = page
    },

    addNotification(notification) {
      // Ajouter une nouvelle notification en temps réel
      this.notifications.unshift(notification)
      if (!notification.read_at) {
        this.unreadCount++
      }
    },

    resetFilters() {
      this.filters = {
        type: '',
        unread_only: false
      }
      this.pagination.currentPage = 1
    }
  }
})
