import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'

export const useReviewsStore = defineStore('reviews', () => {
  // État
  const reviews = ref([])
  const currentReview = ref(null)
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
    approved: 0,
    pending: 0,
    rejected: 0,
    average_rating: 0,
    total_ratings: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  })

  // Actions
  const fetchReviews = async (filters = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const params = {
        page: filters.page || currentPage.value,
        per_page: itemsPerPage.value,
        search: filters.search || '',
        rating: filters.rating || '',
        status: filters.status || '',
        date: filters.date || '',
        product_id: filters.product_id || '',
        customer_id: filters.customer_id || '',
        sort: filters.sort || 'newest'
      }

      const response = await api.get('/reviews', {
        params,
      })

      reviews.value = response.data
      console.log(response.data)
      currentPage.value = response.current_page
      totalItems.value = response.total
      stats.value = response.stats || stats.value

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des avis'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getReview = async (id) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/reviews/${id}`)
      currentReview.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement de l\'avis'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createReview = async (reviewData) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/reviews', reviewData)
      reviews.value.unshift(response.data)
      totalItems.value++
      
      // Mettre à jour les statistiques
      updateLocalStats(response.data, 'create')
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'avis'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateReview = async (id, reviewData) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.put(`/reviews/${id}/update`, reviewData)
      const updatedReview = response.data  // ✅ Corrigé ici

      console.log('La reponse que on recoit ici : ', response)

      const index = reviews.value.findIndex(r => r.id === id)
      if (index !== -1) {
        const oldReview = reviews.value[index]
        reviews.value[index] = updatedReview

        // Mettre à jour les statistiques
        updateLocalStats(oldReview, 'delete')
        updateLocalStats(updatedReview, 'create')
      }

      // Mettre à jour l'avis actuel
      if (currentReview.value?.id === id) {
        currentReview.value = updatedReview
      }

      return updatedReview
    } catch (err) {
      error.value = err.response?.message || 'Erreur lors de la mise à jour de l\'avis'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const response = await api.patch(`/reviews/${id}/status`, { status })

      // Mettre à jour la liste
      const index = reviews.value.findIndex(r => r.id === id)
      if (index !== -1) {
        const oldStatus = reviews.value[index].status
        reviews.value[index].status = status
        
        // Mettre à jour les statistiques de statut
        if (stats.value[oldStatus] > 0) stats.value[oldStatus]--
        stats.value[status] = (stats.value[status] || 0) + 1
      }

      // Mettre à jour l'avis actuel
      if (currentReview.value?.id === id) {
        currentReview.value.status = status
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du statut'
      throw err
    }
  }

  const deleteReview = async (id) => {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(`/reviews/${id}`)

      // Retirer de la liste
      const index = reviews.value.findIndex(r => r.id === id)
      if (index !== -1) {
        const deletedReview = reviews.value[index]
        reviews.value.splice(index, 1)
        totalItems.value--
        
        // Mettre à jour les statistiques
        updateLocalStats(deletedReview, 'delete')
      }

      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression de l\'avis'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const approveReview = async (id) => {
    return await updateStatus(id, 'approved')
  }

  const rejectReview = async (id) => {
    return await updateStatus(id, 'rejected')
  }

  const moderateReview = async (id, action, reason = '') => {
    try {
      const response = await api.post(`/reviews/${id}/moderate`, {
        action,
        reason
      })

      // Mettre à jour la liste
      const index = reviews.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reviews.value[index] = response.data
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la modération'
      throw err
    }
  }

  const getProductReviews = async (productId, options = {}) => {
    try {
      const params = {
        limit: options.limit || 10,
        page: options.page || 1,
        status: options.status || 'approved'
      }

      const response = await api.get(`/products/${productId}/reviews`, { params })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des avis du produit'
      throw err
    }
  }

  const getCustomerReviews = async (customerId, options = {}) => {
    try {
      const params = {
        limit: options.limit || 10,
        page: options.page || 1
      }

      const response = await api.get(`/customers/${customerId}/reviews`, { params })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des avis du client'
      throw err
    }
  }

  const exportReviews = async (filters = {}) => {
    try {
      const params = {
        search: filters.search || '',
        rating: filters.rating || '',
        status: filters.status || '',
        date: filters.date || '',
        format: filters.format || 'xlsx'
      }

      const response = await api.get('/reviews/export', {
        params,
        responseType: 'blob'
      })

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `avis_${new Date().getTime()}.${params.format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'export'
      throw err
    }
  }

  const bulkAction = async (action, reviewIds, data = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/reviews/bulk-action', {
        action,
        review_ids: reviewIds,
        ...data
      })

      // Recharger la liste après une action en masse
      await fetchReviews()

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'action en masse'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getReviewStats = async (filters = {}) => {
    try {
      const params = {
        period: filters.period || 'month',
        product_id: filters.product_id || '',
        customer_id: filters.customer_id || ''
      }

      const response = await api.get('/reviews/stats', { params })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des statistiques'
      throw err
    }
  }

  const reportReview = async (id, reason) => {
    try {
      const response = await api.post(`/reviews/${id}/report`, { reason })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du signalement'
      throw err
    }
  }

  // Méthodes utilitaires
  const updateLocalStats = (review, action) => {
    // Initialisation sécurisée si les clés sont absentes
    if (!stats.value.total_ratings) {
      stats.value.total_ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }

    if (action === 'create') {
      stats.value.total++
      stats.value[review.status] = (stats.value[review.status] || 0) + 1
      stats.value.total_ratings[review.rating] = (stats.value.total_ratings[review.rating] || 0) + 1
    } else if (action === 'delete') {
      stats.value.total = Math.max(0, stats.value.total - 1)
      if (stats.value[review.status] > 0) stats.value[review.status]--
      if (stats.value.total_ratings[review.rating] > 0) stats.value.total_ratings[review.rating]--
    }

    // Recalcul de la moyenne
    const totalRatings = Object.values(stats.value.total_ratings).reduce((sum, count) => sum + count, 0)
    if (totalRatings > 0) {
      const weightedSum = Object.entries(stats.value.total_ratings)
        .reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0)
      stats.value.average_rating = (weightedSum / totalRatings).toFixed(1)
    } else {
      stats.value.average_rating = 0
    }
  }

  // Getters
  const approvedReviews = computed(() =>
    reviews.value.filter(r => r.status === 'approved')
  )

  const pendingReviews = computed(() =>
    reviews.value.filter(r => r.status === 'pending')
  )

  const rejectedReviews = computed(() =>
    reviews.value.filter(r => r.status === 'rejected')
  )

  const highRatedReviews = computed(() =>
    reviews.value.filter(r => r.rating >= 4)
  )

  const lowRatedReviews = computed(() =>
    reviews.value.filter(r => r.rating <= 2)
  )

  const recentReviews = computed(() =>
    reviews.value
      .filter(r => {
        const reviewDate = new Date(r.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return reviewDate >= weekAgo
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  )

  // Reset store
  const resetStore = () => {
    reviews.value = []
    currentReview.value = null
    currentPage.value = 1
    totalItems.value = 0
    error.value = null
    isLoading.value = false
    stats.value = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      average_rating: 0,
      total_ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }

  return {
    // État
    reviews,
    currentReview,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    stats,

    // Actions
    fetchReviews,
    getReview,
    createReview,
    updateReview,
    updateStatus,
    deleteReview,
    approveReview,
    rejectReview,
    moderateReview,
    getProductReviews,
    getCustomerReviews,
    exportReviews,
    bulkAction,
    getReviewStats,
    reportReview,
    resetStore,

    // Getters
    approvedReviews,
    pendingReviews,
    rejectedReviews,
    highRatedReviews,
    lowRatedReviews,
    recentReviews
  }
})