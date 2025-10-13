<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-8 bg-white dark:bg-gray-900 min-h-screen">
      <!-- Messages de succès/erreur existants... -->

      <!-- Header avec statistiques améliorées -->
      <div class="mb-8">
        <div class="flex flex-col justify-between mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Collections</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Gérez l'ensemble des collections de votre marque avec analyses détaillées
            </p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
            <router-link
              to="/collections/create"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <PlusIcon class="w-5 h-5" />
              Nouvelle collection
            </router-link>
            <!-- Bouton export existant... -->
          </div>
        </div>

        <!-- Statistiques améliorées -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CubeIcon class="h-6 w-6 text-blue-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Total Collections
                    </dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ loadingStates.stats ? '...' : stats.total_collections }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <EyeIcon class="h-6 w-6 text-green-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Vues Total
                    </dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ loadingStates.stats ? '...' : stats.total_views }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <StarIcon class="h-6 w-6 text-yellow-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Note Moyenne
                    </dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ loadingStates.stats ? '...' : stats.average_rating }}/5
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ChatBubbleLeftRightIcon class="h-6 w-6 text-purple-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Avis
                    </dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ loadingStates.stats ? '...' : stats.total_reviews }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ShoppingBagIcon class="h-6 w-6 text-red-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Taux Conversion
                    </dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ loadingStates.stats ? '...' : stats.average_conversion_rate }}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <FireIcon class="h-6 w-6 text-orange-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Tendances
                    </dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ loadingStates.stats ? '...' : stats.trending_collections }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nouvelle section : Filtres avancés pour collections -->
      <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Filtres Collections</h3>
            <button
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {{ showAdvancedFilters ? 'Masquer' : 'Afficher' }} les filtres avancés
            </button>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <!-- Recherche -->
            <div class="md:col-span-2">
              <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recherche
              </label>
              <div class="relative">
                <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  v-model="filters.search"
                  @input="debouncedSearch"
                  placeholder="Nom, thème, référence..."
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                >
              </div>
            </div>

            <!-- Saison -->
            <div>
              <label for="season" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Saison
              </label>
              <select
                id="season"
                v-model="filters.season"
                @change="throttledFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Toutes saisons</option>
                <option value="printemps">Printemps</option>
                <option value="ete">Été</option>
                <option value="automne">Automne</option>
                <option value="hiver">Hiver</option>
              </select>
            </div>

            <!-- Année -->
            <div>
              <label for="year" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Année
              </label>
              <select
                id="year"
                v-model="filters.year"
                @change="throttledFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Toutes années</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>

            <!-- Statut -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <select
                id="status"
                v-model="filters.status"
                @change="throttledFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Tous statuts</option>
                <option value="is_active">Actif</option>
                <option value="is_not_active">Inactif</option>
                <option value="is_not_visible">Brouillon</option>
              </select>
            </div>

            <!-- Type de mise en avant -->
            <div>
              <label for="featured" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mise en avant
              </label>
              <select
                id="featured"
                v-model="filters.featured"
                @change="throttledFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Tous</option>
                <option value="featured">Vedettes</option>
                <option value="trending">Tendances</option>
              </select>
            </div>
          </div>

          <!-- Filtres avancés étendus -->
          <div v-if="showAdvancedFilters" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              <!-- Note minimum -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note min
                </label>
                <select
                  v-model="filters.min_rating"
                  @change="throttledFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Toutes notes</option>
                  <option value="1">1 étoile +</option>
                  <option value="2">2 étoiles +</option>
                  <option value="3">3 étoiles +</option>
                  <option value="4">4 étoiles +</option>
                  <option value="5">5 étoiles</option>
                </select>
              </div>

              <!-- Thème -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thème
                </label>
                <select
                  v-model="filters.theme"
                  @change="throttledFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Tous thèmes</option>
                  <option value="vintage">Vintage</option>
                  <option value="moderne">Moderne</option>
                  <option value="classique">Classique</option>
                  <option value="boheme">Bohème</option>
                  <option value="urbain">Urbain</option>
                </select>
              </div>

              <!-- Vues minimum -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vues min
                </label>
                <input
                  type="number"
                  v-model="filters.min_views"
                  @input="debouncedNumberFilter"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
              </div>

              <!-- Date de début -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Début après
                </label>
                <input
                  type="date"
                  v-model="filters.start_date_after"
                  @change="throttledFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
              </div>

              <!-- Date de fin -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fin avant
                </label>
                <input
                  type="date"
                  v-model="filters.end_date_before"
                  @change="throttledFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
              </div>

              <!-- Produits minimum -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Produits min
                </label>
                <input
                  type="number"
                  v-model="filters.min_products"
                  @input="debouncedNumberFilter"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ pagination.total }} collection(s) trouvée(s)
            </div>
            <button
              @click="resetFilters"
              class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      <!-- Tableau des collections amélioré -->
      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- En-tête du tableau -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Collections ({{ loadingStates.collections ? '...' : pagination.total }})
              </h3>
            </div>
            <div class="flex items-center space-x-3">
              <!-- Boutons d'action groupés -->
            </div>
          </div>
        </div>

        <!-- Tableau -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Collection
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Période
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Produits
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Performance
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Avis & Notes
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Statut
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <!-- Skeleton Loading -->
              <tr v-if="loadingStates?.collections" v-for="n in pagination.perPage" :key="`skeleton-${n}`" class="animate-pulse">
                <!-- Skeleton rows... -->
              </tr>

              <!-- Données réelles -->
              <tr v-else v-for="collection in collections" :key="collection.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <!-- Colonne Collection -->
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-16 w-16">
                      <img
                        :src="getFullImageUrl(collection.cover_image)"
                        :alt="collection.name"
                        class="h-16 w-16 rounded-lg object-cover"
                        @error="handleImageError"
                      >
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ collection.name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ collection.ref }}
                      </div>
                      <div class="flex items-center mt-1 space-x-2">
                        <span class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {{ collection.theme }}
                        </span>
                        <span v-if="collection.is_featured" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          ⭐ Vedette
                        </span>
                        <span v-if="collection.is_trending" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          🔥 Tendance
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Colonne Période -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ formatDate(collection.start_date) }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ collection.season }} {{ collection.year }}
                  </div>
                  <div v-if="collection.end_date" class="text-xs text-gray-400">
                    jusqu'au {{ formatDate(collection.end_date) }}
                  </div>
                </td>

                <!-- Colonne Produits -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ collection.products_count || 0 }} produits
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1 dark:bg-gray-700">
                    <div
                      class="h-2 rounded-full bg-blue-500"
                      :style="`width: ${Math.min(100, ((collection.products_count || 0) / collection.max_products_display) * 100)}%`"
                    ></div>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ collection.max_products_display }} max
                  </div>
                </td>

                <!-- Colonne Performance -->
                <td class="px-6 py-4">
                  <div class="space-y-1">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-500">Vues:</span>
                      <span class="font-medium">{{ collection.view_count }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-500">Clics:</span>
                      <span class="font-medium">{{ collection.click_count }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-500">Conversion:</span>
                      <span class="font-medium" :class="getConversionRateClass(collection.conversion_rate)">
                        {{ collection.conversion_rate }}%
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Colonne Avis & Notes -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <!-- Étoiles -->
                    <div class="flex">
                      <StarIcon
                        v-for="n in 5"
                        :key="n"
                        class="w-4 h-4"
                        :class="n <= Math.round(collection.average_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                      />
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ collection.average_rating }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ collection.reviews_count }} avis
                  </div>
                  <button
                    @click="viewCollectionReviews(collection)"
                    class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-1"
                  >
                    Voir les avis
                  </button>
                </td>

                <!-- Colonne Statut -->
                <td class="px-6 py-4">
                  <div class="space-y-2">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getCollectionStatusClass(collection)"
                    >
                      {{ getCollectionStatusLabel(collection) }}
                    </span>
                    <div class="text-xs text-gray-500">
                      {{ getCollectionDateStatus(collection) }}
                    </div>
                  </div>
                </td>

                <!-- Colonne Actions -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewCollection(collection)"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Voir les détails"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </button>
                    <router-link
                      :to="`/collections/${collection.id}/edit`"
                      class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Modifier"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </router-link>
                    <button
                      @click="manageCollectionProducts(collection)"
                      class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      title="Gérer les produits"
                    >
                      <ShoppingBagIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="viewCollectionAnalytics(collection)"
                      class="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                      title="Analytiques"
                    >
                      <ChartBarIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDeleteCollection(collection.id)"
                      class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Supprimer"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- État vide -->
        <div v-if="!loadingStates.collections && pagination.total === 0" class="text-center py-12">
          <CubeIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune collection trouvée</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ collections.length === 0 ? 'Commencez par créer votre première collection.' : 'Essayez de modifier vos critères de recherche.' }}
          </p>
          <div class="mt-6" v-if="collections.length === 0">
            <router-link
              to="/collections/create"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Créer une collection
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="!loadingStates.collections && pagination.total > 0"
        :current-page="pagination.currentPage"
        :total-items="pagination.total"
        :per-page="pagination.perPage"
        @page-changed="changePage"
        class="mt-6"
      />
    </div>

    <!-- Modal de détails de collection amélioré -->
    <Modal v-if="showDetailsModal" @close="closeDetailsModal" :width="`max-w-7xl`">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CubeIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ currentCollection?.name }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Détails et performances de la collection
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
              REF: {{ currentCollection?.ref }}
            </span>
            <button
              @click="closeDetailsModal"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </template>

      <template #body>
        <div v-if="loadingStates.details" class="flex justify-center py-12">
          <ArrowPathIcon class="w-8 h-8 animate-spin text-blue-600" />
        </div>

        <div v-else-if="currentCollection" class="space-y-6">
          <!-- En-tête avec image et métriques -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Image de couverture -->
            <div class="lg:col-span-1">
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div class="aspect-[4/3] rounded-lg overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
                  <img
                    :src="getFullImageUrl(currentCollection.cover_image)"
                    :alt="currentCollection.name"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <!-- Métriques principales -->
            <div class="lg:col-span-2">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ currentCollectionMetrics.total_products || 0 }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Produits</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ currentCollection.view_count }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Vues</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ currentCollection.conversion_rate }}%
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Conversion</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-center">
                    <StarIcon class="w-5 h-5 text-yellow-400 mr-1" />
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ currentCollection.average_rating }}
                    </div>
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ currentCollection.reviews_count }} avis</div>
                </div>
              </div>

              <!-- Actions rapides -->
              <div class="flex space-x-3 mt-6">
                <router-link
                  :to="`/collections/${currentCollection.id}/edit`"
                  class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <PencilIcon class="w-4 h-4 mr-2" />
                  Modifier
                </router-link>
                <button
                  @click="manageCollectionProducts(currentCollection)"
                  class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  <ShoppingBagIcon class="w-4 h-4 mr-2" />
                  Produits
                </button>
                <button
                  @click="viewCollectionAnalytics(currentCollection)"
                  class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  <ChartBarIcon class="w-4 h-4 mr-2" />
                  Analytics
                </button>
              </div>
            </div>
          </div>

          <!-- Détails de la collection -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Informations générales -->
            <div class="space-y-6">
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Informations générales
                  </h3>
                </div>
                <div class="p-6 space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Référence</label>
                      <p class="text-sm text-gray-900 dark:text-white font-mono">{{ currentCollection.ref }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Thème</label>
                      <p class="text-sm text-gray-900 dark:text-white capitalize">{{ currentCollection.theme }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Saison</label>
                      <p class="text-sm text-gray-900 dark:text-white capitalize">{{ currentCollection.season }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Année</label>
                      <p class="text-sm text-gray-900 dark:text-white">{{ currentCollection.year }}</p>
                    </div>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                    <p class="text-sm text-gray-900 dark:text-white mt-1" v-if="currentCollection.description">
                      {{ currentCollection.description }}
                    </p>
                    <p v-else class="text-sm text-gray-500 italic">Aucune description</p>
                  </div>
                </div>
              </div>

              <!-- Configuration d'affichage -->
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Configuration
                  </h3>
                </div>
                <div class="p-6 space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Type de mise en page</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">{{ currentCollection.layout_type }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Afficher les prix</span>
                    <span class="text-sm font-medium" :class="currentCollection.show_prices ? 'text-green-600' : 'text-red-600'">
                      {{ currentCollection.show_prices ? 'Oui' : 'Non' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Produits maximum</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ currentCollection.max_products_display }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Période et statut -->
            <div class="space-y-6">
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Période et statut
                  </h3>
                </div>
                <div class="p-6 space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de début</label>
                      <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(currentCollection.start_date) }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de fin</label>
                      <p class="text-sm text-gray-900 dark:text-white">
                        {{ currentCollection.end_date ? formatDate(currentCollection.end_date) : 'Non définie' }}
                      </p>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</span>
                      <span :class="getCollectionStatusClass(currentCollection)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ getCollectionStatusLabel(currentCollection) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Visibilité</span>
                      <span :class="currentCollection.is_visible ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                        {{ currentCollection.is_visible ? 'Visible' : 'Masquée' }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Mise en avant</span>
                      <div class="flex space-x-2">
                        <span v-if="currentCollection.is_featured" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Vedette
                        </span>
                        <span v-if="currentCollection.is_trending" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Tendance
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Derniers avis -->
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      Derniers avis
                    </h3>
                    <button
                      @click="viewCollectionReviews(currentCollection)"
                      class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Voir tout
                    </button>
                  </div>
                </div>
                <div class="p-6">
                  <div v-if="currentCollection.recent_reviews && currentCollection.recent_reviews.length > 0" class="space-y-4">
                    <div
                      v-for="review in currentCollection.recent_reviews.slice(0, 3)"
                      :key="review.id"
                      class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex items-center space-x-2">
                          <div class="flex">
                            <StarIcon
                              v-for="n in 5"
                              :key="n"
                              class="w-4 h-4"
                              :class="n <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                            />
                          </div>
                          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ review.rating }}/5</span>
                        </div>
                        <span class="text-xs text-gray-500">{{ formatDate(review.created_at) }}</span>
                      </div>
                      <p class="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                        {{ review.title }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">Par {{ review.user_name }}</p>
                    </div>
                  </div>
                  <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
                    <ChatBubbleLeftRightIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p class="text-sm">Aucun avis pour le moment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Modal des reviews de collection -->
    <Modal v-if="showReviewsModal" @close="closeReviewsModal" :width="`max-w-4xl`">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ChatBubbleLeftRightIcon class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Avis - {{ currentCollection?.name }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gestion des avis et modération
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #body>
        <div class="space-y-6">
          <!-- En-tête des reviews -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-6">
                <div class="text-center">
                  <div class="text-3xl font-bold text-gray-900 dark:text-white">
                    {{ currentCollection?.average_rating }}
                  </div>
                  <div class="flex justify-center mt-1">
                    <StarIcon
                      v-for="n in 5"
                      :key="n"
                      class="w-5 h-5"
                      :class="n <= Math.round(currentCollection?.average_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                    />
                  </div>
                  <div class="text-sm text-gray-500 mt-1">
                    {{ currentCollection?.reviews_count }} avis
                  </div>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="n in 5"
                    :key="n"
                    class="flex items-center space-x-2"
                  >
                    <span class="text-sm text-gray-500 w-4">{{ 6 - n }} étoiles</span>
                    <div class="w-32 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        class="h-2 rounded-full bg-yellow-400"
                        :style="`width: ${getRatingPercentage(6 - n)}%`"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-500 w-8">{{ getRatingCount(6 - n) }}</span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="text-right">
                    <div class="font-medium text-gray-500">Cohérence</div>
                    <div class="font-bold text-gray-900 dark:text-white">
                      {{ collectionReviewsStats.cohesion_rating || '0.0' }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-gray-500">Variété</div>
                    <div class="font-bold text-gray-900 dark:text-white">
                      {{ collectionReviewsStats.variety_rating || '0.0' }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-gray-500">Tendance</div>
                    <div class="font-bold text-gray-900 dark:text-white">
                      {{ collectionReviewsStats.trend_rating || '0.0' }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-gray-500">Valeur</div>
                    <div class="font-bold text-gray-900 dark:text-white">
                      {{ collectionReviewsStats.value_rating || '0.0' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Liste des reviews -->
          <div class="space-y-4">
            <div
              v-for="review in collectionReviews"
              :key="review.id"
              class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <div class="flex">
                      <StarIcon
                        v-for="n in 5"
                        :key="n"
                        class="w-5 h-5"
                        :class="n <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                      />
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ review.title }}
                    </h3>
                    <span
                      v-if="review.is_featured"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    >
                      Mis en avant
                    </span>
                    <span
                      v-if="!review.is_approved"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    >
                      En attente
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    Par {{ review.user_name }} • {{ formatDate(review.created_at) }}
                  </p>
                  <p class="text-gray-700 dark:text-gray-300 mt-3">
                    {{ review.comment }}
                  </p>

                  <!-- Points positifs/négatifs -->
                  <div v-if="review.pros || review.cons" class="grid grid-cols-2 gap-4 mt-4">
                    <div v-if="review.pros">
                      <h4 class="text-sm font-medium text-green-600 dark:text-green-400">Points positifs</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ review.pros }}</p>
                    </div>
                    <div v-if="review.cons">
                      <h4 class="text-sm font-medium text-red-600 dark:text-red-400">Points à améliorer</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ review.cons }}</p>
                    </div>
                  </div>

                  <!-- Notes détaillées -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span class="text-gray-500">Cohérence:</span>
                      <span class="ml-2 font-medium">{{ review.cohesion_rating }}/5</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Variété:</span>
                      <span class="ml-2 font-medium">{{ review.variety_rating }}/5</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Tendance:</span>
                      <span class="ml-2 font-medium">{{ review.trend_rating }}/5</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Valeur:</span>
                      <span class="ml-2 font-medium">{{ review.value_rating }}/5</span>
                    </div>
                  </div>
                </div>
                <div class="ml-4 flex space-x-2">
                  <button
                    @click="toggleReviewApproval(review)"
                    :class="review.is_approved ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'"
                    class="p-1 rounded"
                  >
                    <CheckCircleIcon class="w-5 h-5" />
                  </button>
                  <button
                    @click="toggleReviewFeatured(review)"
                    :class="review.is_featured ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-600 hover:text-gray-800'"
                    class="p-1 rounded"
                  >
                    <StarIcon class="w-5 h-5" />
                  </button>
                  <button
                    @click="deleteReview(review.id)"
                    class="p-1 text-red-600 hover:text-red-800 rounded"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="collectionReviews.length === 0" class="text-center py-8">
              <ChatBubbleLeftRightIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">Aucun avis pour cette collection</p>
            </div>
          </div>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce, throttle } from 'lodash'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import Modal from '@/components/ui/Modal.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Pagination from '@/components/ui/Pagination.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  PhotoIcon,
  StarIcon,
  FireIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import api from '@/api/axiosConfig'

const route = useRoute()
const router = useRouter()
const currentPageTitle = ref("Gestion des Collections")

// États
const loadingStates = ref({
  collections: true,
  stats: true,
  search: false,
  filtering: false,
  details: false,
  reviews: false
})

// Données
const collections = ref([])
const stats = ref({
  total: 0,
  total_views: 0,
  average_rating: 0,
  total_reviews: 0,
  conversion_rate: 0,
  trending_count: 0
})

const currentCollection = ref(null)
const currentCollectionMetrics = ref(null)
const collectionReviews = ref([])
const collectionReviewsStats = ref({})

// Filtres
const filters = ref({
  search: '',
  season: '',
  year: '',
  status: '', // Correction: utiliser un seul champ pour le statut
  featured: '', // Correction: utiliser un seul champ pour la mise en avant
  min_rating: '',
  theme: '',
  min_views: '',
  start_date_after: '',
  end_date_before: '',
  min_products: ''
})

const buildQueryParams = () => {
  const params = {
    page: pagination.value.currentPage,
    per_page: pagination.value.perPage
  }

  // Ajouter seulement les filtres non vides
  Object.keys(filters.value).forEach(key => {
    if (filters.value[key] !== '' && filters.value[key] !== null && filters.value[key] !== undefined) {
      params[key] = filters.value[key]
    }
  })

  return params
}

const showAdvancedFilters = ref(false)
const showDetailsModal = ref(false)
const showReviewsModal = ref(false)

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 25,
  total: 0,
  lastPage: 1
})

