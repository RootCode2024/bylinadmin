<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <!-- En-tête avec statistiques -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ reviewsStore.stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Approuvés</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ reviewsStore.stats.approved }}</p>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">En attente</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ reviewsStore.stats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Rejetés</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ reviewsStore.stats.rejected }}</p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 00-2-2m0 0V9a2 2 0 012-2h2a2 2 0 002-2" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Moyenne</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ reviewsStore.stats.average_rating }}/5</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Note</label>
            <select 
              v-model="filters.rating" 
              @change="loadReviews"
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
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
            <select 
              v-model="filters.status" 
              @change="loadReviews"
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous</option>
              <option value="approved">Approuvé</option>
              <option value="pending">En attente</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
            <select 
              v-model="filters.date" 
              @change="loadReviews"
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
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
              @input="debouncedSearch"
              type="text"
              placeholder="Produit, client..."
              class="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div class="flex items-end">
            <button
              @click="exportReviews"
              :disabled="reviewsStore.isLoading"
              class="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Exporter
            </button>
          </div>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-if="reviewsStore.isLoading && reviewsStore.reviews.length === 0" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600 dark:text-gray-400">Chargement des avis...</span>
      </div>

      <!-- Erreur -->
      <div v-else-if="reviewsStore.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              Erreur de chargement
            </h3>
            <div class="mt-2 text-sm text-red-700 dark:text-red-300">
              {{ reviewsStore.error }}
            </div>
            <div class="mt-3">
              <button
                @click="loadReviews"
                class="bg-red-100 dark:bg-red-900/50 px-3 py-1 rounded text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/70"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des avis -->
      <div v-else class="space-y-6">
        <div
          v-for="review in reviewsStore.reviews"
          :key="review.id"
          class="p-6 border rounded-lg dark:border-gray-700 transition-colors hover:shadow-md"
          :class="{
            'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30': review.status === 'approved',
            'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30': review.status === 'pending',
            'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30': review.status === 'rejected'
          }"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4">
              <img
                v-if="review.user?.avatar_url"
                :src="review.user?.avatar_url"
                class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                :alt="`Avatar de ${review.user?.name || 'Client'}`"
                @error="handleImageError"
              >
              <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ review.user?.name || `Client #${review.user?.id}` }}
                  </h3>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(review.created_at) }}
                  </span>
                  <span v-if="review.verified_purchase" class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900/20 dark:text-green-300">
                    Achat vérifié
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
                    {{ review.rating }} étoile{{ review.rating > 1 ? 's' : '' }}
                  </span>
                </div>
                
                <p class="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {{ review.comment }}
                </p>
                
                <!-- Images du review si présentes -->
                <div v-if="review.images && review.images.length > 0" class="mt-3 flex flex-wrap gap-2">
                  <img
                    v-for="image in review.images.slice(0, 4)"
                    :key="image.id"
                    :src="image.url"
                    class="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-75 transition-opacity"
                    :alt="image.alt || 'Image du review'"
                    @click="openImageModal(image)"
                  >
                  <div v-if="review.images.length > 4" class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    +{{ review.images.length - 4 }}
                  </div>
                </div>
                
                <div class="mt-4 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <span class="text-xs font-medium px-2.5 py-0.5 rounded-full"
                      :class="{
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': review.status === 'approved',
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': review.status === 'pending',
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': review.status === 'rejected'
                      }"
                    >
                      {{ getStatusText(review.status) }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      sur 
                      <a 
                        :href="`/products/${review.product?.id}`" 
                        class="text-blue-600 hover:underline dark:text-blue-400"
                        target="_blank"
                      >
                        {{ review.product?.name || 'Produit supprimé' }}
                      </a>
                    </span>
                    <span v-if="review.helpful_count > 0" class="text-xs text-gray-500 dark:text-gray-400">
                      {{ review.helpful_count }} personne{{ review.helpful_count > 1 ? 's' : '' }} trouve{{ review.helpful_count > 1 ? 'nt' : '' }} cet avis utile
                    </span>
                  </div>
                </div>
                
                <!-- Réponse de l'admin -->
                <div v-if="review.admin_response" class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                  <div class="flex items-start space-x-2">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-blue-900 dark:text-blue-200">Réponse de l'équipe</p>
                      <p class="text-sm text-blue-800 dark:text-blue-300 mt-1">{{ review.admin_response.content }}</p>
                      <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">{{ formatDate(review.admin_response.created_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div
              v-if="isLoading[review.id]"
              class="loader"
              :style="{
                animationDuration: `${loadingDuration[review.id] || 2000}ms`
              }"
            />

            <div v-else class="flex items-start space-x-2">
              <button
                v-if="review.status !== 'approved'"
                @click="approveReview(review.id)"
                :disabled="actionLoading[review.id]"
                class="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                title="Approuver"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              
              <button
                v-if="review.status !== 'rejected'"
                @click="rejectReview(review.id)"
                :disabled="actionLoading[review.id]"
                class="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                title="Rejeter"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <button
                @click="openResponseModal(review)"
                class="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Répondre"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              
              <button
                @click="openDeleteConfirmation(review.id)"
                :disabled="actionLoading[review.id]"
                class="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                title="Supprimer"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="reviewsStore.totalPages > 1" class="mt-8 flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          Affichage de {{ (reviewsStore.currentPage - 1) * reviewsStore.itemsPerPage + 1 }} à 
          {{ Math.min(reviewsStore.currentPage * reviewsStore.itemsPerPage, reviewsStore.totalItems) }} 
          sur {{ reviewsStore.totalItems }} avis
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="changePage(reviewsStore.currentPage - 1)"
            :disabled="reviewsStore.currentPage <= 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          
          <div class="flex items-center space-x-1">
            <template v-for="page in getVisiblePages()" :key="page">
              <button
                v-if="page !== '...'"
                @click="changePage(page)"
                :class="{
                  'bg-blue-600 text-white': page === reviewsStore.currentPage,
                  'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700': page !== reviewsStore.currentPage
                }"
                class="px-3 py-2 text-sm font-medium border rounded-md"
              >
                {{ page }}
              </button>
              <span v-else class="px-2 py-2 text-sm text-gray-500">...</span>
            </template>
          </div>
          
          <button
            @click="changePage(reviewsStore.currentPage + 1)"
            :disabled="reviewsStore.currentPage >= reviewsStore.totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>

      <!-- Aucun avis -->
      <div
        v-if="!reviewsStore.isLoading && reviewsStore.reviews.length === 0"
        class="p-12 text-center border-2 border-dashed rounded-lg dark:border-gray-700"
      >
        <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Aucun avis trouvé
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ hasActiveFilters ? 'Ajustez vos filtres pour voir plus d\'avis' : 'Aucun avis client pour le moment' }}
        </p>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Effacer les filtres
        </button>
      </div>
    </div>

    <!-- Modal de réponse -->
    <Modal v-if="showResponseModal" @close="closeResponseModal">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Répondre à l'avis
        </h2>
      </template>
      
      <template #body>
        <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            <strong>{{ selectedReview?.user?.name }}</strong> a écrit :
          </p>
          <p class="text-sm text-gray-800 dark:text-gray-200 mt-1">
            "{{ selectedReview?.comment }}"
          </p>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Votre réponse
          </label>
          <textarea
            v-model="responseContent"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rédigez votre réponse..."
          ></textarea>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="closeResponseModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Annuler
          </button>

          <button
              @click="submitResponse"
            :disabled="!responseContent.trim() || responseLoading"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {{ responseLoading ? 'Envoi...' : 'Publier la réponse' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal de confirmation de suppression -->
    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Confirmer la suppression
          </h2>
        </div>
      </template>
      
      <template #body>
        <div class="mb-6">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
          </p>
          
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-3">
            <div class="flex">
              <svg class="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Attention
                </p>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  La suppression de cet avis supprimera également toutes les réponses associées.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="closeDeleteModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Annuler
          </button>

          <button
            @click="confirmDelete"
            :disabled="deleteLoading"
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ deleteLoading ? 'Suppression...' : 'Supprimer définitivement' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Notification de succès -->
    <div 
      v-if="showSuccessNotification"
      class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
      :class="{ 'translate-x-full opacity-0': !showSuccessNotification }"
    >
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {{ successMessage }}
      </div>
    </div>

    <!-- Notification d'erreur -->
    <div 
      v-if="showErrorNotification"
      class="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
      :class="{ 'translate-x-full opacity-0': !showErrorNotification }"
    >
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {{ errorMessage }}
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'lodash'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import { useReviewsStore } from '@/stores/reviews'
import Modal from '@/components/ui/Modal.vue'
import { useAuthStore } from '@/stores/auth.js'

const reviewsStore = useReviewsStore()
const authStore = useAuthStore()

const currentPageTitle = ref("Avis clients")

// États locaux
const filters = ref({
  rating: '',
  status: '',
  date: '',
  search: ''
})

const actionLoading = ref({})
const loadingDuration = ref({})
const isLoading = ref({})
const showResponseModal = ref(false)
const selectedReview = ref(null)
const responseContent = ref('')
const responseLoading = ref(false)

// États pour la modal de suppression
const showDeleteModal = ref(false)
const reviewToDelete = ref(null)
const deleteLoading = ref(false)

// États pour les notifications
const showSuccessNotification = ref(false)
const showErrorNotification = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Computed
const hasActiveFilters = computed(() => {
  return filters.value.rating || filters.value.status || filters.value.date || filters.value.search
})

// Méthodes utilitaires
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    approved: 'Approuvé',
    pending: 'En attente',
    rejected: 'Rejeté'
  }
  return statusMap[status] || status
}

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

