<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-8 bg-white dark:bg-gray-900 min-h-screen">
      <!-- Messages -->
      <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center">
          <CheckCircleIcon class="w-5 h-5 text-green-400 mr-3" />
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
      </div>

      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex flex-col justify-between mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gérer les Produits</h1>
            <p class="mt-5 text-gray-600 dark:text-gray-400"> 
              <strong class="text-xl text-indigo-600 dark:text-indigo-400">{{ collection?.name }}</strong> - Ajoutez ou retirez des produits de cette collection
            </p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
            <router-link
              :to="`/collections/${collectionId}/edit`"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm transition-colors"
            >
              <PencilIcon class="w-5 h-5" />
              Modifier la collection
            </router-link>
            <router-link
              to="/collections"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm transition-colors"
            >
              <ArrowLeftIcon class="w-5 h-5" />
              Retour aux collections
            </router-link>
          </div>
        </div>
      </div>

      <!-- Chargement initial -->
      <div v-if="loading && !actionLoading" class="flex justify-center py-12">
        <ArrowPathIcon class="w-8 h-8 animate-spin text-blue-600" />
      </div>

      <div v-else-if="collection" class="space-y-8">
        <!-- Produits actuels de la collection -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Produits dans la collection ({{ collectionProducts.length }})
              </h2>
              <div v-if="actionLoading" class="flex items-center text-sm text-blue-600">
                <ArrowPathIcon class="w-4 h-4 animate-spin mr-2" />
                Mise à jour...
              </div>
            </div>
          </div>
          <div class="p-6">
            <div v-if="collectionProducts.length > 0" class="space-y-4">
              <div
                v-for="product in collectionProducts"
                :key="product.id"
                class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <img
                    v-if="product.main_image_url"
                    :src="product.main_image_url"
                    :alt="product.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  >
                  <div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center" v-else>
                    <PhotoIcon class="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ product.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ product.sku }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatPrice(product.price) }}
                  </span>
                  <button
                    @click="removeProduct(product.id)"
                    :disabled="actionLoading"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <ShoppingBagIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun produit dans cette collection</p>
            </div>
          </div>
        </div>

        <!-- Ajouter des produits -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Ajouter des produits
            </h2>
          </div>
          <div class="p-6">
            <!-- Recherche -->
            <div class="mb-6">
              <div class="relative">
                <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  v-model="searchQuery"
                  @input="debouncedSearch"
                  placeholder="Rechercher un produit par nom, SKU..."
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
              </div>
            </div>

            <!-- Liste des produits disponibles -->
            <div class="max-h-96 overflow-y-auto">
              <div v-if="availableProducts.length > 0" class="space-y-2">
                <div
                  v-for="product in availableProducts"
                  :key="product.id"
                  class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <img
                      v-if="product.main_image_url"
                      :src="product.main_image_url"
                      :alt="product.name"
                      class="w-10 h-10 rounded object-cover"
                    >
                    <div class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center" v-else>
                      <PhotoIcon class="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ product.name }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ product.sku }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatPrice(product.price) }}
                    </span>
                    <button
                      @click="addProduct(product.id)"
                      :disabled="actionLoading"
                      class="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
                <CubeIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun produit trouvé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PencilIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  TrashIcon,
  PhotoIcon,
  CubeIcon
} from '@heroicons/vue/24/outline'
import api from '@/api/axiosConfig'

const route = useRoute()
const router = useRouter()
const currentPageTitle = ref("Gérer les Produits")

// États
const loading = ref(true)
const actionLoading = ref(false) // Nouvel état pour les actions
const collectionData = ref(null) // Changé de collection à collectionData
const collectionProducts = ref([])
const availableProducts = ref([])
const searchQuery = ref('')
const successMessage = ref(null)

// ID de la collection
const collectionId = computed(() => route.params.id)

// Computed property pour la collection
const collection = computed(() => {
  return collectionData.value?.data || collectionData.value
})

// Méthodes utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(price).replace('XAF', 'F CFA')
}