// Années pour le filtre
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - i)
})

// Méthodes utilitaires
const formatDate = (dateString) => {
  if (!dateString) return 'Non définie'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getFullImageUrl = (path) => {
  if (!path) return 'https://placehold.co/80?text=collection+bylin'
  return `https://stagging.bylin-style.com${path}`
}

const getCollectionStatusClass = (collection) => {
  if (!collection.is_active) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const now = new Date()
  const startDate = new Date(collection.start_date)
  const endDate = collection.end_date ? new Date(collection.end_date) : null

  if (now < startDate) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }

  if (endDate && now > endDate) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
}

const getCollectionStatusLabel = (collection) => {
  if (!collection.is_active) {
    return 'Inactive'
  }

  const now = new Date()
  const startDate = new Date(collection.start_date)
  const endDate = collection.end_date ? new Date(collection.end_date) : null

  if (now < startDate) {
    return 'À venir'
  }

  if (endDate && now > endDate) {
    return 'Terminée'
  }

  return 'Active'
}

const getCollectionDateStatus = (collection) => {
  const now = new Date()
  const startDate = new Date(collection.start_date)

  if (now < startDate) {
    const diffTime = startDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `Début dans ${diffDays} jour(s)`
  }

  if (collection.end_date) {
    const endDate = new Date(collection.end_date)
    if (now > endDate) {
      return 'Collection terminée'
    }
    const diffTime = endDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `Finit dans ${diffDays} jour(s)`
  }

  return 'Sans date de fin'
}

