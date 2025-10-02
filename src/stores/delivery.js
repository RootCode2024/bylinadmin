import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'

export const useDeliveryStore = defineStore('delivery', () => {
  // State
  const deliveries = ref([])
  const shipments = ref([])
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  })

  // Getters - Types de livreurs
  const deliveryServices = computed(() =>
    deliveries.value.filter(d => d.type === 'service' && d.is_active)
  )

  const deliveryDrivers = computed(() =>
    deliveries.value.filter(d => d.type === 'livreur' && d.is_active)
  )

  const activeDeliveries = computed(() =>
    deliveries.value.filter(d => d.is_active)
  )

  const availableDeliveries = computed(() =>
    deliveries.value.filter(d => d.is_active && d.is_available)
  )

  // Getters - Par zone de couverture
  const localDeliveries = computed(() =>
    deliveries.value.filter(d => d.coverage_type === 'local' && d.is_active)
  )

  const nationalDeliveries = computed(() =>
    deliveries.value.filter(d => d.coverage_type === 'national' && d.is_active)
  )

  const internationalDeliveries = computed(() =>
    deliveries.value.filter(d => d.coverage_type === 'international' && d.is_active)
  )

  // Getters - Statistiques
  const totalActiveDeliveries = computed(() => activeDeliveries.value.length)

  const workingDeliveries = computed(() => {
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' })
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })

    return availableDeliveries.value.filter(delivery => {
      // Vérifier si c'est un jour de travail
      if (!delivery.working_days?.includes(currentDay)) return false

      // Vérifier les heures de travail
      if (delivery.working_hours?.start && delivery.working_hours?.end) {
        return currentTime >= delivery.working_hours.start && currentTime <= delivery.working_hours.end
      }

      return true // Si pas d'heures définies, considérer comme disponible
    })
  })

  // Actions - Deliveries
  const fetchDeliveries = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/deliveries', { params })

      deliveries.value = response.data.data || response.data

      if (response.data.meta) {
        pagination.value = {
          current_page: response.data.meta.current_page,
          per_page: response.data.meta.per_page,
          total: response.data.meta.total,
          last_page: response.data.meta.last_page
        }
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error fetching deliveries:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchDeliveriesForZone = async (city) => {
    try {
      const response = await api.get('/deliveries/zone', {
        params: { city, is_active: true, is_available: true }
      })
      return response.data
    } catch (err) {
      console.error('Error fetching deliveries for zone:', err)
      throw err
    }
  }

  const createDelivery = async (deliveryData) => {
    loading.value = true
    try {
      const response = await api.post('/deliveries', deliveryData)
      deliveries.value.push(response.data.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDelivery = async (id, updateData) => {
    loading.value = true
    try {
      const response = await api.put(`/deliveries/${id}`, updateData)
      const index = deliveries.value.findIndex(d => d.id === id)
      if (index !== -1) {
        deliveries.value[index] = response.data.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDeliveryStatus = async (id, isAvailable) => {
    try {
      const response = await api.patch(`/deliveries/${id}/status`, {
        is_available: isAvailable
      })
      const index = deliveries.value.findIndex(d => d.id === id)
      if (index !== -1) {
        deliveries.value[index].is_available = isAvailable
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  const deleteDelivery = async (id) => {
    loading.value = true
    try {
      await api.delete(`/deliveries/${id}`)
      deliveries.value = deliveries.value.filter(d => d.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Shipments (Expéditions)
  const updateShipment = async (shipmentData) => {
    loading.value = true
    try {
      // Structurer correctement les données pour l'API
      const payload = {
        orderId: shipmentData.orderId,
        deliveryId: shipmentData.deliveryId,
        shippingType: shipmentData.shippingType,
        adminNotes: shipmentData.adminNotes || null
      }

      console.log("Données envoyées à l'API :", payload);
      
      const response = await api.post('/shipments', payload)
      console.log("Réponse updateShipment :", response);
      
      shipments.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchShipments = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.get('/shipments', { params })
      shipments.value = response.data.data || response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateShipmentStatus = async (shipmentId, status, notes = null) => {
    try {
      const response = await api.patch(`/shipments/${shipmentId}/status`, {
        status,
        notes
      })

      const index = shipments.value.findIndex(s => s.id === shipmentId)
      if (index !== -1) {
        shipments.value[index] = response.data.data
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  // Actions - Notifications
  const fetchNotifications = async (params = {}) => {
    try {
      const response = await api.get('/delivery-notifications', { params })
      notifications.value = response.data.data || response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await api.patch(`/delivery-notifications/${notificationId}/read`)
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index].is_read = true
      }
      return response.data
    } catch (err) {
      console.error('Error marking notification as read:', err)
      throw err
    }
  }

  // Actions - Statistiques et performance
  const fetchDeliveryStats = async (deliveryId, days = 30) => {
    try {
      const response = await api.get(`/deliveries/${deliveryId}/stats`, {
        params: { days }
      })
      return response.data
    } catch (err) {
      console.error('Error fetching delivery stats:', err)
      throw err
    }
  }

  const fetchPerformanceData = async (params = {}) => {
    try {
      const response = await api.get('/delivery-performance', { params })
      return response.data
    } catch (err) {
      console.error('Error fetching performance data:', err)
      throw err
    }
  }

  // Utilitaires
  const getDeliveryById = (id) =>
    deliveries.value.find(d => d.id === id)

  const getShipmentById = (id) =>
    shipments.value.find(s => s.id === id)

  const getDeliveriesForCity = (city) =>
    availableDeliveries.value.filter(d =>
      d.zones?.includes(city) || d.zones?.includes('all')
    )

  const getBestDeliveryForOrder = (orderAmount, city, shippingType = 'standard') => {
    const cityDeliveries = getDeliveriesForCity(city)

    if (cityDeliveries.length === 0) return null

    // Trier par rating puis par nombre de livraisons
    return cityDeliveries
      .filter(d => d.is_available)
      .sort((a, b) => {
        // Priorité: rating élevé, puis expérience (total_deliveries)
        if (b.rating - a.rating !== 0) return b.rating - a.rating
        return b.total_deliveries - a.total_deliveries
      })[0]
  }

  const generateTrackingNumber = (orderId, deliveryType = 'local') => {
    const prefix = deliveryType === 'local' ? 'BEN' : 'EXT'
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const orderNumber = orderId.toString().padStart(6, '0')
    return `${prefix}-${date}-${orderNumber}`
  }

  // Getters pour les notifications
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.is_read)
  )

  const urgentNotifications = computed(() =>
    notifications.value.filter(n => n.priority === 'urgent' && !n.is_read)
  )

  // Reset state
  const resetError = () => {
    error.value = null
  }

  const clearDeliveries = () => {
    deliveries.value = []
  }

  return {
    // State
    deliveries,
    shipments,
    notifications,
    loading,
    error,
    pagination,

    // Getters - Types
    deliveryServices,
    deliveryDrivers,
    activeDeliveries,
    availableDeliveries,

    // Getters - Zones
    localDeliveries,
    nationalDeliveries,
    internationalDeliveries,

    // Getters - Statistiques
    totalActiveDeliveries,
    workingDeliveries,
    unreadNotifications,
    urgentNotifications,

    // Actions - Deliveries
    fetchDeliveries,
    fetchDeliveriesForZone,
    createDelivery,
    updateDelivery,
    updateDeliveryStatus,
    deleteDelivery,

    // Actions - Shipments
    updateShipment,
    fetchShipments,
    updateShipmentStatus,

    // Actions - Notifications
    fetchNotifications,
    markNotificationAsRead,

    // Actions - Stats
    fetchDeliveryStats,
    fetchPerformanceData,

    // Utilitaires
    getDeliveryById,
    getShipmentById,
    getDeliveriesForCity,
    getBestDeliveryForOrder,
    generateTrackingNumber,
    resetError,
    clearDeliveries
  }
})