// Méthodes de notification
const showSuccess = (message) => {
  successMessage.value = message
  showSuccessNotification.value = true
  setTimeout(() => {
    showSuccessNotification.value = false
  }, 3000)
}

const showError = (message) => {
  errorMessage.value = message
  showErrorNotification.value = true
  setTimeout(() => {
    showErrorNotification.value = false
  }, 3000)
}

// Actions
const loadReviews = async () => {
  try {
    await reviewsStore.fetchReviews(filters.value)
  } catch (error) {
    console.error('Erreur lors du chargement des avis:', error)
  }
}

const debouncedSearch = debounce(() => {
  loadReviews()
}, 300)

const approveReview = async (id) => {
  isLoading.value[id] = true
  const start = performance.now()

  try {
    await reviewsStore.approveReview(id)
    showSuccess('Avis approuvé avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error)
    showError('Erreur lors de l\'approbation')
  } finally {
    const duration = performance.now() - start
    loadingDuration.value[id] = Math.max(duration, 2000)
    setTimeout(() => {
      isLoading.value[id] = false
      delete loadingDuration.value[id]
    }, loadingDuration.value[id])
  }
}

const rejectReview = async (id) => {
  isLoading.value[id] = true
  const start = performance.now()

  try {
    await reviewsStore.rejectReview(id)
    showSuccess('Avis rejeté avec succès')
  } catch (error) {
    console.error('Erreur lors du rejet:', error)
    showError('Erreur lors du rejet')
  } finally {
    const duration = performance.now() - start
    loadingDuration.value[id] = Math.max(duration, 2000)
    setTimeout(() => {
      isLoading.value[id] = false
      delete loadingDuration.value[id]
    }, loadingDuration.value[id])
  }
}

// Gestion de la suppression avec modal
const openDeleteConfirmation = (reviewId) => {
  reviewToDelete.value = reviewId
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  reviewToDelete.value = null
}

const confirmDelete = async () => {
  if (!reviewToDelete.value) return

  deleteLoading.value = true
  const start = performance.now()
  const reviewId = reviewToDelete.value

  try {
    await reviewsStore.deleteReview(reviewId)
    showSuccess('Avis supprimé avec succès')
    closeDeleteModal()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    showError('Erreur lors de la suppression')
  } finally {
    deleteLoading.value = false
    const duration = performance.now() - start
    loadingDuration.value[reviewId] = Math.max(duration, 2000)
    isLoading.value[reviewId] = true
    setTimeout(() => {
      isLoading.value[reviewId] = false
      delete loadingDuration.value[reviewId]
    }, loadingDuration.value[reviewId])
  }
}

const exportReviews = async () => {
  try {
    await reviewsStore.exportReviews(filters.value)
    showSuccess('Export réalisé avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    showError('Erreur lors de l\'export')
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= reviewsStore.totalPages) {
    loadReviews({ ...filters.value, page })
  }
}

const getVisiblePages = () => {
  const current = reviewsStore.currentPage
  const total = reviewsStore.totalPages
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
}

const clearFilters = () => {
  filters.value = {
    rating: '',
    status: '',
    date: '',
    search: ''
  }
  loadReviews()
}

// Modal de réponse
const openResponseModal = (review) => {
  selectedReview.value = review
  responseContent.value = review.admin_response?.content || ''
  showResponseModal.value = true
}

const closeResponseModal = () => {
  showResponseModal.value = false
  selectedReview.value = null
  responseContent.value = ''
}

const submitResponse = async () => {
  if (!responseContent.value.trim() || !selectedReview.value) return

  responseLoading.value = true
  try {
    await reviewsStore.updateReview(selectedReview.value.id, {
      admin_response: {
        admin_id: authStore.user.id,
        content: responseContent.value.trim(),
        created_at: new Date().toISOString()
      }
    })
    showSuccess('Réponse publiée avec succès')
    closeResponseModal()
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la réponse:', error)
    showError('Erreur lors de l\'envoi de la réponse')
  } finally {
    responseLoading.value = false
  }
}

const openImageModal = (image) => {
  window.open(image.url, '_blank')
}

// Watchers
watch(filters, () => {
  if (filters.value.search) {
    debouncedSearch()
  } else {
    loadReviews()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.loader {
  height: 4px;
  width: 130px;
  --c: no-repeat linear-gradient(#490ef9 0 0);
  background: var(--c), var(--c), #ffffff;
  background-size: 60% 100%;
  background-position: -150% 0, -150% 0;
  animation-name: l16;
  animation-fill-mode: forwards;
}

@keyframes l16 {
  0%   { background-position: -150% 0, -150% 0 }
  66%  { background-position: 250% 0, -150% 0 }
  100% { background-position: 250% 0, 250% 0 }
}
</style>