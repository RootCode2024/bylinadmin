import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'

export const useColorsStore = defineStore('colors', () => {
  // État
  const colors = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const colorsList = computed(() => colors.value)
  const colorsCount = computed(() => colors.value.length)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const errorMessage = computed(() => error.value)

  // Getters utilitaires
  const getColorById = computed(() => {
    return (id) => colors.value.find(color => color.id === id)
  })

  const getColorBySlug = computed(() => {
    return (slug) => colors.value.find(color => color.slug === slug)
  })

  const getColorsByHexRange = computed(() => {
    return (startHex, endHex) => {
      return colors.value.filter(color => {
        const hex = color.hex_code.replace('#', '')
        const hexNum = parseInt(hex, 16)
        const startNum = parseInt(startHex.replace('#', ''), 16)
        const endNum = parseInt(endHex.replace('#', ''), 16)
        return hexNum >= startNum && hexNum <= endNum
      })
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

  const validateColorData = (colorData) => {
    const errors = []

    if (!colorData.name?.trim()) {
      errors.push('Le nom de la couleur est requis')
    }

    if (!colorData.slug?.trim()) {
      errors.push('Le slug est requis')
    }

    if (!colorData.hex_code?.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.push('Le code couleur doit être au format #RRGGBB')
    }

    // Vérifier l'unicité du slug (sauf pour la modification)
    if (colorData.slug) {
      const existingColor = colors.value.find(c =>
        c.slug === colorData.slug && c.id !== colorData.id
      )
      if (existingColor) {
        errors.push('Ce slug existe déjà')
      }
    }

    return errors
  }

  // Actions CRUD
  const fetchColors = async () => {
    setLoading(true)
    clearError()

    try {
      const response = await api.get('/colors')

      // Gérer différents formats de réponse
      let colorsData = []
      if (response.data && Array.isArray(response.data)) {
        colorsData = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        colorsData = response.data.data
      } else {
        throw new Error('Format de réponse invalide')
      }

      colors.value = colorsData.map(color => ({
        ...color,
        // S'assurer que tous les champs nécessaires existent
        name: color.name || '',
        slug: color.slug || '',
        hex_code: color.hex_code || '#000000'
      }))

      return colors.value
    } catch (err) {
      console.error('Erreur lors du chargement des couleurs:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des couleurs')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createColor = async (colorData) => {
    setLoading(true)
    clearError()

    try {
      // Validation
      const validationErrors = validateColorData(colorData)
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }

      // Nettoyer les données
      const cleanedData = {
        name: colorData.name.trim(),
        slug: colorData.slug.trim() || generateSlug(colorData.name),
        hex_code: colorData.hex_code.toUpperCase()
      }

      const response = await api.post('/colors', cleanedData)
      const newColor = response.data?.data || response.data

      // Ajouter à la liste locale
      colors.value.push(newColor)

      return newColor
    } catch (err) {
      console.error('Erreur lors de la création de la couleur:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création de la couleur')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateColor = async (id, colorData) => {
    setLoading(true)
    clearError()

    try {
      // Validation
      const validationErrors = validateColorData({ ...colorData, id })
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }

      // Nettoyer les données
      const cleanedData = {
        name: colorData.name.trim(),
        slug: colorData.slug.trim(),
        hex_code: colorData.hex_code.toUpperCase()
      }

      const response = await api.put(`/colors/${id}`, cleanedData)
      const updatedColor = response.data?.data || response.data

      // Mettre à jour dans la liste locale
      const index = colors.value.findIndex(color => color.id === id)
      if (index !== -1) {
        colors.value[index] = { ...colors.value[index], ...updatedColor }
      }

      return updatedColor
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la couleur:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de la couleur')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteColor = async (id) => {
    setLoading(true)
    clearError()

    try {
      await api.delete(`/colors/${id}`)

      // Supprimer de la liste locale
      const index = colors.value.findIndex(color => color.id === id)
      if (index !== -1) {
        colors.value.splice(index, 1)
      }

      return true
    } catch (err) {
      console.error('Erreur lors de la suppression de la couleur:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression de la couleur')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Actions de recherche et filtrage
  const searchColors = computed(() => {
    return (query) => {
      if (!query.trim()) return colors.value

      const searchTerm = query.toLowerCase()
      return colors.value.filter(color =>
        color.name.toLowerCase().includes(searchTerm) ||
        color.slug.toLowerCase().includes(searchTerm) ||
        color.hex_code.toLowerCase().includes(searchTerm)
      )
    }
  })

  const filterColorsByHue = computed(() => {
    return (hue) => {
      // Convertir hex en HSL et filtrer par teinte
      return colors.value.filter(color => {
        const hex = color.hex_code.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16) / 255
        const g = parseInt(hex.substr(2, 2), 16) / 255
        const b = parseInt(hex.substr(4, 2), 16) / 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const delta = max - min

        let h = 0
        if (delta !== 0) {
          if (max === r) h = ((g - b) / delta) % 6
          else if (max === g) h = (b - r) / delta + 2
          else h = (r - g) / delta + 4
        }
        h = Math.round(h * 60)
        if (h < 0) h += 360

        return Math.abs(h - hue) <= 30 // Tolérance de 30 degrés
      })
    }
  })

  // Actions utilitaires pour les formulaires
  const resetState = () => {
    colors.value = []
    loading.value = false
    error.value = null
  }

  const refreshColors = async () => {
    await fetchColors()
  }

  // Statistiques
  const getColorStats = computed(() => {
    return {
      total: colors.value.length,
      byHue: colors.value.reduce((acc, color) => {
        const hex = color.hex_code.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16) / 255
        const g = parseInt(hex.substr(2, 2), 16) / 255
        const b = parseInt(hex.substr(4, 2), 16) / 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const delta = max - min

        let h = 0
        if (delta !== 0) {
          if (max === r) h = ((g - b) / delta) % 6
          else if (max === g) h = (b - r) / delta + 2
          else h = (r - g) / delta + 4
        }
        h = Math.round(h * 60)
        if (h < 0) h += 360

        let hueRange = 'Other'
        if (h >= 0 && h < 60) hueRange = 'Red'
        else if (h >= 60 && h < 120) hueRange = 'Yellow'
        else if (h >= 120 && h < 180) hueRange = 'Green'
        else if (h >= 180 && h < 240) hueRange = 'Cyan'
        else if (h >= 240 && h < 300) hueRange = 'Blue'
        else if (h >= 300 && h < 360) hueRange = 'Magenta'

        acc[hueRange] = (acc[hueRange] || 0) + 1
        return acc
      }, {})
    }
  })

  return {
    // État
    colors: colorsList,
    loading: isLoading,
    error: hasError,
    errorMessage,

    // Getters
    colorsCount,
    getColorById,
    getColorBySlug,
    getColorsByHexRange,
    searchColors,
    filterColorsByHue,
    getColorStats,

    // Actions
    fetchColors,
    createColor,
    updateColor,
    deleteColor,
    resetState,
    refreshColors,
    clearError,
    generateSlug,
    validateColorData
  }
})
