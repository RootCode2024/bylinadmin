import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { useToast } from 'vue-toast-notification'

export const useBrandsStore = defineStore('brands', () => {
  const toast = useToast()

  // State
  const brands = ref([])
  const deletedBrands = ref([])
  const currentBrand = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const searchQuery = ref('')
  const showDeleted = ref(false)
  const viewMode = ref('active') // 'active', 'deleted', 'all'

  // Ajouter paginationInfo dans le state
  const paginationInfo = ref({
    from: 0,
    to: 0,
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1
  })

  // Getters
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

  const activeBrands = computed(() =>
    brands.value.filter(brand => brand.is_active && !brand.deleted_at)
  )

  const currentList = computed(() => {
    switch (viewMode.value) {
      case 'deleted':
        return deletedBrands.value
      case 'all':
        return [...brands.value, ...deletedBrands.value]
      default:
        return brands.value
    }
  })

  // Fonctions Helpers
  function createFormData(data) {
    if (!data || typeof data !== 'object') {
      console.error('Invalid data for form submission:', data)
      throw new Error('Invalid data for form submission')
    }

    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0')
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    return formData
  }

  function formatError(err) {
    const defaultMessage = 'Une erreur est survenue'
    const serverMessage = err.response?.data?.message
    const validationErrors = err.response?.data?.errors

    let message = serverMessage || err.message || defaultMessage
    if (validationErrors) {
      message += ': ' + Object.values(validationErrors).flat().join(', ')
    }

    return {
      message,
      code: err.response?.status,
      validationErrors,
      original: err
    }
  }

  function handleError(err) {
    if (err.response?.status === 422) {
      const errors = err.response.data.errors
      const errorMessages = Object.values(errors).flat()
      throw new Error(errorMessages.join(' '))
    }

    throw new Error(err.response?.data?.message || 'Erreur lors de l\'opération')
  }

  // Actions
  async function fetchBrands(params = {}) {
    try {
      isLoading.value = true
      error.value = null

      // Ajouter les paramètres pour les éléments supprimés selon le mode de vue
      const requestParams = {
        page: params.page || currentPage.value,
        per_page: params.per_page || itemsPerPage.value,
        search: params.search || searchQuery.value,
        status: params.status,
        ...params
      }

      // Gestion des paramètres selon le mode de vue
      if (viewMode.value === 'deleted') {
        requestParams.only_deleted = true
      } else if (viewMode.value === 'all') {
        requestParams.include_deleted = true
      }

      console.log('Fetching brands with params:', requestParams)

      const response = await api.get('/brands', {
        params: requestParams
      })

      console.log('Marques response:', response.data)

      // Gestion de la structure de réponse
      const responseData = response.data.data || response.data
      const pagination = response.pagination || response.meta || {}

      // Vérifier que les données sont un tableau
      if (!Array.isArray(responseData)) {
        throw new Error('La réponse ne contient pas un tableau de catégories')
      }

      // Mettre à jour le state selon le mode de vue
      if (viewMode.value === 'deleted') {
        deletedBrands.value = responseData
      } else if (viewMode.value === 'all') {
        // Séparer les éléments supprimés et actifs
        const active = responseData.filter(item => !item.deleted_at)
        const deleted = responseData.filter(item => item.deleted_at)
        brands.value = active
        deletedBrands.value = deleted
      } else {
        brands.value = responseData
      }

      // Mettre à jour les informations de pagination
      paginationInfo.value = {
        from: pagination.from || ((pagination.current_page - 1) * pagination.per_page + 1),
        to: pagination.to || Math.min(pagination.current_page * pagination.per_page, pagination.total),
        total: pagination.total || 0,
        current_page: pagination.current_page || 1,
        per_page: pagination.per_page || 10,
        last_page: pagination.last_page || 1
      }

      // Mettre à jour les refs individuelles pour compatibilité
      currentPage.value = paginationInfo.value.current_page
      totalItems.value = paginationInfo.value.total
      itemsPerPage.value = paginationInfo.value.per_page

      console.log('Pagination response:', pagination)

      return { data: responseData, pagination: paginationInfo.value }

    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', {
        error: err,
        response: err.response
      })

      error.value = err.response?.data?.message ||
                  err.response?.statusText ||
                  err.message ||
                  'Erreur lors du chargement des catégories'

      toast.error(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDeletedBrands(params = {}) {
    try {
      isLoading.value = true

      const response = await api.get('/brands', {
        params: { ...params, only_deleted: true }
      })

      deletedBrands.value = response.data.data || response.data

      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des catégories supprimées:', error)
      toast.error('Erreur lors du chargement des catégories supprimées')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBrand(id) {
    try {
      isLoading.value = true
      const response = await api.get(`/brands/${id}`)
      currentBrand.value = response.data.data || response.data

      // Mettre à jour dans la liste appropriée si elle existe
      const updateInList = (list) => {
        const index = list.findIndex(b => b.id === id)
        if (index !== -1) {
          list[index] = currentBrand.value
        }
      }

      updateInList(brands.value)
      updateInList(deletedBrands.value)

      return currentBrand.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération de la catégorie'
      toast.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // Création avec FormData (quand il y a un fichier)
  async function createBrand(brandData) {
    try {
      isLoading.value = true

      let requestData;
      let headers = {};

      if (brandData instanceof FormData) {
        requestData = brandData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        requestData = createFormData(brandData);
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await api.post('/brands', requestData, { headers })

      const newBrand = response.data.data || response.data
      brands.value.unshift(newBrand)
      totalItems.value += 1
      toast.success('Marque créée avec succès')
      return newBrand
    } catch (err) {
      error.value = formatError(err)
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  // Création simple (sans fichier)
  async function createBrandSimple(brandData) {
    try {
      isLoading.value = true

      const response = await api.post('/brands', brandData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const newBrand = response.data.data || response.data
      brands.value.unshift(newBrand)
      totalItems.value += 1
      toast.success('Marque créée avec succès')
      return newBrand
    } catch (err) {
      error.value = formatError(err)
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  // Mise à jour avec FormData (quand il y a un fichier)
  async function updateBrand(id, brandData) {
    try {
      isLoading.value = true

      let requestData;
      let headers = {};

      if (brandData instanceof FormData) {
        requestData = brandData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        requestData = createFormData(brandData);
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await api.post(`/brands/${id}?_method=PATCH`, requestData, { headers })

      const updatedBrand = response.data.data || response.data
      const index = brands.value.findIndex(b => b.id == id)
      if (index !== -1) {
        brands.value[index] = updatedBrand
      }

      toast.success('Marque mise à jour avec succès')
      return updatedBrand
    } catch (err) {
      error.value = formatError(err)
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  // Mise à jour simple (sans fichier)
  async function updateBrandSimple(id, brandData) {
    try {
      isLoading.value = true

      const response = await api.patch(`/brands/${id}`, brandData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const updatedBrand = response.data.data || response.data
      const index = brands.value.findIndex(b => b.id == id)
      if (index !== -1) {
        brands.value[index] = updatedBrand
      }

      toast.success('Marque mise à jour avec succès')
      return updatedBrand
    } catch (err) {
      error.value = formatError(err)
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  // Suppression douce (soft delete)
  async function deleteBrand(id) {
    try {
      isLoading.value = true
      const response = await api.delete(`/brands/${id}`)

      // Déplacer de la liste active vers la liste supprimée
      const brandIndex = brands.value.findIndex(b => b.id === id)
      if (brandIndex !== -1) {
        const deletedBrand = { ...brands.value[brandIndex], deleted_at: new Date().toISOString() }
        deletedBrands.value.unshift(deletedBrand)
        brands.value.splice(brandIndex, 1)
      }

      totalItems.value = Math.max(0, totalItems.value - 1)

      // Reset current brand if it's the one being deleted
      if (currentBrand.value?.id === id) {
        currentBrand.value = null
      }

      toast.success('Marque supprimée avec succès')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression'
      toast.error(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Restaurer une catégorie
  async function restoreBrand(id) {
    try {
      isLoading.value = true
      const response = await api.post(`/brands/${id}/restore`)

      // Déplacer de la liste supprimée vers la liste active
      const deletedIndex = deletedBrands.value.findIndex(b => b.id === id)
      if (deletedIndex !== -1) {
        const restoredBrand = { ...deletedBrands.value[deletedIndex] }
        delete restoredBrand.deleted_at
        brands.value.unshift(restoredBrand)
        deletedBrands.value.splice(deletedIndex, 1)
      }

      toast.success('Marque restaurée avec succès')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la restauration'
      toast.error(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Suppression définitive
  async function forceDeleteBrand(id) {
    try {
      isLoading.value = true
      const response = await api.delete(`/brands/${id}/force`)

      // Retirer définitivement de toutes les listes
      brands.value = brands.value.filter(b => b.id !== id)
      deletedBrands.value = deletedBrands.value.filter(b => b.id !== id)

      // Reset current brand if it's the one being deleted
      if (currentBrand.value?.id === id) {
        currentBrand.value = null
      }

      toast.success('Marque supprimée définitivement')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression définitive'
      toast.error(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Suppression en masse (soft delete)
  async function bulkDeleteBrands(brandIds) {
    try {
      isLoading.value = true

      // Correction: S'assurer que tous les IDs sont des entiers
      const validIds = brandIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      if (validIds.length === 0) {
        throw new Error('Aucun ID valide fourni')
      }

      console.log('IDs validés à envoyer:', validIds)

      const response = await api.post('/brands/bulk/delete', {
        ids: validIds
      })

      if (response.data.success) {
        // Déplacer les catégories supprimées avec succès vers la liste supprimée
        const deletedIds = validIds.filter(id =>
          !response.data.data.failed_brands?.some(failed => failed.id === id)
        )

        const movedBrands = []
        deletedIds.forEach(id => {
          const brandIndex = brands.value.findIndex(b => b.id === id)
          if (brandIndex !== -1) {
            const deletedBrand = { ...brands.value[brandIndex], deleted_at: new Date().toISOString() }
            movedBrands.push(deletedBrand)
            brands.value.splice(brandIndex, 1)
          }
        })

        deletedBrands.value.unshift(...movedBrands)

        toast.success(response.data.message)
      }

      return response.data
    } catch (error) {
      console.error('Erreur lors de la suppression en masse:', error)

      // Log des détails pour le débogage
      if (error.response?.data) {
        console.log('Détails de l\'erreur serveur:', error.response.data)
      }

      toast.error(error.response?.data?.message || 'Erreur lors de la suppression en masse')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Restauration en masse
  async function bulkRestoreBrands(brandIds) {
    try {
      isLoading.value = true

      const validIds = brandIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      const response = await api.post('/brands/bulk/restore', {
        ids: validIds
      })

      if (response.data.success) {
        // Déplacer les catégories restaurées vers la liste active
        const restoredIds = validIds.filter(id =>
          !response.data.data.failed_brands?.some(failed => failed.id === id)
        )

        const movedBrands = []
        restoredIds.forEach(id => {
          const deletedIndex = deletedBrands.value.findIndex(b => b.id === id)
          if (deletedIndex !== -1) {
            const restoredBrand = { ...deletedBrands.value[deletedIndex] }
            delete restoredBrand.deleted_at
            movedBrands.push(restoredBrand)
            deletedBrands.value.splice(deletedIndex, 1)
          }
        })

        brands.value.unshift(...movedBrands)

        toast.success(response.data.message)
      }

      return response.data
    } catch (error) {
      console.error('Erreur lors de la restauration en masse:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la restauration en masse')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Suppression définitive en masse
  async function bulkForceDeleteBrands(brandIds) {
    try {
      isLoading.value = true

      const validIds = brandIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      const response = await api.post('/brands/bulk/force-delete', {
        ids: validIds
      })

      if (response.data.success) {
        // Retirer définitivement de toutes les listes
        brands.value = brands.value.filter(
          brand => !validIds.includes(brand.id)
        )
        deletedBrands.value = deletedBrands.value.filter(
          brand => !validIds.includes(brand.id)
        )

        toast.success(response.data.message)
      }

      return response.data
    } catch (error) {
      console.error('Erreur lors de la suppression définitive en masse:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression définitive en masse')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Mise à jour en masse
  async function bulkUpdateBrands(brandIds, action) {
    try {
      isLoading.value = true

      const validIds = brandIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      const response = await api.post('/brands/bulk/update', {
        ids: validIds,
        action: action
      })

      if (response.data.success) {
        const isActive = action === 'activate'
        brands.value = brands.value.map(brand => {
          if (validIds.includes(brand.id)) {
            return { ...brand, is_active: isActive }
          }
          return brand
        })

        toast.success(response.data.message)
      }

      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour en masse:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour en masse')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Aperçu avant suppression
  async function bulkDeletePreview(brandIds) {
    try {
      const validIds = brandIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      const response = await api.post('/brands/bulk/delete-preview', {
        ids: validIds
      })
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'aperçu:', error)
      toast.error('Erreur lors de l\'aperçu de suppression')
      throw error
    }
  }

  // Gestion des modes de vue
  function setViewMode(mode) {
    viewMode.value = mode
    currentPage.value = 1 // Reset à la page 1 lors du changement de mode
    fetchBrands()
  }

  function toggleShowDeleted() {
    showDeleted.value = !showDeleted.value
    setViewMode(showDeleted.value ? 'all' : 'active')
  }

  function showActiveOnly() {
    setViewMode('active')
  }

  function showDeletedOnly() {
    setViewMode('deleted')
  }

  function showAll() {
    setViewMode('all')
  }

  function setCurrentPage(page) {
    currentPage.value = page
  }

  // Reset function
  function resetState() {
    brands.value = []
    deletedBrands.value = []
    currentBrand.value = null
    error.value = null
    currentPage.value = 1
    searchQuery.value = ''
    viewMode.value = 'active'
    showDeleted.value = false
  }

  return {
    // State
    brands,
    deletedBrands,
    currentBrand,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    searchQuery,
    paginationInfo,
    showDeleted,
    viewMode,

    // Getters
    totalPages,
    activeBrands,
    currentList,

    // Actions CRUD de base
    fetchBrands,
    fetchDeletedBrands,
    fetchBrand,
    createBrand,
    createBrandSimple,
    updateBrand,
    updateBrandSimple,

    // Actions SoftDelete
    deleteBrand,
    restoreBrand,
    forceDeleteBrand,

    // Actions bulk
    bulkDeleteBrands,
    bulkRestoreBrands,
    bulkForceDeleteBrands,
    bulkUpdateBrands,
    bulkDeletePreview,

    // Gestion des vues
    setViewMode,
    toggleShowDeleted,
    showActiveOnly,
    showDeletedOnly,
    showAll,

    // Utilitaires
    setCurrentPage,
    resetState
  }
})
