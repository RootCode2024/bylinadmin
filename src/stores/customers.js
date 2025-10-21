
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import api from 'api'
import api from '@/api/axiosConfig'

export const useCustomersStore = defineStore('customers', () => {
  // État
  const customers = ref([])
  const currentCustomer = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(15)
  const totalItems = ref(0)
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

  // Statistiques
  const stats = ref({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    banned: 0,
    new_this_month: 0
  })

  // Actions
  const fetchCustomers = async (filters = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const params = {
        page: filters.page || currentPage.value,
        per_page: itemsPerPage.value,
        search: filters.search || '',
        status: filters.status || '',
        registration_date: filters.registration_date || '',
        sort: filters.sort || 'newest'
      }

      const response = await api.get('/api/admin/customers', {
        params,
      })
      console.log('la reponse : ', response)

      customers.value = response.data
      currentPage.value = response.current_page
      totalItems.value = response.total
      stats.value = response.stats || stats.value

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des clients'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getCustomer = async (id) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/admin/customers/${id}`)
      console.log(response)
      currentCustomer.value = response
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement du client'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createCustomer = async (customerData) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/api/admin/customers', customerData)
      customers.value.unshift(response.data)
      totalItems.value++
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création du client'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateCustomer = async (id, customerData) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.put(`/api/admin/customers/${id}`, customerData)

      // Mettre à jour la liste
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = response.data
      }

      // Mettre à jour le client actuel
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = response.data
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du client'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const response = await api.patch(`/customers/${id}/status`, { status })

      // Mettre à jour la liste
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index].status = status
      }

      // Mettre à jour le client actuel
      if (currentCustomer.value?.id === id) {
        currentCustomer.value.status = status
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du statut'
      throw err
    }
  }

  const deleteCustomer = async (id) => {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(`/api/admin/customers/${id}`)

      // Retirer de la liste
      customers.value = customers.value.filter(c => c.id !== id)
      totalItems.value--

      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression du client'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const restoreCustomer = async (id) => {
    try {
      const response = await api.post(`/api/admin/customers/${id}/restore`)

      // Mettre à jour la liste
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index].deleted_at = null
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la restauration du client'
      throw err
    }
  }

  const resetPassword = async (id) => {
    try {
      const response = await api.post(`/api/admin/customers/${id}/reset-password`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe'
      throw err
    }
  }

  const getCustomerOrders = async (id, options = {}) => {
    try {
      const params = {
        limit: options.limit || 10,
        page: options.page || 1
      }

      const response = await api.get(`/api/admin/customers/${id}/orders`, { params })
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des commandes'
      throw err
    }
  }

  const getCustomerAddresses = async (id) => {
    try {
      const response = await api.get(`/api/admin/customers/${id}/addresses`)
      console.log(response)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des adresses'
      throw err
    }
  }

  const getCustomerActivity = async (id, options = {}) => {
    try {
      const params = {
        limit: options.limit || 20,
        page: options.page || 1
      }

      const response = await api.get(`/api/admin/customers/${id}/activity`, { params })
      console.log(response)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement de l\'activité'
      throw err
    }
  }

  const exportCustomers = async (filters = {}) => {
    try {
      const params = {
        search: filters.search || '',
        status: filters.status || '',
        registration_date: filters.registration_date || '',
        format: filters.format || 'xlsx'
      }

      const response = await api.get('/api/admin/customers/export', {
        params,
        responseType: 'blob'
      })

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `clients_${new Date().getTime()}.${params.format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'export'
      throw err
    }
  }

  const importCustomers = async (file) => {
    isLoading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/api/admin/customers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Recharger la liste
      await fetchCustomers()

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'import'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (customerId, messageData) => {
    try {
      const response = await api.post(`/api/admin/customers/${customerId}/messages`, messageData)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'envoi du message'
      throw err
    }
  }

  const bulkAction = async (action, customerIds) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/api/admin/customers/bulk-action', {
        action,
        customer_ids: customerIds
      })

      // Recharger la liste après une action en masse
      await fetchCustomers()

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'action en masse'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Getters
  const activeCustomers = computed(() =>
    customers.value.filter(c => c.status === 'active')
  )

  const pendingCustomers = computed(() =>
    customers.value.filter(c => c.status === 'pending')
  )

  const suspendedCustomers = computed(() =>
    customers.value.filter(c => c.status === 'suspended')
  )

  const customersWithOrders = computed(() =>
    customers.value.filter(c => c.orders_count > 0)
  )

  const topCustomers = computed(() =>
    customers.value
      .filter(c => c.total_spent > 0)
      .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
      .slice(0, 10)
  )

  // Reset store
  const resetStore = () => {
    customers.value = []
    currentCustomer.value = null
    currentPage.value = 1
    totalItems.value = 0
    error.value = null
    isLoading.value = false
  }

  return {
    // État
    customers,
    currentCustomer,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    stats,

    // Actions
    fetchCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    updateStatus,
    deleteCustomer,
    restoreCustomer,
    resetPassword,
    getCustomerOrders,
    getCustomerAddresses,
    getCustomerActivity,
    exportCustomers,
    importCustomers,
    sendMessage,
    bulkAction,
    resetStore,

    // Getters
    activeCustomers,
    pendingCustomers,
    suspendedCustomers,
    customersWithOrders,
    topCustomers
  }
})
