import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'

export const useSizesStore = defineStore('sizes', () => {
  // État
  const sizes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const sizesList = computed(() => sizes.value)
  const sizesCount = computed(() => sizes.value.length)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const errorMessage = computed(() => error.value)

  // Getters utilitaires
  const getSizeById = computed(() => {
    return (id) => sizes.value.find(size => size.id === id)
  })

  const getSizeBySlug = computed(() => {
    return (slug) => sizes.value.find(size => size.slug === slug)
  })

  const getSizesByCategory = computed(() => {
    return (category) => {
      // Catégorisation basée sur des patterns communs
      const patterns = {
        clothing: /^(xxs|xs|s|m|l|xl|xxl|xxxl)$/i,
        shoes: /^(\d{2,3}(\.\d)?|uk\d+|us\d+)$/i,
        numeric: /^\d+$/,
        alpha: /^[a-z]+$/i
      }

      return sizes.value.filter(size => {
        if (category === 'all') return true
        return patterns[category]?.test(size.name) || false
      })
    }
  })

  const getSortedSizes = computed(() => {
    return (sortBy = 'name') => {
      const sortedSizes = [...sizes.value]

      switch (sortBy) {
        case 'name':
          return sortedSizes.sort((a, b) => {
            // Tri intelligent pour les tailles
            const isNumericA = /^\d+$/.test(a.name)
            const isNumericB = /^\d+$/.test(b.name)

            if (isNumericA && isNumericB) {
              return parseInt(a.name) - parseInt(b.name)
            }

            // Ordre prédéfini pour les tailles de vêtements
            const clothingSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
            const indexA = clothingSizes.indexOf(a.name.toUpperCase())
            const indexB = clothingSizes.indexOf(b.name.toUpperCase())

            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB
            }

            return a.name.localeCompare(b.name)
          })
        case 'slug':
          return sortedSizes.sort((a, b) => a.slug.localeCompare(b.slug))
        case 'created_at':
          return sortedSizes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        default:
          return sortedSizes
      }
    }
  })

  // Actions utilitaires
  const setLoading = (state) => {
    loading.value = state
  }

  const setError = (message) => {
    error.value = message
    setTimeout(() => clearError(), 5000)
  }

  const clearError = () => {
    error.value = null
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[àáâäãåā]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôöõø]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const validateSizeData = (sizeData) => {
    const errors = []

    if (!sizeData.name?.trim()) {
      errors.push('Le nom de la taille est requis')
    }

    if (!sizeData.slug?.trim()) {
      errors.push('Le slug est requis')
    }

    // Vérifier l'unicité du slug (sauf pour la modification)
    if (sizeData.slug) {
      const existingSize = sizes.value.find(s =>
        s.slug === sizeData.slug && s.id !== sizeData.id
      )
      if (existingSize) {
        errors.push('Ce slug existe déjà')
      }
    }

    // Vérifier l'unicité du nom (sauf pour la modification)
    if (sizeData.name) {
      const existingSize = sizes.value.find(s =>
        s.name.toLowerCase() === sizeData.name.toLowerCase() && s.id !== sizeData.id
      )
      if (existingSize) {
        errors.push('Cette taille existe déjà')
      }
    }

    return errors
  }

  // Actions CRUD
  const fetchSizes = async () => {
    setLoading(true)
    clearError()

    try {
      const response = await api.get('/api/admin/sizes')

      // Gérer différents formats de réponse
      let sizesData = []
      if (response.data && Array.isArray(response.data)) {
        sizesData = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        sizesData = response.data.data
      } else {
        throw new Error('Format de réponse invalide')
      }

      sizes.value = sizesData.map(size => ({
        ...size,
        // S'assurer que tous les champs nécessaires existent
        name: size.name || '',
        slug: size.slug || '',
        description: size.description || null
      }))

      return sizes.value
    } catch (err) {
      console.error('Erreur lors du chargement des tailles:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des tailles')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createSize = async (sizeData) => {
    setLoading(true)
    clearError()

    try {
      // Validation
      const validationErrors = validateSizeData(sizeData)
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }

      // Nettoyer les données
      const cleanedData = {
        name: sizeData.name.trim(),
        slug: sizeData.slug.trim() || generateSlug(sizeData.name),
        description: sizeData.description?.trim() || null
      }

      const response = await api.post('/api/admin/sizes', cleanedData)
      const newSize = response.data?.data || response.data

      // Ajouter à la liste locale
      sizes.value.push(newSize)

      return newSize
    } catch (err) {
      console.error('Erreur lors de la création de la taille:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création de la taille')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateSize = async (id, sizeData) => {
    setLoading(true)
    clearError()

    try {
      // Validation
      const validationErrors = validateSizeData({ ...sizeData, id })
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }

      // Nettoyer les données
      const cleanedData = {
        name: sizeData.name.trim(),
        slug: sizeData.slug.trim(),
        description: sizeData.description?.trim() || null
      }

      const response = await api.put(`/api/admin/sizes/${id}`, cleanedData)
      const updatedSize = response.data?.data || response.data

      // Mettre à jour dans la liste locale
      const index = sizes.value.findIndex(size => size.id === id)
      if (index !== -1) {
        sizes.value[index] = { ...sizes.value[index], ...updatedSize }
      }

      return updatedSize
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la taille:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de la taille')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteSize = async (id) => {
    setLoading(true)
    clearError()

    try {
      await api.delete(`/api/admin/sizes/${id}`)

      // Supprimer de la liste locale
      const index = sizes.value.findIndex(size => size.id === id)
      if (index !== -1) {
        sizes.value.splice(index, 1)
      }

      return true
    } catch (err) {
      console.error('Erreur lors de la suppression de la taille:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression de la taille')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Actions de recherche et filtrage
  const searchSizes = computed(() => {
    return (query) => {
      if (!query.trim()) return sizes.value

      const searchTerm = query.toLowerCase()
      return sizes.value.filter(size =>
        size.name.toLowerCase().includes(searchTerm) ||
        size.slug.toLowerCase().includes(searchTerm) ||
        (size.description && size.description.toLowerCase().includes(searchTerm))
      )
    }
  })

  // Actions de groupage
  const groupSizesByType = computed(() => {
    return () => {
      const grouped = {
        clothing: [],
        shoes: [],
        numeric: [],
        other: []
      }

      sizes.value.forEach(size => {
        const name = size.name.toLowerCase()

        if (/^(xxs|xs|s|m|l|xl|xxl|xxxl)$/.test(name)) {
          grouped.clothing.push(size)
        } else if (/^(\d{2,3}(\.\d)?|uk\d+|us\d+)$/.test(name)) {
          grouped.shoes.push(size)
        } else if (/^\d+$/.test(name)) {
          grouped.numeric.push(size)
        } else {
          grouped.other.push(size)
        }
      })

      return grouped
    }
  })

  // Actions utilitaires pour les formulaires
  const resetState = () => {
    sizes.value = []
    loading.value = false
    error.value = null
  }

  const refreshSizes = async () => {
    await fetchSizes()
  }

  // Suggestions de tailles
  const getSizeSuggestions = computed(() => {
    return (category = 'clothing') => {
      const suggestions = {
        clothing: [
          { name: 'XXS', description: 'Extra Extra Small' },
          { name: 'XS', description: 'Extra Small' },
          { name: 'S', description: 'Small' },
          { name: 'M', description: 'Medium' },
          { name: 'L', description: 'Large' },
          { name: 'XL', description: 'Extra Large' },
          { name: 'XXL', description: 'Extra Extra Large' },
          { name: 'XXXL', description: 'Extra Extra Extra Large' }
        ],
        shoes: [
          { name: '35', description: 'Pointure européenne 35' },
          { name: '36', description: 'Pointure européenne 36' },
          { name: '37', description: 'Pointure européenne 37' },
          { name: '38', description: 'Pointure européenne 38' },
          { name: '39', description: 'Pointure européenne 39' },
          { name: '40', description: 'Pointure européenne 40' },
          { name: '41', description: 'Pointure européenne 41' },
          { name: '42', description: 'Pointure européenne 42' },
          { name: '43', description: 'Pointure européenne 43' },
          { name: '44', description: 'Pointure européenne 44' },
          { name: '45', description: 'Pointure européenne 45' }
        ],
        children: [
          { name: '2-3 ans', description: 'Taille pour enfant de 2-3 ans' },
          { name: '4-5 ans', description: 'Taille pour enfant de 4-5 ans' },
          { name: '6-7 ans', description: 'Taille pour enfant de 6-7 ans' },
          { name: '8-9 ans', description: 'Taille pour enfant de 8-9 ans' },
          { name: '10-11 ans', description: 'Taille pour enfant de 10-11 ans' },
          { name: '12-13 ans', description: 'Taille pour enfant de 12-13 ans' }
        ]
      }

      return suggestions[category] || []
    }
  })

  // Statistiques
  const getSizeStats = computed(() => {
    return {
      total: sizes.value.length,
      byType: (() => {
        const stats = { clothing: 0, shoes: 0, numeric: 0, other: 0 }

        sizes.value.forEach(size => {
          const name = size.name.toLowerCase()

          if (/^(xxs|xs|s|m|l|xl|xxl|xxxl)$/.test(name)) {
            stats.clothing++
          } else if (/^(\d{2,3}(\.\d)?|uk\d+|us\d+)$/.test(name)) {
            stats.shoes++
          } else if (/^\d+$/.test(name)) {
            stats.numeric++
          } else {
            stats.other++
          }
        })

        return stats
      })(),
      withDescription: sizes.value.filter(size => size.description).length,
      withoutDescription: sizes.value.filter(size => !size.description).length
    }
  })

  // Actions de réordonnancement
  const reorderSizes = async (sizesOrder) => {
    setLoading(true)
    clearError()

    try {
      // Appel API pour sauvegarder l'ordre (si supporté par le backend)
      // await api.put('/api/admin/sizes/reorder', { order: sizesOrder })

      // Mettre à jour l'ordre local
      const reorderedSizes = sizesOrder.map(id =>
        sizes.value.find(size => size.id === id)
      ).filter(Boolean)

      sizes.value = reorderedSizes

      return true
    } catch (err) {
      console.error('Erreur lors du réordonnancement:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors du réordonnancement')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    // État
    sizes: sizesList,
    loading: isLoading,
    error: hasError,
    errorMessage,

    // Getters
    sizesCount,
    getSizeById,
    getSizeBySlug,
    getSizesByCategory,
    getSortedSizes,
    searchSizes,
    groupSizesByType,
    getSizeSuggestions,
    getSizeStats,

    // Actions
    fetchSizes,
    createSize,
    updateSize,
    deleteSize,
    resetState,
    refreshSizes,
    clearError,
    generateSlug,
    validateSizeData,
    reorderSizes
  }
})