// Charger les données initiales
const fetchData = async () => {
  try {
    loading.value = true
    
    // Charger la collection
    const collectionResponse = await api.get(`/collections/${collectionId.value}`)
    console.log('Collection response:', collectionResponse)
    
    if (collectionResponse?.success) {
      collectionData.value = collectionResponse
      collectionProducts.value = collectionResponse.data?.products || []
    } else {
      console.error('Erreur dans la réponse de la collection:', collectionResponse)
    }
    
    // Charger les produits disponibles
    await searchProducts()
    
  } catch (error) {
    console.error('Erreur lors du chargement initial:', error)
  } finally {
    loading.value = false
  }
}

// Recherche de produits
const searchProducts = async () => {
  try {
    const params = {
      search: searchQuery.value,
      per_page: 50
    }
    
    const response = await api.get('/products', { params })
    console.log('Produits disponibles:', response)
    
    if (response?.success) {
      // Filtrer les produits déjà dans la collection
      const collectionProductIds = collectionProducts.value.map(p => p.id)
      availableProducts.value = response.data.filter(
        product => !collectionProductIds.includes(product.id)
      )
    } else {
      console.error('Erreur dans la réponse des produits:', response)
    }
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
  }
}

// Recherche avec debounce
const debouncedSearch = debounce(searchProducts, 500)

// Ajouter un produit
const addProduct = async (productId) => {
  try {
    actionLoading.value = true
    
    const response = await api.post(`/collections/${collectionId.value}/products`, {
      product_id: productId
    })
    
    console.log('Réponse ajout produit:', response)
    
    if (response?.success) {
      successMessage.value = 'Produit ajouté avec succès'
      
      // Mettre à jour localement sans recharger
      updateProductLists(productId, 'add', response.data)
      
      setTimeout(() => successMessage.value = null, 3000)
    } else {
      console.error('Erreur lors de l\'ajout:', response)
      successMessage.value = response?.message || 'Erreur lors de l\'ajout'
      setTimeout(() => successMessage.value = null, 3000)
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error)
    successMessage.value = error.response?.message || 'Erreur lors de l\'ajout du produit'
    setTimeout(() => successMessage.value = null, 3000)
  } finally {
    actionLoading.value = false
  }
}

// Retirer un produit
const removeProduct = async (productId) => {
  try {
    actionLoading.value = true
    
    const response = await api.delete(`/collections/${collectionId.value}/products/${productId}`)
    
    console.log('Réponse suppression produit:', response)
    
    if (response?.success) {
      successMessage.value = 'Produit retiré avec succès'
      
      // Mettre à jour localement sans recharger
      updateProductLists(productId, 'remove')
      
      setTimeout(() => successMessage.value = null, 3000)
    } else {
      console.error('Erreur lors de la suppression:', response.data)
      successMessage.value = response?.message || 'Erreur lors de la suppression'
      setTimeout(() => successMessage.value = null, 3000)
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    successMessage.value = error.response?.message || 'Erreur lors de la suppression du produit'
    setTimeout(() => successMessage.value = null, 3000)
  } finally {
    actionLoading.value = false
  }
}

// Mettre à jour les listes avec les données du produit
const updateProductLists = (productId, action, productData = null) => {
  if (action === 'add') {
    // Trouver le produit dans availableProducts
    const productIndex = availableProducts.value.findIndex(p => p.id === productId)
    if (productIndex !== -1) {
      const [product] = availableProducts.value.splice(productIndex, 1)
      // Utiliser les données du produit de la réponse API si disponibles
      collectionProducts.value.push(productData || product)
    }
  } else if (action === 'remove') {
    // Trouver le produit dans collectionProducts
    const productIndex = collectionProducts.value.findIndex(p => p.id === productId)
    if (productIndex !== -1) {
      const [product] = collectionProducts.value.splice(productIndex, 1)
      availableProducts.value.push(product)
    }
  }
}

// Initialisation
onMounted(() => {
  fetchData()
})
</script>