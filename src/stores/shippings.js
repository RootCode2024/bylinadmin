import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'

export const useShippingStore = defineStore('shipping', () => {
  // State
  const shipments = ref([])
  const currentShipment = ref(null)
  const trackingData = ref(null)
  const availableDeliveries = ref([])
  const stats = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Pagination
  const pagination = ref({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1
  })

  // Filters
  const filters = ref({
    trackingNumber: '',
    status: '',
    date: '',
    delivery_id: '',
    search: ''
  })

  // Status options
  const statusOptions = ref([
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'assigned', label: 'Assigné' },
    { value: 'picked_up', label: 'Récupéré' },
    { value: 'in_transit', label: 'En transit' },
    { value: 'out_for_delivery', label: 'En livraison' },
    { value: 'delivered', label: 'Livré' },
    { value: 'failed', label: 'Échec' },
    { value: 'returned', label: 'Retourné' }
  ])

  // Getters
  const getStatusLabel = (status) => {
    const option = statusOptions.value.find(opt => opt.value === status)
    return option ? option.label : status
  }

  const getStatusClass = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      picked_up: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Actions
  const loadShipments = async (options = {}) => {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: options.page || pagination.value.currentPage,
        per_page: options.per_page || pagination.value.perPage,
        ...filters.value,
        ...options
      }

      const response = await api.get('/api/admin/shipments', { params })

      shipments.value = response.data.data
      pagination.value = {
        currentPage: response.data.meta.current_page,
        perPage: response.data.meta.per_page,
        total: response.data.meta.total,
        lastPage: response.data.meta.last_page
      }

      return shipments.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load shipments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadShipment = async (identifier) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/admin/shipments/${identifier}`)
      currentShipment.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load shipment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const trackShipment = async (trackingNumber) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/admin/shipments/${trackingNumber}/tracking`)
      trackingData.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to track shipment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadAvailableDeliveries = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/api/admin/deliveries/zone/available')
      availableDeliveries.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load deliveries'
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadStats = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/api/admin/shipments/stats')
      stats.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignDelivery = async (shipmentId, deliveryId, estimatedDeliveryAt = null) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post(`/api/admin/shipments/${shipmentId}/assign`, {
        delivery_id: deliveryId,
        estimated_delivery_at: estimatedDeliveryAt
      })

      // Update local state if successful
      const index = shipments.value.findIndex(s => s.id === shipmentId)
      if (index !== -1) {
        shipments.value[index] = response.data
      }

      if (currentShipment.value?.id === shipmentId) {
        currentShipment.value = response.data
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to assign delivery'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateShipmentStatus = async (shipmentId, status, options = {}) => {
    loading.value = true
    error.value = null

    try {
      const { notes = null, deliveryProof = null, location = null } = options

      console.log('📦 Données envoyées à l\'API:', {
        shipmentId,
        status,
        notes,
        deliveryProof,
        location
      })

      // Préparer le payload
      const payload = {
        status: status
      }

      // Ajouter les données optionnelles
      if (notes) payload.notes = notes
      if (location) payload.location = location

      console.log('📤 Payload final:', payload)

      const response = await api.patch(`/shipments/${shipmentId}/status`, payload)

      console.log('✅ Réponse de l\'API:', response.data)

      // Mettre à jour l'état local
      const index = shipments.value.findIndex(s => s.id === shipmentId)
      if (index !== -1) {
        shipments.value[index] = response.data
      }

      if (currentShipment.value?.id === shipmentId) {
        currentShipment.value = response.data
      }

      return response.data

    } catch (err) {
      console.error('❌ Erreur détaillée updateShipmentStatus:', err)

      // Afficher TOUTES les informations d'erreur
      if (err.response) {
        console.error('📊 Données de réponse d\'erreur:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        })

        if (err.response.status === 422) {
          const validationErrors = err.response.data.errors || err.response.data
          console.error('🔍 Erreurs de validation détaillées:', validationErrors)
          error.value = 'Erreurs de validation: ' + JSON.stringify(validationErrors)
        }
      }

      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du statut'
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportShipments = async (format = 'excel') => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/api/admin/shipments/export', {
        params: {
          format,
          ...filters.value
        },
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `shipments_export.${format === 'excel' ? 'xlsx' : 'csv'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to export shipments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      trackingNumber: '',
      status: '',
      date: '',
      delivery_id: '',
      search: ''
    }
  }

  const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.lastPage) {
      pagination.value.currentPage = page
      loadShipments()
    }
  }

  return {
    // State
    shipments,
    currentShipment,
    trackingData,
    availableDeliveries,
    stats,
    loading,
    error,
    pagination,
    filters,
    statusOptions,

    // Getters
    getStatusLabel,
    getStatusClass,
    formatDateTime,

    // Actions
    loadShipments,
    loadShipment,
    trackShipment,
    loadAvailableDeliveries,
    loadStats,
    assignDelivery,
    updateShipmentStatus,
    exportShipments,
    updateFilters,
    resetFilters,
    changePage
  }
})
