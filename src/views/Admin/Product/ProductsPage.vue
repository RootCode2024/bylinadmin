<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-8 bg-white dark:bg-gray-900 min-h-screen">
      <!-- Messages de succès/erreur -->
      <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center">
          <CheckCircleIcon class="w-5 h-5 text-green-400 mr-3" />
          <p class="text-sm text-green-700">{{ successMessage }}</p>
          <button @click="successMessage = null" class="ml-auto text-green-400 hover:text-green-600">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <ExclamationTriangleIcon class="w-5 h-5 text-red-400 mr-3" />
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
          <button @click="errorMessage = null" class="ml-auto text-red-400 hover:text-red-600">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Header avec statistiques -->
      <div class="mb-8">
        <div class="flex flex-col justify-between mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Produits</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Gérez l'ensemble des produits de votre catalogue
            </p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
            <router-link
              to="/add-product"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <PlusIcon class="w-5 h-5" />
              Nouveau Produit
            </router-link>
            <div class="relative">
              <button
                @click="showExportMenu = !showExportMenu"
                :disabled="loadingStates.export"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon v-if="loadingStates.export" class="w-5 h-5 animate-spin" />
                <ArrowDownTrayIcon v-else class="w-5 h-5" />
                Exporter
                <ChevronDownIcon class="w-4 h-4" />
              </button>
              <div
                v-if="showExportMenu"
                class="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
              >
                <div class="py-1">
                  <button
                    @click="debouncedExport('excel')"
                    :disabled="loadingStates.export"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <DocumentArrowDownIcon class="w-4 h-4 mr-3" />
                    Excel (.xlsx)
                  </button>
                  <button
                    @click="debouncedExport('csv')"
                    :disabled="loadingStates.export"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <DocumentTextIcon class="w-4 h-4 mr-3" />
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques rapides avec skeleton loading -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="(stat, index) in statsDisplay" :key="index" class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <component :is="stat.icon" :class="stat.iconClass" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      {{ stat.title }}
                    </dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">
                      <div v-if="loadingStates.stats" class="animate-pulse">
                        <div class="h-6 bg-gray-200 rounded dark:bg-gray-700 w-16"></div>
                      </div>
                      <div v-else>{{ stat.value }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Filtres</h3>
            <button
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {{ showAdvancedFilters ? 'Masquer' : 'Afficher' }} les filtres avancés
            </button>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
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
                  placeholder="Nom, référence, SKU..."
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                >
                <div v-if="loadingStates.search" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <ArrowPathIcon class="w-4 h-4 animate-spin text-blue-500" />
                </div>
              </div>
            </div>

            <!-- Autres filtres avec loading -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie
              </label>
              <select
                id="category"
                v-model="filters.category"
                @change="throttledFilter"
                :disabled="loadingStates.categories"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              >
                <option value="">
                  {{ loadingStates.categories ? 'Chargement...' : 'Toutes les catégories' }}
                </option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div>
              <label for="brand" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Marque
              </label>
              <select
                id="brand"
                v-model="filters.brand"
                @change="throttledFilter"
                :disabled="loadingStates.brands"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              >
                <option value="">
                  {{ loadingStates.brands ? 'Chargement...' : 'Toutes les marques' }}
                </option>
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>

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
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>

          <!-- Filtres avancés -->
          <div v-if="showAdvancedFilters" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock
                </label>
                <select
                  v-model="filters.stock"
                  @change="throttledFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Tous</option>
                  <option value="in_stock">En stock</option>
                  <option value="low_stock">Stock faible</option>
                  <option value="out_of_stock">Rupture</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  v-model="filters.type"
                  @change="throttledFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Tous les types</option>
                  <option value="new">Neuf</option>
                  <option value="vintage">Vintage</option>
                  <option value="byl_in_clothing">Bylin</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix minimum
                </label>
                <input
                  type="number"
                  v-model="filters.priceMin"
                  @input="debouncedPriceFilter"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix maximum
                </label>
                <input
                  type="number"
                  v-model="filters.priceMax"
                  @input="debouncedPriceFilter"
                  placeholder="∞"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500 dark:text-gray-400">
              <div v-if="loadingStates.filtering" class="flex items-center">
                <ArrowPathIcon class="w-4 h-4 animate-spin mr-2" />
                Filtrage en cours...
              </div>
              <div v-else>
                {{ pagination.total }} produit(s) trouvé(s)
                <span v-if="filters.search || filters.category || filters.brand">(filtrés)</span>
              </div>
            </div>
            <button
              @click="resetFilters"
              :disabled="loadingStates.filtering"
              class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      <!-- Tableau des produits avec skeleton loading -->
      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- En-tête du tableau -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Produits ({{ loadingStates.products ? '...' : pagination.total }})
              </h3>
              <div v-if="selectedProducts.length > 0" class="flex items-center space-x-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ selectedProducts.length }} sélectionné(s)
                </span>
                <button
                  @click="bulkDelete"
                  :disabled="loadingStates.delete"
                  class="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                >
                  <ArrowPathIcon v-if="loadingStates.delete" class="w-4 h-4 animate-spin inline mr-1" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tableau avec chargement optimisé -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    @change="toggleSelectAll"
                    :checked="isAllSelected"
                    :disabled="loadingStates.products"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  >
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  <button @click="sortBy('name')" class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100">
                    <span>Produit</span>
                    <ChevronUpDownIcon class="w-4 h-4" />
                  </button>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Variantes
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  <button @click="sortBy('price')" class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100">
                    <span>Prix</span>
                    <ChevronUpDownIcon class="w-4 h-4" />
                  </button>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Stock Total
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
              <tr v-if="loadingStates.products" v-for="n in pagination.perPage" :key="`skeleton-${n}`" class="animate-pulse">
                <td class="px-6 py-4">
                  <div class="w-4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
                    <div class="ml-4 space-y-2">
                      <div class="h-4 bg-gray-200 rounded w-32 dark:bg-gray-700"></div>
                      <div class="h-3 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 bg-gray-200 rounded w-20 dark:bg-gray-700"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-6 bg-gray-200 rounded-full w-16 dark:bg-gray-700"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-end space-x-2">
                    <div class="w-4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div class="w-4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div class="w-4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                  </div>
                </td>
              </tr>

              <!-- Données réelles -->
              <tr v-else v-for="product in products" :key="product.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4">
                  <input
                    type="checkbox"
                    :value="product.id"
                    v-model="selectedProducts"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      <img
                        v-if="product.main_image_url"
                        :src="product.main_image_url"
                        :alt="product.name"
                        class="h-12 w-12 rounded-lg object-contain"
                        @error="handleImageError"
                      >
                      <div v-else class="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center text-center">
                        <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ product.name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ product.sku || 'SKU non défini' }}
                      </div>
                      <div class="flex items-center mt-1 space-x-2">
                        <span v-if="product.is_featured" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          ⭐ Vedette
                        </span>
                        <span v-if="product.is_trending" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          🔥 Tendance
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ product.variants?.length || 0 }} variante(s)
                  </div>
                  <div v-if="product.variants?.length > 0" class="flex flex-wrap gap-1 mt-1">
                    <div
                      v-for="variant in product.variants.slice(0, 3)"
                      :key="variant.id"
                      class="flex items-center space-x-1"
                    >
                      <div
                        class="w-3 h-3 rounded-full border border-gray-300"
                        :style="{ backgroundColor: variant.color?.hex_code || '#gray' }"
                      ></div>
                      <span class="text-xs text-gray-500">{{ variant.size?.name }}</span>
                    </div>
                    <span v-if="product.variants.length > 3" class="text-xs text-gray-400">
                      +{{ product.variants.length - 3 }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatPrice(product.final_price) }}
                  </div>
                  <div v-if="product.discounted_price" class="text-sm text-gray-500 line-through">
                    {{ formatPrice(product.price) }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div
                        class="w-2 h-2 rounded-full mr-2"
                        :class="getStockStatusColor(getTotalStock(product))"
                      ></div>
                    </div>
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ getTotalStock(product) }} unités
                    </div>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1 dark:bg-gray-700">
                    <div
                      class="h-1.5 rounded-full"
                      :class="getStockStatusColor(getTotalStock(product))"
                      :style="`width: ${getStockPercentage(getTotalStock(product))}%`"
                    ></div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusBadgeClass(product)"
                  >
                    {{ getStatusLabel(product) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewProduct(product)"
                      :disabled="loadingStates.details"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                      title="Voir les détails"
                    >
                      <ArrowPathIcon v-if="loadingStates.details && currentProductId === product.id" class="w-4 h-4 animate-spin" />
                      <EyeIcon v-else class="w-4 h-4" />
                    </button>
                    <router-link
                      :to="`/products/${product.id}/edit`"
                      class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Modifier"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </router-link>
                    <button
                      @click="duplicateProduct(product)"
                      :disabled="loadingStates.duplicate"
                      class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                      title="Dupliquer"
                    >
                      <DocumentDuplicateIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDeleteProduct(product.id)"
                      :disabled="loadingStates.delete"
                      class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
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
        <div v-if="!loadingStates.products && pagination.total === 0" class="text-center py-12">
          <CubeIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun produit trouvé</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ products.length === 0 ? 'Commencez par créer votre premier produit.' : 'Essayez de modifier vos critères de recherche.' }}
          </p>
          <div class="mt-6" v-if="products.length === 0">
            <router-link
              to="/products/add"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Créer un produit
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pagination avec loading -->
      <Pagination
        v-if="!loading && pagination.total > 0"
        :current-page="pagination.currentPage"
        :total-items="pagination.total"
        :per-page="pagination.perPage"
        @page-changed="changePage"
        class="mt-6"
      />
    </div>

    <!-- Modal de confirmation de suppression -->
    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>
        <div class="flex items-center">
          <div class="flex-shrink-0 h-8 w-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
            <ExclamationTriangleIcon class="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Confirmer la suppression
          </h2>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer {{ selectedProducts.length > 1 ? 'ces produits' : 'ce produit' }} ?
            Cette action est irréversible et supprimera également toutes les variantes associées.
          </p>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex">
              <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <div class="ml-3">
                <p class="text-sm text-yellow-700 dark:text-yellow-200">
                  <strong>Attention :</strong> Cette action supprimera définitivement {{ selectedProducts.length > 1 ? `${selectedProducts.length} produits` : 'le produit' }} et toutes leurs données associées.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="closeDeleteModal"
              :disabled="loadingStates.delete"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              @click="deleteProduct"
              :disabled="loadingStates.delete"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon v-if="loadingStates.delete" class="w-4 h-4 mr-2 animate-spin" />
              Supprimer définitivement
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Modal de détails du produit amélioré -->
    <Modal v-if="showDetailsModal" @close="closeDetailsModal" :width="`max-w-7xl`">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CubeIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Détails du produit
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Informations complètes et statistiques
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
              ID: {{ currentProduct?.id }}
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
        <!-- Loading State -->
        <div v-if="loadingStates.details" class="flex justify-center py-12">
          <div class="text-center">
            <ArrowPathIcon class="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p class="text-sm text-gray-500">Chargement des détails...</p>
          </div>
        </div>

        <!-- Contenu principal -->
        <div v-else-if="currentProduct" class="space-y-8">
          <!-- En-tête avec image et infos principales -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Image et statuts -->
            <div class="lg:col-span-1 space-y-4">
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div class="aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
                  <img
                    v-if="currentProduct.main_image_url"
                    :src="currentProduct.main_image_url"
                    :alt="currentProduct.name"
                    class="w-full h-full object-contain p-4"
                  />
                  <div v-else class="text-center p-8">
                    <PhotoIcon class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <span class="text-gray-400 text-sm">Aucune image</span>
                  </div>
                </div>
              </div>

              <!-- Badges de statut -->
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    :class="getStatusBadgeClass(currentProduct)"
                  >
                    <CheckCircleIcon class="w-3 h-3 mr-1" />
                    {{ getStatusLabel(currentProduct) }}
                  </span>
                  <span v-if="currentProduct.is_featured" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <StarIcon class="w-3 h-3 mr-1" />
                    Vedette
                  </span>
                  <span v-if="currentProduct.is_trending" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <FireIcon class="w-3 h-3 mr-1" />
                    Tendance
                  </span>
                  <span v-if="currentProduct.is_flash_sale" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <BoltIcon class="w-3 h-3 mr-1" />
                    Flash Sale
                  </span>
                </div>
              </div>

              <!-- Actions rapides -->
              <div class="flex space-x-2">
                <router-link
                  :to="`/products/${currentProduct.id}/edit`"
                  class="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PencilIcon class="w-4 h-4 mr-2" />
                  Modifier
                </router-link>
                <button
                  @click="duplicateProduct(currentProduct)"
                  class="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <DocumentDuplicateIcon class="w-4 h-4 mr-2" />
                  Dupliquer
                </button>
              </div>
            </div>

            <!-- Informations principales -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Titre et prix -->
              <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ currentProduct.name }}
                </h1>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                  {{ currentProduct.short_description }}
                </p>

                <div class="flex items-center space-x-4">
                  <div class="text-3xl font-bold text-gray-900 dark:text-white">
                    {{ formatPrice(currentProduct.final_price) }}
                  </div>
                  <div v-if="currentProduct.discounted_price" class="flex items-center space-x-2">
                    <span class="text-xl text-gray-500 line-through">
                      {{ formatPrice(currentProduct.price) }}
                    </span>
                    <span class="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm font-medium rounded">
                      -{{ currentProduct.discounted_percent }}%
                    </span>
                  </div>
                </div>
              </div>

              <!-- Métriques du produit -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-center">
                    <EyeIcon class="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Vues</p>
                      <p class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ currentProductMetrics?.viewCount || currentProduct.view_count || 0 }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-center">
                    <ShoppingBagIcon class="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Ventes</p>
                      <p class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ currentProductMetrics?.purchaseCount || 0 }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-center">
                    <StarIcon class="w-5 h-5 text-yellow-500 mr-3" />
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</p>
                      <p class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ currentProductMetrics?.averageRating || currentProduct.averageRating || '0.0' }}/5
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-center">
                    <ChatBubbleLeftRightIcon class="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avis</p>
                      <p class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ currentProductMetrics?.reviewCount || currentProduct.reviewCount || 0 }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Informations détaillées en grille -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      <p class="text-sm text-gray-900 dark:text-white font-mono">{{ currentProduct.reference }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</label>
                      <p class="text-sm text-gray-900 dark:text-white font-mono">{{ currentProduct.sku }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                      <p class="text-sm text-gray-900 dark:text-white capitalize">{{ currentProduct.type }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Genre</label>
                      <p class="text-sm text-gray-900 dark:text-white capitalize">{{ getGenderLabel(currentProduct.gender) }}</p>
                    </div>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Catégorie</label>
                    <p class="text-sm text-gray-900 dark:text-white">{{ currentProduct.category?.name || getCategoryName(currentProduct.category_id) }}</p>
                  </div>

                  <div v-if="currentProduct.brand">
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Marque</label>
                    <p class="text-sm text-gray-900 dark:text-white">{{ currentProduct.brand.name }}</p>
                  </div>
                </div>
              </div>

              <!-- Prix et coûts -->
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Prix et coûts
                  </h3>
                </div>
                <div class="p-6 space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Prix de vente</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatPrice(currentProduct.price) }}</span>
                  </div>
                  <div v-if="currentProduct.discounted_price" class="flex justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Prix promo</span>
                    <span class="text-sm font-medium text-green-600 dark:text-green-400">{{ formatPrice(currentProduct.discounted_price) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Coût d'achat</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatPrice(currentProduct.cost_price) }}</span>
                  </div>
                  <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Marge</span>
                    <span class="text-sm font-medium" :class="getMarginClass(currentProduct)">
                      {{ calculateMargin(currentProduct) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stock et variantes -->
            <div class="space-y-6">
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Stock et variantes
                  </h3>
                </div>
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Stock total</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-2 h-2 rounded-full" :class="getStockStatusColor(getTotalStock(currentProduct))"></div>
                      <span class="text-lg font-bold text-gray-900 dark:text-white">{{ getTotalStock(currentProduct) }} unités</span>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-500 dark:text-gray-400">Variantes disponibles</span>
                      <span class="font-medium text-gray-900 dark:text-white">{{ currentProduct.variants?.length || 0 }}</span>
                    </div>

                    <div v-if="currentProduct.variants?.length > 0" class="max-h-60 overflow-y-auto">
                      <div class="space-y-2">
                        <div
                          v-for="variant in currentProduct.variants"
                          :key="variant.id"
                          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div class="flex items-center space-x-3">
                            <div
                              class="w-4 h-4 rounded-full border border-gray-300"
                              :style="{ backgroundColor: variant.color?.hex_code || '#9CA3AF' }"
                              :title="variant.color?.name || 'Couleur non définie'"
                            ></div>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">
                              {{ variant.color?.name || 'N/A' }} - {{ variant.size?.name || 'N/A' }}
                            </span>
                            <span class="text-xs text-gray-500 font-mono">{{ variant.barcode }}</span>
                          </div>
                          <div class="flex items-center space-x-3">
                            <span class="text-sm font-medium" :class="getVariantStockClass(variant.stock_quantity)">
                              {{ variant.stock_quantity }} unités
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
                      <CubeIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p class="text-sm">Aucune variante configurée</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Caractéristiques techniques -->
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Caractéristiques
                  </h3>
                </div>
                <div class="p-6 space-y-3">
                  <div v-if="currentProduct.material">
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Matériau</label>
                    <p class="text-sm text-gray-900 dark:text-white">{{ currentProduct.material }}</p>
                  </div>

                  <div v-if="currentProduct.weight_grams">
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Poids</label>
                    <p class="text-sm text-gray-900 dark:text-white">{{ currentProduct.weight_grams }}g</p>
                  </div>

                  <div v-if="currentProduct.dimensions">
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</label>
                    <p class="text-sm text-gray-900 dark:text-white">
                      {{ currentProduct.dimensions.width }} × {{ currentProduct.dimensions.height }} × {{ currentProduct.dimensions.depth || currentProduct.dimensions.length }} cm
                    </p>
                  </div>

                  <div v-if="currentProduct.country_of_origin">
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Origine</label>
                    <p class="text-sm text-gray-900 dark:text-white">{{ currentProduct.country_of_origin }}</p>
                  </div>

                  <div v-if="currentProduct.season">
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Saison</label>
                    <p class="text-sm text-gray-900 dark:text-white capitalize">{{ currentProduct.season.replace('_', ' ') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Description et instructions -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Description complète -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Description complète
                </h3>
              </div>
              <div class="p-6">
                <p v-if="currentProduct.full_description" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {{ currentProduct.full_description }}
                </p>
                <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
                  Aucune description détaillée fournie
                </p>
              </div>
            </div>

            <!-- Instructions d'entretien -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Entretien et soins
                </h3>
              </div>
              <div class="p-6">
                <p v-if="currentProduct.care_instructions" class="text-sm text-gray-700 dark:text-gray-300">
                  {{ currentProduct.care_instructions }}
                </p>
                <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
                  Aucune instruction d'entretien fournie
                </p>
              </div>
            </div>
          </div>

          <!-- Informations temporelles -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Dates importantes
              </h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Création</label>
                  <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(currentProduct.created_at) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière modification</label>
                  <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(currentProduct.updated_at) }}</p>
                </div>
                <div v-if="currentProduct.release_date">
                  <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de sortie</label>
                  <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(currentProduct.release_date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- État d'erreur -->
        <div v-else class="text-center py-12">
          <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">Erreur de chargement</h3>
          <p class="mt-1 text-gray-500 dark:text-gray-400">Impossible de charger les détails du produit.</p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button
            @click="closeDetailsModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
          <router-link
            :to="`/products/${currentProduct?.id}/edit`"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PencilIcon class="w-4 h-4 mr-2 inline" />
            Modifier le produit
          </router-link>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce, throttle, defer } from 'lodash'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import Modal from '@/components/ui/Modal.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Pagination from '@/components/ui/Pagination.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  PhotoIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'
import api from '@/api/axiosConfig'

const route = useRoute()
const router = useRouter()
const currentPageTitle = ref("Gestion des Produits")

// État global
const successMessage = ref(null)
const errorMessage = ref(null)

// États de chargement avec Lodash
const loadingStates = ref({
  products: true,
  categories: true,
  brands: true,
  stats: true,
  search: false,
  filtering: false,
  pagination: false,
  export: false,
  delete: false,
  details: false,
  duplicate: false
})

// Données
const products = ref([])
const categories = ref([])
const brands = ref([])
const currentProductId = ref(null)

// Filtres
const filters = ref({
  search: '',
  category: '',
  brand: '',
  status: '',
  stock: '',
  type: '',
  priceMin: '',
  priceMax: ''
})


const getGenderLabel = (gender) => {
  const labels = {
    'man': 'Homme',
    'woman': 'Femme',
    'unisex': 'Unisexe',
    'child': 'Enfant'
  }
  return labels[gender] || gender
}

const calculateMargin = (product) => {
  if (!product.cost_price || !product.final_price) return 0
  const cost = parseFloat(product.cost_price)
  const price = parseFloat(product.final_price)
  if (cost === 0) return 0
  return Math.round(((price - cost) / cost) * 100)
}

const getMarginClass = (product) => {
  const margin = calculateMargin(product)
  if (margin > 50) return 'text-green-600 dark:text-green-400'
  if (margin > 20) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getVariantStockClass = (stock) => {
  if (stock === 0) return 'text-red-600 dark:text-red-400'
  if (stock <= 5) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Non définie'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const showAdvancedFilters = ref(false)
const showExportMenu = ref(false)

// Sélection
const selectedProducts = ref([])

// Tri
const sortField = ref('name')
const sortDirection = ref('asc')

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 25,
  total: 0,
  lastPage: 1,
  from: 0,
  to: 0
})

// Modals
const showDeleteModal = ref(false)
const showDetailsModal = ref(false)
const currentProduct = ref(null)
const currentProductMetrics = ref(null)

// Fonction delay personnalisée (Lodash n'a pas de delay natif)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))


const debouncedPriceFilter = debounce(() => {
  throttledFilter()
}, 800)

const debouncedExport = debounce(async (format) => {
  loadingStates.value.export = true
  showExportMenu.value = false

  try {
    await delay(1000) // Simuler export
    await exportProducts(format)
  } finally {
    loadingStates.value.export = false
  }
}, 300)

// Computed properties
const statsDisplay = computed(() => {
  return [
    {
      title: 'Total Produits',
      value: loadingStates.value.stats ? '...' : products.value.length,
      icon: CubeIcon,
      iconClass: 'h-6 w-6 text-blue-400'
    },
    {
      title: 'En Stock',
      value: loadingStates.value.stats ? '...' : productsInStock.value,
      icon: CheckCircleIcon,
      iconClass: 'h-6 w-6 text-green-400'
    },
    {
      title: 'Stock Faible',
      value: loadingStates.value.stats ? '...' : lowStockProducts.value,
      icon: ExclamationTriangleIcon,
      iconClass: 'h-6 w-6 text-yellow-400'
    },
    {
      title: 'Rupture',
      value: loadingStates.value.stats ? '...' : outOfStockProducts.value,
      icon: XCircleIcon,
      iconClass: 'h-6 w-6 text-red-400'
    }
  ]
})

const visiblePages = computed(() => {
  const pages = []
  const totalPages = pagination.value.lastPage
  const current = pagination.value.currentPage

  let start = Math.max(1, current - 2)
  let end = Math.min(totalPages, current + 2)

  if (current <= 3) end = Math.min(5, totalPages)
  if (current >= totalPages - 2) start = Math.max(totalPages - 4, 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Statistiques
const productsInStock = computed(() =>
  products.value.filter(p => getTotalStock(p) > 0).length
)

const lowStockProducts = computed(() =>
  products.value.filter(p => {
    const stock = getTotalStock(p)
    return stock > 0 && stock <= 10
  }).length
)

const outOfStockProducts = computed(() =>
  products.value.filter(p => getTotalStock(p) === 0).length
)

const isAllSelected = computed(() =>
  paginatedProducts.value.length > 0 &&
  selectedProducts.value.length === paginatedProducts.value.length
)

// Méthodes utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(price).replace('XAF', 'F CFA')
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || 'Non catégorisé'
}

const getBrandName = (brandId) => {
  const brand = brands.value.find(b => b.id === brandId)
  return brand?.name || 'Aucune marque'
}

const getTotalStock = (product) => {
  if (!product.variants || product.variants.length === 0) return 0
  return product.variants.reduce((total, variant) => total + (variant.stock_quantity || 0), 0)
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder-product.png'

  if (imagePath.startsWith('http') || imagePath.startsWith('/storage/')) {
    return imagePath
  }

  return `/storage/${imagePath}`
}

const getStockStatusColor = (stock) => {
  if (stock === 0) return 'bg-red-500'
  if (stock <= 10) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getStockPercentage = (stock) => {
  const maxStock = 100
  return Math.min(100, (stock / maxStock) * 100)
}

const getStatusBadgeClass = (product) => {
  if (product.is_draft) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
}

const getStatusLabel = (product) => {
  if (product.is_draft) return 'Brouillon'
  if (product.is_preorder) return 'Précommande'
  return 'Actif'
}

const handleImageError = (event) => {
  event.target.src = '/images/placeholder-product.png'
}

// Actions
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const resetFilters = () => {
  filters.value = {
    search: '',
    category: '',
    brand: '',
    status: '',
    stock: '',
    type: '',
    priceMin: '',
    priceMax: ''
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedProducts.value = []
  } else {
    selectedProducts.value = paginatedProducts.value.map(p => p.id)
  }
}

// CRUD Operations avec loading
// Dans votre script setup, remplacez la fonction fetchProducts :

const fetchProducts = async () => {
  try {
    loadingStates.value.products = true

    // Construire les paramètres de requête
    const params = {
      page: pagination.value.currentPage,
      per_page: pagination.value.perPage,
      ...filters.value
    }

    // Nettoyer les paramètres vides
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    console.log('Paramètres de requête:', params)

    const response = await api.get('/api/admin/products', { params })

    console.log('Réponse API Produits:', response)

    // Simuler un délai minimum pour montrer le skeleton
    await delay(500)

    // Mettre à jour les produits et la pagination
    products.value = response.data || []

    // Mettre à jour les métadonnées de pagination
    if (response.meta) {
      pagination.value = {
        currentPage: response.meta.current_page,
        perPage: response.meta.per_page,
        total: response.meta.total,
        lastPage: response.meta.last_page,
        from: response.meta.from,
        to: response.meta.to
      }
    }

  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
    errorMessage.value = 'Erreur lors du chargement des produits'
  } finally {
    loadingStates.value.products = false
    loadingStates.value.stats = false
  }
}

// Modifiez la fonction changePage :
const changePage = (page) => {
  pagination.value.currentPage = page
}

// Modifiez la fonction handlePerPageChange :
const handlePerPageChange = async () => {
  loadingStates.value.pagination = true

  try {
    pagination.value.currentPage = 1
    await fetchProducts() // Recharger avec le nouveau perPage
  } finally {
    loadingStates.value.pagination = false
  }
}

// Supprimez ou modifiez les computed properties qui font le filtrage côté client :
const filteredProducts = computed(() => {
  // Si vous voulez garder le filtrage côté client pour certains cas simples
  // Sinon, supprimez cette computed property et utilisez directement products.value
  return products.value
})

const paginatedProducts = computed(() => {
  // Maintenant les données sont déjà paginées par l'API
  return products.value
})

// Modifiez la fonction de recherche pour utiliser l'API :
const debouncedSearch = debounce(async () => {
  loadingStates.value.search = true
  loadingStates.value.filtering = true

  try {
    pagination.value.currentPage = 1
    await fetchProducts() // Recharger avec les nouveaux filtres
  } finally {
    loadingStates.value.search = false
    loadingStates.value.filtering = false
  }
}, 500)

// Faites de même pour les autres filtres :
const throttledFilter = throttle(async () => {
  loadingStates.value.filtering = true

  try {
    pagination.value.currentPage = 1
    await fetchProducts()
  } finally {
    loadingStates.value.filtering = false
  }
}, 300)

const fetchCategories = async () => {
  try {
    const response = await api.get('/api/admin/categories')
    categories.value = response.data?.data || response.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
  } finally {
    loadingStates.value.categories = false
  }
}

const fetchBrands = async () => {
  try {
    const response = await api.get('/api/admin/brands')
    brands.value = response.data?.data || response.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des marques:', error)
  } finally {
    loadingStates.value.brands = false
  }
}

const viewProduct = async (product) => {
  try {
    showDetailsModal.value = true
    loadingStates.value.details = true
    currentProductId.value = product.id
    currentProduct.value = null

    const response = await api.get(`/api/admin/products/${product.id}`)
    console.log(response)
    // Délai minimum pour UX
    await delay(300)

    currentProduct.value = response.product || response.data || null
    currentProductMetrics.value = {
      viewCount: response.metrics?.view_count ?? 0,
      purchaseCount: response.metrics?.purchase_count ?? 0,
      reviewCount: response.metrics?.review_count ?? 0,
      averageRating: response.metrics?.average_rating ?? 0
    }
  } catch (error) {
    console.error('Erreur lors du chargement des détails:', error)
    errorMessage.value = 'Erreur lors du chargement des détails du produit'
  } finally {
    loadingStates.value.details = false
    currentProductId.value = null
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  currentProduct.value = null
  loadingStates.value.details = false
}

const duplicateProduct = async (product) => {
  loadingStates.value.duplicate = true

  try {
    await delay(500) // Simuler traitement
    router.push({
      name: 'duplicate-product',
      params: { productId: product.id }
    })
  } finally {
    loadingStates.value.duplicate = false
  }
}

const confirmDeleteProduct = (productId) => {
  if (Array.isArray(productId)) {
    selectedProducts.value = productId
  } else {
    selectedProducts.value = [productId]
  }
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedProducts.value = []
  loadingStates.value.delete = false
}

const deleteProduct = async () => {
  try {
    loadingStates.value.delete = true

    const deletePromises = selectedProducts.value.map(id =>
      api.delete(`/api/admin/products/${id}`)
    )

    await Promise.all(deletePromises)

    // Délai pour UX
    await delay(800)

    await fetchProducts()

    successMessage.value = `${selectedProducts.value.length} produit(s) supprimé(s) avec succès`
    closeDeleteModal()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    errorMessage.value = 'Erreur lors de la suppression du/des produit(s)'
  } finally {
    loadingStates.value.delete = false
  }
}

// Actions en lot
const bulkDelete = () => {
  confirmDeleteProduct(selectedProducts.value)
}

// Export avec loading
const exportProducts = async (format = 'excel') => {
  try {
    const dataToExport = filteredProducts.value.map(product => ({
      'Nom': product.name,
      'SKU': product.sku || '',
      'Référence': product.reference || '',
      'Type': product.type,
      'Catégorie': getCategoryName(product.category_id),
      'Marque': getBrandName(product.brand_id),
      'Prix': product.price,
      'Prix réduit': product.discounted_price || '',
      'Stock total': getTotalStock(product),
      'Statut': getStatusLabel(product),
      'Matériau': product.material || '',
      'Poids (g)': product.weight_grams || '',
      'Description courte': product.short_description || '',
      'Date de création': product.created_at ? new Date(product.created_at).toLocaleDateString('fr-FR') : ''
    }))

    const fileName = `produits_${new Date().toISOString().split('T')[0]}`

    // Simuler temps d'export
    await delay(1500)

    exportToCSV(dataToExport, fileName)

    successMessage.value = `Export ${format.toUpperCase()} réussi !`
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    errorMessage.value = 'Erreur lors de l\'export'
  }
}

const exportToCSV = (data, fileName) => {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${fileName}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Pagination
const updatePagination = () => {
  const total = filteredProducts.value.length
  const lastPage = Math.max(1, Math.ceil(total / pagination.value.perPage))

  pagination.value = {
    ...pagination.value,
    total,
    lastPage,
    from: total === 0 ? 0 : Math.min(total, (pagination.value.currentPage - 1) * pagination.value.perPage + 1),
    to: Math.min(total, pagination.value.currentPage * pagination.value.perPage)
  }

  if (pagination.value.currentPage > lastPage) {
    pagination.value.currentPage = lastPage
  }
}

// Gestion des messages
const clearMessages = () => {
  successMessage.value = null
  errorMessage.value = null
}

// Watchers avec throttle
watch([filters, sortField, sortDirection], throttle(() => {
  pagination.value.currentPage = 1
  updatePagination()
}, 200), { deep: true })

watch(() => pagination.value.perPage, () => {
  pagination.value.currentPage = 1
  updatePagination()
})

watch(filteredProducts, () => {
  updatePagination()
})

// Initialisation
onMounted(async () => {
  if (route.query.success) {
    successMessage.value = route.query.success
    router.replace({ query: {} })
  }

  // Chargement en parallèle avec gestion individuelle des états
  await Promise.allSettled([
    fetchProducts(),
    fetchCategories(),
    fetchBrands()
  ])

  setTimeout(clearMessages, 5000)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Animation skeleton loading */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Loading spinner personnalisé */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transitions fluides pour les états de chargement */
.loading-transition {
  transition: all 0.3s ease-in-out;
}

/* Style pour les éléments désactivés pendant le chargement */
.loading-disabled {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animation d'apparition des données */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Style pour les skeleton loaders */
.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.dark .skeleton {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

/* Style pour les indicateurs de statut avec animation */
.status-indicator {
  position: relative;
  overflow: hidden;
}

.status-indicator::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.status-indicator.loading::after {
  left: 100%;
}

/* Amélioration des boutons pendant le chargement */
.btn-loading {
  position: relative;
}

.btn-loading .btn-text {
  opacity: 0;
}

.btn-loading .loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Style pour les messages de chargement */
.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.dark .loading-message {
  color: #9ca3af;
  background-color: #1f2937;
  border-color: #374151;
}

/* Animation pour les cartes de statistiques */
.stat-card {
  transition: all 0.3s ease;
}

.stat-card.loading {
  transform: scale(0.98);
  opacity: 0.8;
}

/* Style pour les overlay de chargement */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

.dark .loading-overlay {
  background-color: rgba(17, 24, 39, 0.8);
}

/* Animation pour les listes */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Style pour les indicateurs de progression */
.progress-bar {
  height: 2px;
  background-color: #3b82f6;
  transition: width 0.3s ease;
  border-radius: 1px;
}

.progress-container {
  width: 100%;
  height: 2px;
  background-color: #e5e7eb;
  border-radius: 1px;
  overflow: hidden;
}

.dark .progress-container {
  background-color: #374151;
}

/* Animation pour les modals */
.modal-enter-active {
  transition: all 0.3s ease;
}

.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Style pour les tooltips de chargement */
.loading-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 20;
  margin-bottom: 0.25rem;
}

.loading-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .skeleton {
    animation-duration: 1s;
  }

  .loading-message {
    font-size: 0.75rem;
    padding: 0.75rem;
  }
}

/* Accessibilité pour les utilisateurs qui préfèrent moins d'animations */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .animate-pulse,
  .skeleton,
  .loading-transition,
  .fade-in,
  .list-enter-active,
  .list-leave-active,
  .modal-enter-active,
  .modal-leave-active {
    animation: none !important;
    transition: none !important;
  }

  .status-indicator::after {
    display: none;
  }
}
</style>
