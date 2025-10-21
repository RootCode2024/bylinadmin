import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { useToast } from 'vue-toast-notification'

export const useCategoriesStore = defineStore('categories', () => {
  const toast = useToast()

  // State
  const categories = ref([])
  const deletedCategories = ref([])
  const currentCategory = ref(null)
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

  const activeCategories = computed(() =>
    categories.value.filter(category => category.is_active && !category.deleted_at)
  )

  const parentCategories = computed(() =>
    categories.value.filter(category => category.parent_id === null && !category.deleted_at)
  )

  const currentList = computed(() => {
    switch (viewMode.value) {
      case 'deleted':
        return deletedCategories.value
      case 'all':
        return [...categories.value, ...deletedCategories.value]
      default:
        return categories.value
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
  async function fetchCategories(params = {}) {
    try {
      isLoading.value = true
      error.value = null

      // Ajouter les paramètres pour les éléments supprimés selon le mode de vue
      const requestParams = {
        page: params.page || currentPage.value,
        per_page: params.per_page || itemsPerPage.value,
        search: params.search || searchQuery.value,
        status: params.status,
        parent_id: params.parent_id,
        ...params
      }

      // Gestion des paramètres selon le mode de vue
      if (viewMode.value === 'deleted') {
        requestParams.only_deleted = true
      } else if (viewMode.value === 'all') {
        requestParams.include_deleted = true
      }

      console.log('Fetching categories with params:', requestParams)

      const response = await api.get('/api/admin/categories', {
        params: requestParams
      })

      console.log('Categories response:', response.data)

      // Gestion de la structure de réponse
      const responseData = response.data.data || response.data
      const pagination = response.pagination || response.meta || {}

      // Vérifier que les données sont un tableau
      if (!Array.isArray(responseData)) {
        throw new Error('La réponse ne contient pas un tableau de catégories')
      }

      // Mettre à jour le state selon le mode de vue
      if (viewMode.value === 'deleted') {
        deletedCategories.value = responseData
      } else if (viewMode.value === 'all') {
        // Séparer les éléments supprimés et actifs
        const active = responseData.filter(item => !item.deleted_at)
        const deleted = responseData.filter(item => item.deleted_at)
        categories.value = active
        deletedCategories.value = deleted
      } else {
        categories.value = responseData
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

  async function fetchDeletedCategories(params = {}) {
    try {
      isLoading.value = true

      const response = await api.get('/api/admin/categories', {
        params: { ...params, only_deleted: true }
      })

      deletedCategories.value = response.data.data || response.data

      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des catégories supprimées:', error)
      toast.error('Erreur lors du chargement des catégories supprimées')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategory(id) {
    try {
      isLoading.value = true
      const response = await api.get(`/api/admin/categories/${id}`)
      currentCategory.value = response.data.data || response.data

      // Mettre à jour dans la liste appropriée si elle existe
      const updateInList = (list) => {
        const index = list.findIndex(c => c.id === id)
        if (index !== -1) {
          list[index] = currentCategory.value
        }
      }

      updateInList(categories.value)
      updateInList(deletedCategories.value)

      return currentCategory.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération de la catégorie'
      toast.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // Création avec FormData (quand il y a un fichier)
  async function createCategory(categoryData) {
    try {
      isLoading.value = true

      let requestData;
      let headers = {};

      if (categoryData instanceof FormData) {
        requestData = categoryData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        requestData = createFormData(categoryData);
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await api.post('/api/admin/categories', requestData, { headers })

      const newCategory = response.data.data || response.data
      categories.value.unshift(newCategory)
      totalItems.value += 1
      toast.success('Catégorie créée avec succès')
      return newCategory
    } catch (err) {
      error.value = formatError(err)
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  // Création simple (sans fichier)
  async function createCategorySimple(categoryData) {
    try {
      isLoading.value = true

      const response = await api.post('/api/admin/categories', categoryData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const newCategory = response.data.data || response.data
      categories.value.unshift(newCategory)
      totalItems.value += 1
      toast.success('Catégorie créée avec succès')
      return newCategory
    } catch (err) {
      error.value = formatError(err)
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  // Mise à jour avec FormData (quand il y a un fichier)
  async function updateCategory(id, categoryData) {
    try {
      isLoading.value = true

      let requestData;
      let headers = {};

      if (categoryData instanceof FormData) {
        requestData = categoryData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        requestData = createFormData(categoryData);
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await api.post(`/api/admin/categories/${id}?_method=PATCH`, requestData, { headers })

      const updatedCategory = response.data.data || response.data
      const index = categories.value.findIndex(c => c.id == id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }

      toast.success('Catégorie mise à jour avec succès')
      return updatedCategory
    } catch (err) {
      error.value = formatError(err)
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  // Mise à jour simple (sans fichier)
  async function updateCategorySimple(id, categoryData) {
    try {
      isLoading.value = true

      const response = await api.patch(`/categories/${id}`, categoryData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const updatedCategory = response.data.data || response.data
      const index = categories.value.findIndex(c => c.id == id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }

      toast.success('Catégorie mise à jour avec succès')
      return updatedCategory
    } catch (err) {
      error.value = formatError(err)
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  // Suppression douce (soft delete)
  async function deleteCategory(id) {
    try {
      isLoading.value = true
      const response = await api.delete(`/api/admin/categories/${id}`)

      // Déplacer de la liste active vers la liste supprimée
      const categoryIndex = categories.value.findIndex(c => c.id === id)
      if (categoryIndex !== -1) {
        const deletedCategory = { ...categories.value[categoryIndex], deleted_at: new Date().toISOString() }
        deletedCategories.value.unshift(deletedCategory)
        categories.value.splice(categoryIndex, 1)
      }

      totalItems.value = Math.max(0, totalItems.value - 1)

      // Reset current category if it's the one being deleted
      if (currentCategory.value?.id === id) {
        currentCategory.value = null
      }

      toast.success('Catégorie supprimée avec succès')
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
  async function restoreCategory(id) {
    try {
      isLoading.value = true
      const response = await api.post(`/api/admin/categories/${id}/restore`)

      // Déplacer de la liste supprimée vers la liste active
      const deletedIndex = deletedCategories.value.findIndex(c => c.id === id)
      if (deletedIndex !== -1) {
        const restoredCategory = { ...deletedCategories.value[deletedIndex] }
        delete restoredCategory.deleted_at
        categories.value.unshift(restoredCategory)
        deletedCategories.value.splice(deletedIndex, 1)
      }

      toast.success('Catégorie restaurée avec succès')
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
  async function forceDeleteCategory(id) {
    try {
      isLoading.value = true
      const response = await api.delete(`/api/admin/categories/${id}/force`)

      // Retirer définitivement de toutes les listes
      categories.value = categories.value.filter(c => c.id !== id)
      deletedCategories.value = deletedCategories.value.filter(c => c.id !== id)

      // Reset current category if it's the one being deleted
      if (currentCategory.value?.id === id) {
        currentCategory.value = null
      }

      toast.success('Catégorie supprimée définitivement')
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
  async function bulkDeleteCategories(categoryIds) {
    try {
      isLoading.value = true

      // Correction: S'assurer que tous les IDs sont des entiers
      const validIds = categoryIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      if (validIds.length === 0) {
        throw new Error('Aucun ID valide fourni')
      }

      console.log('IDs validés à envoyer:', validIds)

      const response = await api.post('/api/admin/categories/bulk/delete', {
        ids: validIds
      })

      if (response.data.success) {
        // Déplacer les catégories supprimées avec succès vers la liste supprimée
        const deletedIds = validIds.filter(id =>
          !response.data.data.failed_categories?.some(failed => failed.id === id)
        )

        const movedCategories = []
        deletedIds.forEach(id => {
          const categoryIndex = categories.value.findIndex(c => c.id === id)
          if (categoryIndex !== -1) {
            const deletedCategory = { ...categories.value[categoryIndex], deleted_at: new Date().toISOString() }
            movedCategories.push(deletedCategory)
            categories.value.splice(categoryIndex, 1)
          }
        })

        deletedCategories.value.unshift(...movedCategories)

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
  async function bulkRestoreCategories(categoryIds) {
    try {
      isLoading.value = true

      const validIds = categoryIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      const response = await api.post('/api/admin/categories/bulk/restore', {
        ids: validIds
      })

      if (response.data.success) {
        // Déplacer les catégories restaurées vers la liste active
        const restoredIds = validIds.filter(id =>
          !response.data.data.failed_categories?.some(failed => failed.id === id)
        )

        const movedCategories = []
        restoredIds.forEach(id => {
          const deletedIndex = deletedCategories.value.findIndex(c => c.id === id)
          if (deletedIndex !== -1) {
            const restoredCategory = { ...deletedCategories.value[deletedIndex] }
            delete restoredCategory.deleted_at
            movedCategories.push(restoredCategory)
            deletedCategories.value.splice(deletedIndex, 1)
          }
        })

        categories.value.unshift(...movedCategories)

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
  async function bulkForceDeleteCategories(categoryIds) {
    try {
      isLoading.value = true

      const validIds = categoryIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      const response = await api.post('/api/admin/categories/bulk/force-delete', {
        ids: validIds
      })

      if (response.data.success) {
        // Retirer définitivement de toutes les listes
        categories.value = categories.value.filter(
          category => !validIds.includes(category.id)
        )
        deletedCategories.value = deletedCategories.value.filter(
          category => !validIds.includes(category.id)
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
  async function bulkUpdateCategories(categoryIds, action) {
    try {
      isLoading.value = true

      const validIds = categoryIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      const response = await api.post('/api/admin/categories/bulk/update', {
        ids: validIds,
        action: action
      })

      if (response.data.success) {
        const isActive = action === 'activate'
        categories.value = categories.value.map(category => {
          if (validIds.includes(category.id)) {
            return { ...category, is_active: isActive }
          }
          return category
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
  async function bulkDeletePreview(categoryIds) {
    try {
      const validIds = categoryIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

      const response = await api.post('/api/admin/categories/bulk/delete-preview', {
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
    fetchCategories()
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
    categories.value = []
    deletedCategories.value = []
    currentCategory.value = null
    error.value = null
    currentPage.value = 1
    searchQuery.value = ''
    viewMode.value = 'active'
    showDeleted.value = false
  }

  return {
    // State
    categories,
    deletedCategories,
    currentCategory,
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
    activeCategories,
    parentCategories,
    currentList,

    // Actions CRUD de base
    fetchCategories,
    fetchDeletedCategories,
    fetchCategory,
    createCategory,
    createCategorySimple,
    updateCategory,
    updateCategorySimple,

    // Actions SoftDelete
    deleteCategory,
    restoreCategory,
    forceDeleteCategory,

    // Actions bulk
    bulkDeleteCategories,
    bulkRestoreCategories,
    bulkForceDeleteCategories,
    bulkUpdateCategories,
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
