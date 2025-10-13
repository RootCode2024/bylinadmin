<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-8 bg-white dark:bg-gray-900 min-h-screen">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex flex-col justify-between mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Analytiques de la Collection</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ collection?.name }} - Performance et statistiques détaillées
            </p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
            <router-link
              :to="`/collections/${collectionId}`"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm transition-colors"
            >
              <EyeIcon class="w-5 h-5" />
              Voir les détails
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

      <!-- Chargement -->
      <div v-if="loading" class="flex justify-center py-12">
        <ArrowPathIcon class="w-8 h-8 animate-spin text-blue-600" />
      </div>

      <div v-else-if="collection" class="space-y-8">
        <!-- Métriques principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center">
              <EyeIcon class="w-8 h-8 text-blue-500 mr-4" />
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Vues totales</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ collection.view_count }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center">
              <ShoppingBagIcon class="w-8 h-8 text-green-500 mr-4" />
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Conversions</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ collection.conversion_count }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center">
              <ChartBarIcon class="w-8 h-8 text-purple-500 mr-4" />
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de conversion</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ collection.conversion_rate }}%</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center">
              <StarIcon class="w-8 h-8 text-yellow-500 mr-4" />
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Note moyenne</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ collection.average_rating }}/5</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Performance temporelle -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Performance temporelle
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">Vues cette semaine</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ analytics.weekly_views || 0 }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">Conversions cette semaine</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ analytics.weekly_conversions || 0 }}</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-sm text-gray-500 dark:text-gray-400">Taux de conversion hebdomadaire</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ analytics.weekly_conversion_rate || 0 }}%</span>
              </div>
            </div>
          </div>

          <!-- Distribution des notes -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Distribution des notes
            </h3>
            <div class="space-y-3">
              <div v-for="n in 5" :key="n" class="flex items-center">
                <span class="w-4 text-sm text-gray-500 dark:text-gray-400">{{ 6 - n }} étoiles</span>
                <div class="flex-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    class="h-2 rounded-full bg-yellow-400"
                    :style="`width: ${getRatingPercentage(6 - n)}%`"
                  ></div>
                </div>
                <span class="w-8 text-sm text-gray-500 dark:text-gray-400 text-right">
                  {{ getRatingCount(6 - n) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Produits les plus performants -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Produits les plus performants
            </h3>
            <div v-if="topProducts.length > 0" class="space-y-4">
              <div
                v-for="product in topProducts"
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
                <div class="flex items-center space-x-6">
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ product.sales_count || 0 }} ventes</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ product.conversion_rate || 0 }}% de conversion</p>
                  </div>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ formatPrice(product.revenue || 0) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <ChartBarIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de performance disponible</p>
            </div>
          </div>
        </div>

        <!-- Insights et recommandations -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Insights et recommandations
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white mb-3">Points forts</h4>
              <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li class="flex items-center" v-if="collection.conversion_rate >= 5">
                  <CheckCircleIcon class="w-4 h-4 text-green-500 mr-2" />
                  Excellent taux de conversion
                </li>
                <li class="flex items-center" v-if="collection.average_rating >= 4">
                  <CheckCircleIcon class="w-4 h-4 text-green-500 mr-2" />
                  Très bonne satisfaction client
                </li>
                <li class="flex items-center" v-if="collection.view_count >= 1000">
                  <CheckCircleIcon class="w-4 h-4 text-green-500 mr-2" />
                  Forte visibilité
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white mb-3">Opportunités d'amélioration</h4>
              <ul v-if="collection.conversion_rate < 3 || collection.reviews_count < 10" class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li class="flex items-center" v-if="collection.conversion_rate < 3">
                  <ExclamationTriangleIcon class="w-4 h-4 text-yellow-500 mr-2" />
                  Taux de conversion à améliorer
                </li>
                <li class="flex items-center" v-if="collection.reviews_count < 10">
                  <ExclamationTriangleIcon class="w-4 h-4 text-yellow-500 mr-2" />
                  Peu d'avis clients
                </li>
              </ul>
              <p v-else class="text-sm text-gray-500 dark:text-gray-400">Aucune recommandation pour le moment. Continuez votre bon travail!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  EyeIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon
} from '@heroicons/vue/24/outline'
import api from '@/api/axiosConfig'

const route = useRoute()
const currentPageTitle = ref("Analytiques de la Collection")

// États
const loading = ref(true)
const collection = ref(null)
const analytics = ref({})
const topProducts = ref([])

// ID de la collection
const collectionId = computed(() => route.params.id)

// Méthodes utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(price).replace('XAF', 'F CFA')
}

const getRatingPercentage = (rating) => {
  if (!collection.value?.rating_breakdown) return 0
  const total = collection.value.reviews_count
  const count = collection.value.rating_breakdown[rating] || 0
  return total > 0 ? (count / total) * 100 : 0
}

const getRatingCount = (rating) => {
  if (!collection.value?.rating_breakdown) return 0
  return collection.value.rating_breakdown[rating] || 0
}

// Charger les données
const fetchData = async () => {
  try {
    loading.value = true
    
    // Charger la collection
    const collectionResponse = await api.get(`/collections/${collectionId.value}`)
    console.log('Collection response:', collectionResponse)
    if (collectionResponse.success) {
      collection.value = collectionResponse.data
    }
    
    // Charger les analytiques détaillées (à implémenter dans l'API)
    await fetchAnalytics()
    
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  } finally {
    loading.value = false
  }
}

// Charger les analytiques
const fetchAnalytics = async () => {
  try {
    // Simuler des données d'analytiques (à remplacer par un appel API réel)
    analytics.value = {
      weekly_views: Math.floor(collection.value.view_count * 0.1),
      weekly_conversions: Math.floor(collection.value.conversion_count * 0.1),
      weekly_conversion_rate: (collection.value.conversion_rate * 0.9).toFixed(1)
    }
    
    // Simuler les produits performants
    if (collection.value.products) {
      topProducts.value = collection.value.products.slice(0, 5).map(product => ({
        ...product,
        sales_count: Math.floor(Math.random() * 50) + 10,
        conversion_rate: (Math.random() * 10 + 1).toFixed(1),
        revenue: product.price * (Math.floor(Math.random() * 50) + 10)
      }))
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des analytiques:', error)
  }
}

// Initialisation
onMounted(() => {
  fetchData()
})
</script>