const getConversionRateClass = (rate) => {
  if (rate >= 10) return 'text-green-600 dark:text-green-400'
  if (rate >= 5) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getRatingPercentage = (rating) => {
  if (!currentCollection.value?.rating_breakdown) return 0
  const total = currentCollection.value.reviews_count
  const count = currentCollection.value.rating_breakdown[rating] || 0
  return total > 0 ? (count / total) * 100 : 0
}

const getRatingCount = (rating) => {
  if (!currentCollection.value?.rating_breakdown) return 0
  return currentCollection.value.rating_breakdown[rating] || 0
}

// Actions
const fetchCollections = async () => {
  try {
    loadingStates.value.collections = true

    const params = buildQueryParams()

    const response = await api.get('/collections', { params })

    console.log('Collections response:', response)

    if (response.success) {
      collections.value = response.data || []

      if (response.meta) {
        pagination.value = {
          currentPage: response.meta.current_page || 1,
          perPage: response.meta.per_page || pagination.value.perPage,
          total: response.meta.total || 0,
          lastPage: response.meta.last_page || 1
        }
      }
    } else {
      console.error('Erreur API:', response.message)
      collections.value = []
    }

    // Charger les stats si première page
    if (pagination.value.currentPage === 1) {
      await fetchStats()
    }


  } catch (error) {
    console.error('Erreur lors du chargement des collections:', error)
    collections.value = []
  } finally {
    loadingStates.value.collections = false
  }
}

// Méthode fetchStats modifiée
const fetchStats = async () => {
  try {
    loadingStates.value.stats = true
    const response = await api.get('/collections/stats')
    console.log('Stats response:', response)
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des stats:', error)
  } finally {
    loadingStates.value.stats = false
  }
}

const viewCollection = async (collection) => {
  try {
    loadingStates.value.details = true
    currentCollection.value = null
    currentCollectionMetrics.value = null
    showDetailsModal.value = true

    const response = await api.get(`/collections/${collection.id}`)
    console.log('Votre collection: ', response)
    currentCollection.value = response.data
    currentCollectionMetrics.value = response.metrics

  } catch (error) {
    console.error('Erreur lors du chargement des détails:', error)
  } finally {
    loadingStates.value.details = false
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  currentCollection.value = null
}

const viewCollectionReviews = async (collection) => {
  try {
    loadingStates.value.reviews = true
    currentCollection.value = collection
    showReviewsModal.value = true

    const response = await api.get(`/collections/${collection.id}/reviews`)
    collectionReviews.value = response.reviews || []
    collectionReviewsStats.value = response.stats || {}

  } catch (error) {
    console.error('Erreur lors du chargement des avis:', error)
  } finally {
    loadingStates.value.reviews = false
  }
}

const closeReviewsModal = () => {
  showReviewsModal.value = false
  collectionReviews.value = []
}

const manageCollectionProducts = (collection) => {
  router.push(`/collections/${collection.id}/products`)
}

const viewCollectionAnalytics = (collection) => {
  router.push(`/collections/${collection.id}/analytics`)
}

const toggleReviewApproval = async (review) => {
  try {
    const response = await api.patch(`/collection-reviews/${review.id}`, {
      is_approved: !review.is_approved
    })

    // Mettre à jour localement
    review.is_approved = !review.is_approved
  } catch (error) {
    console.error('Erreur lors de la modification:', error)
  }
}

const toggleReviewFeatured = async (review) => {
  try {
    const response = await api.patch(`/collection-reviews/${review.id}`, {
      is_featured: !review.is_featured
    })

    // Mettre à jour localement
    review.is_featured = !review.is_featured
  } catch (error) {
    console.error('Erreur lors de la modification:', error)
  }
}

const deleteReview = async (reviewId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return

  try {
    await api.delete(`/collection-reviews/${reviewId}`)
    collectionReviews.value = collectionReviews.value.filter(r => r.id !== reviewId)
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

const confirmDeleteCollection = (collectionId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette collection ?')) {
    // Implémenter la suppression
  }
}

// Filtres avec debounce
const debouncedSearch = debounce(() => {
  pagination.value.currentPage = 1
  fetchCollections()
}, 500)

const throttledFilter = throttle(() => {
  pagination.value.currentPage = 1
  fetchCollections()
}, 300)

const debouncedNumberFilter = debounce(() => {
  pagination.value.currentPage = 1
  fetchCollections()
}, 800)

const resetFilters = () => {
  filters.value = {
    search: '',
    season: '',
    year: '',
    status: '',
    featured: '',
    min_rating: '',
    theme: '',
    min_views: '',
    start_date_after: '',
    end_date_before: '',
    min_products: ''
  }
  pagination.value.currentPage = 1
  fetchCollections()
}

const changePage = (page) => {
  pagination.value.currentPage = page
  fetchCollections()
}

// Initialisation
onMounted(() => {
  fetchCollections()
})

// Watchers
watch([() => filters.value.search, () => filters.value.season, () => filters.value.year], () => {
  pagination.value.currentPage = 1
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
