<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <!-- Filtres -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Note</label>
            <select v-model="filters.rating" class="w-full p-2.5 border rounded-lg">
              <option value="">Toutes</option>
              <option value="5">5 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="2">2 étoiles</option>
              <option value="1">1 étoile</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Statut</label>
            <select v-model="filters.status" class="w-full p-2.5 border rounded-lg">
              <option value="">Tous</option>
              <option value="approved">Approuvé</option>
              <option value="pending">En attente</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
            <select v-model="filters.date" class="w-full p-2.5 border rounded-lg">
              <option value="">Toutes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recherche</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Produit, client..."
              class="w-full p-2.5 border rounded-lg"
            >
          </div>
        </div>
      </div>

      <!-- Liste des avis -->
      <div class="space-y-6">
        <div
          v-for="review in filteredReviews"
          :key="review.id"
          class="p-6 border rounded-lg dark:border-gray-700"
          :class="{
            'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30': review.status === 'approved',
            'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30': review.status === 'pending',
            'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30': review.status === 'rejected'
          }"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4">
              <img
                v-if="review.customer.avatar_url"
                :src="review.customer.avatar_url"
                class="w-10 h-10 rounded-full"
                alt=""
              >
              <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ review.customer.name }}
                  </h3>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(review.created_at) }}
                  </span>
                </div>
                <div class="flex items-center mt-1">
                  <div class="flex items-center">
                    <svg
                      v-for="star in 5"
                      :key="star"
                      :class="{
                        'text-yellow-400': star <= review.rating,
                        'text-gray-300 dark:text-gray-500': star > review.rating
                      }"
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span class="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {{ review.rating }} étoiles
                  </span>
                </div>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {{ review.comment }}
                </p>
                <div class="mt-3">
                  <span class="text-xs font-medium px-2.5 py-0.5 rounded"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': review.status === 'approved',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': review.status === 'pending',
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': review.status === 'rejected'
                    }"
                  >
                    {{ getStatusText(review.status) }}
                  </span>
                  <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    sur <a href="#" class="text-blue-600 hover:underline dark:text-blue-400">{{ review.product.name }}</a>
                  </span>
                </div>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                v-if="review.status !== 'approved'"
                @click="approveReview(review.id)"
                class="p-1.5 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                title="Approuver"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                v-if="review.status !== 'rejected'"
                @click="rejectReview(review.id)"
                class="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title="Rejeter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                @click="deleteReview(review.id)"
                class="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                title="Supprimer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="pagination.currentPage"
        :total-items="filteredReviews.length"
        :per-page="pagination.perPage"
        @page-changed="changePage"
        class="mt-6"
      />

      <!-- Aucun avis -->
      <div
        v-if="filteredReviews.length === 0"
        class="p-12 text-center border-2 border-dashed rounded-lg dark:border-gray-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Aucun avis trouvé
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ajustez vos filtres ou attendez que vos clients laissent des avis
        </p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import Pagination from '@/components/ui/Pagination.vue'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"


const currentPageTitle = ref("Avis clients")

// Sample data
const reviews = ref([
  {
    id: 1,
    rating: 5,
    comment: 'Produit excellent, je recommande vivement! La qualité est au rendez-vous.',
    status: 'approved',
    created_at: '2023-06-10T14:30:00',
    customer: {
      id: 1,
      name: 'Jean Dupont',
      avatar: '/images/avatars/1.jpg'
    },
    product: {
      id: 101,
      name: 'T-Shirt en coton bio'
    }
  },
  // Add more reviews...
])

const filters = ref({
  rating: '',
  status: '',
  date: '',
  search: ''
})

const pagination = ref({
  currentPage: 1,
  perPage: 5
})

const filteredReviews = computed(() => {
  let result = [...reviews.value]

  if (filters.value.rating) {
    result = result.filter(r => r.rating === parseInt(filters.value.rating))
  }

  if (filters.value.status) {
    result = result.filter(r => r.status === filters.value.status)
  }

  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(r =>
      r.customer.name.toLowerCase().includes(searchTerm) ||
      r.product.name.toLowerCase().includes(searchTerm) ||
      r.comment.toLowerCase().includes(searchTerm))
  }

  return result
})

const paginatedReviews = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return filteredReviews.value.slice(start, end)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getStatusText = (status) => {
  const statusMap = {
    approved: 'Approuvé',
    pending: 'En attente',
    rejected: 'Rejeté'
  }
  return statusMap[status] || status
}

const approveReview = (id) => {
  const review = reviews.value.find(r => r.id === id)
  if (review) review.status = 'approved'
}

const rejectReview = (id) => {
  const review = reviews.value.find(r => r.id === id)
  if (review) review.status = 'rejected'
}

const deleteReview = (id) => {
  reviews.value = reviews.value.filter(r => r.id !== id)
}

const exportReviews = () => {
  // Implement export functionality
  console.log('Exporting reviews...')
}

const changePage = (page) => {
  pagination.value.currentPage = page
}
</script>
