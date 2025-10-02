<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />
    <div class="px-6 py-8 bg-white dark:bg-gray-900">
      <!-- Header -->
      <div class="flex flex-col justify-between mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white" v-if="activeTab === 'categories'">Catégories</h1>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white" v-if="activeTab === 'brands'">Marques</h1>
        </div>
        <div class="flex gap-3 mt-4 sm:mt-0">
          <!-- Bulk Actions contextuelles -->
          <template v-if="selectedItems.length > 0">
            <!-- Actions pour éléments actifs -->
            <template v-if="currentViewMode === 'active'">
              <button
                @click="bulkActivate"
                class="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Activer ({{ selectedItems.length }})
              </button>
              <button
                @click="bulkDeactivate"
                class="px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Désactiver ({{ selectedItems.length }})
              </button>
              <button
                @click="confirmBulkDelete"
                class="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <TrashIcon class="w-4 h-4" />
                Supprimer ({{ selectedItems.length }})
              </button>
            </template>

            <!-- Actions pour éléments supprimés -->
            <template v-if="currentViewMode === 'deleted'">
              <button
                @click="bulkRestore"
                class="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Restaurer ({{ selectedItems.length }})
              </button>
              <button
                @click="confirmBulkForceDelete"
                class="px-3 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900 transition-colors flex items-center gap-1"
              >
                <TrashIcon class="w-4 h-4" />
                Supprimer définitivement ({{ selectedItems.length }})
              </button>
            </template>
          </template>

          <button
            v-if="activeTab === 'categories'"
            @click="openModal('category')"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nouvelle Catégorie
          </button>
          <button
            v-if="activeTab === 'brands'"
            @click="openModal('brand')"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Nouvelle Marque
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul class="flex flex-wrap -mb-px">
          <li class="mr-2">
            <button
              @click="setActiveTab('categories')"
              :class="{
                'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500': activeTab === 'categories',
                'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-gray-800 dark:text-white': activeTab !== 'categories'
              }"
              class="inline-block p-4 border-b-2 rounded-t-lg transition-colors"
            >
              Catégories
            </button>
          </li>
          <li class="mr-2">
            <button
              @click="setActiveTab('brands')"
              :class="{
                'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500': activeTab === 'brands',
                'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-gray-800 dark:text-white': activeTab !== 'brands'
              }"
              class="inline-block p-4 border-b-2 rounded-t-lg transition-colors"
            >
              Marques
            </button>
          </li>
        </ul>
      </div>

      <!-- View Mode Selector -->
      <div class="mb-4 flex gap-2">
        <button
          @click="setViewMode('active')"
          :class="viewModeButtonClass('active')"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Actives ({{ activeTab === 'categories' ? categoriesStore.categories.length : brandsStore.brands.length }})
        </button>

        <button
          @click="setViewMode('deleted')"
          :class="viewModeButtonClass('deleted')"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Supprimées ({{ activeTab === 'categories' ? categoriesStore.deletedCategories.length : brandsStore.deletedBrands?.length || 0 }})
        </button>

        <button
          @click="setViewMode('all')"
          :class="viewModeButtonClass('all')"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Toutes
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="flex flex-col mb-6 gap-4 sm:flex-row sm:items-center">
        <!-- Bulk Actions Info -->
        <div v-if="selectedItems.length > 0" class="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <span class="text-sm text-blue-800 dark:text-blue-200">
            {{ selectedItems.length }} élément(s) sélectionné(s)
          </span>
          <button
            @click="clearSelection"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
          >
            Désélectionner tout
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative flex-1 min-w-[250px]">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="activeTab === 'categories' ? 'Rechercher des catégories...' : 'Rechercher des marques...'"
            class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-2 sm:flex-nowrap">
          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            class="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>

          <!-- Parent Category Filter -->
          <select
            v-if="activeTab === 'categories'"
            v-model="parentCategoryFilter"
            class="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="all">Toutes les catégories</option>
            <option value="root">Catégories principales seulement</option>
            <optgroup label="Filtrer par catégorie principale :">
              <option
                v-for="category in availableParentCategories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }} (avec ses sous-catégories)
              </option>
            </optgroup>
          </select>
        </div>
      </div>

      <!-- Categories Table -->
      <div v-if="activeTab === 'categories'" class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                >
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                N°
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Nom
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Parent
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Produits
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Statut
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                État
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <!-- État de chargement -->
            <tr v-if="categoriesStore.isLoading">
              <td colspan="8" class="px-6 py-4 text-center">
                <div class="flex justify-center items-center py-4">
                  <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </td>
            </tr>

            <!-- Aucun résultat -->
            <tr v-else-if="currentCategoriesList.length === 0">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                <div class="flex flex-col items-center justify-center py-8">
                  <FolderIcon class="w-12 h-12 text-gray-400 mb-2" />
                  <p>Aucune catégorie trouvée</p>
                  <button v-if="!categoriesStore.isLoading"
                          @click="refreshData"
                          class="mt-2 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400">
                    Réessayer
                  </button>
                </div>
              </td>
            </tr>

            <!-- Résultats -->
            <template v-for="(category, index) in currentCategoriesList" :key="category.id" v-else>
              <tr
                :class="[
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  category.parent_id ? 'bg-blue-50 dark:bg-blue-900/30' : '',
                  selectedItems.includes(category.id) ? 'bg-blue-100 dark:bg-blue-800/50' : '',
                  category.deleted_at ? 'opacity-60' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="selectedItems.includes(category.id)"
                    @change="toggleItemSelection(category.id)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  >
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold">
                    {{ category.parent_id ? '' : (currentCategoriesList.filter((cat, i) => i <= index && cat.parent_id === null).length) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center" :class="category.parent_id ? 'ml-6' : ''">
                    <div v-if="category.parent_id" class="flex items-center mr-2 text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <span class="text-xs">Sous-catégorie</span>
                    </div>

                    <div class="flex-shrink-0 w-10 h-10 relative">
                      <img
                        v-if="category.icon_url"
                        class="w-10 h-10 object-contain rounded-full"
                        :src="category.icon_url"
                        :alt="category.name"
                        loading="lazy"
                      >
                      <div v-else class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <PhotoIcon class="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ category.name }}
                      </div>
                      <div v-if="category.slug" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ category.slug }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ category.parent?.name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full"
                        :class="category.products_count > 0
                              ? 'text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'">
                    {{ category.products_count ?? 0 }} {{ category.products_count === 1 ? 'produit' : 'produits' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="category.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'">
                    {{ category.is_active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="category.deleted_at"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  >
                    Supprimé
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    Normal
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <div class="flex justify-end space-x-2">
                    <!-- Actions pour éléments actifs -->
                    <template v-if="!category.deleted_at">
                      <button @click.stop="editItem('category', category)"
                              class="p-2 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600"
                              title="Modifier">
                        <PencilIcon class="w-4 h-4" />
                      </button>
                      <button @click.stop="confirmSingleDelete('category', category)"
                              class="p-2 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-gray-600"
                              title="Supprimer">
                        <TrashIcon class="w-4 h-4" />
                      </button>
                    </template>

                    <!-- Actions pour éléments supprimés -->
                    <template v-else>
                      <button @click.stop="restoreItem('category', category.id)"
                              class="p-2 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-gray-600"
                              title="Restaurer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      <button @click.stop="confirmSingleForceDelete('category', category)"
                              class="p-2 text-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-gray-600"
                              title="Supprimer définitivement">
                        <TrashIcon class="w-4 h-4" />
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Brands Table (structure similaire mais pour les marques) -->
      <div v-if="activeTab === 'brands'" class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                >
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                N°
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Nom
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Produits
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                Statut
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                État
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <!-- État de chargement -->
            <tr v-if="brandsStore.isLoading">
              <td colspan="8" class="px-6 py-4 text-center">
                <div class="flex justify-center items-center py-4">
                  <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </td>
            </tr>

            <!-- Aucun résultat -->
            <tr v-else-if="currentBrandsList.length === 0">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                <div class="flex flex-col items-center justify-center py-8">
                  <FolderIcon class="w-12 h-12 text-gray-400 mb-2" />
                  <p>Aucune marque trouvée</p>
                  <button v-if="!brandsStore.isLoading"
                          @click="refreshData"
                          class="mt-2 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400">
                    Réessayer
                  </button>
                </div>
              </td>
            </tr>

            <!-- Résultats -->
            <template v-for="(brand, index) in currentBrandsList" :key="brand.id" v-else>
              <tr
                :class="[
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  selectedItems.includes(brand.id) ? 'bg-blue-100 dark:bg-blue-800/50' : '',
                  brand.deleted_at ? 'opacity-60' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="selectedItems.includes(brand.id)"
                    @change="toggleItemSelection(brand.id)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  >
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-10 h-10 relative">
                      <img
                        v-if="brand.logo_url"
                        class="w-10 h-10 object-contain rounded-full"
                        :src="brand.logo_url"
                        :alt="brand.name"
                        loading="lazy"
                      >
                      <div v-else class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <PhotoIcon class="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ brand.name }}
                      </div>
                      <div v-if="brand.slug" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ brand.slug }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full"
                        :class="brand.products_count > 0
                              ? 'text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'">
                    {{ brand.products_count ?? 0 }} {{ brand.products_count === 1 ? 'produit' : 'produits' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="brand.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'">
                    {{ brand.is_active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="brand.deleted_at"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  >
                    Supprimé
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    Normal
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <div class="flex justify-end space-x-2">
                    <!-- Actions pour éléments actifs -->
                    <template v-if="!brand.deleted_at">
                      <button @click.stop="editItem('brand', brand)"
                              class="p-2 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600"
                              title="Modifier">
                        <PencilIcon class="w-4 h-4" />
                      </button>
                      <button @click.stop="confirmSingleDelete('brand', brand)"
                              class="p-2 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-gray-600"
                              title="Supprimer">
                        <TrashIcon class="w-4 h-4" />
                      </button>
                    </template>

                    <!-- Actions pour éléments supprimés -->
                    <template v-else>
                      <button @click.stop="restoreItem('brand', brand.id)"
                              class="p-2 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-gray-600"
                              title="Restaurer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      <button @click.stop="confirmSingleForceDelete('brand', brand)"
                              class="p-2 text-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-gray-600"
                              title="Supprimer définitivement">
                        <TrashIcon class="w-4 h-4" />
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="paginationInfo.total" class="flex flex-col items-center justify-between mt-6 space-y-4 sm:flex-row sm:space-y-0">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Affichage de <span class="font-medium">{{ paginationInfo.from }}</span> à
          <span class="font-medium">{{ paginationInfo.to }}</span> sur
          <span class="font-medium">{{ paginationInfo.total }}</span> résultats
        </div>
        <nav class="flex items-center space-x-1">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            :class="{
              'cursor-not-allowed opacity-50': currentPage === 1,
              'hover:bg-gray-100 dark:hover:bg-gray-700': currentPage > 1
            }"
            class="p-2 rounded-md"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </button>

          <template v-for="page in pages" :key="page">
            <button
              v-if="page === '...'"
              disabled
              class="px-3 py-1 rounded-md"
            >
              {{ page }}
            </button>
            <button
              v-else
              @click="goToPage(page)"
              :class="{
                'bg-blue-600 text-white': page === currentPage,
                'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700': page !== currentPage
              }"
              class="px-3 py-1 rounded-md transition-colors"
            >
              {{ page }}
            </button>
          </template>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            :class="{
              'cursor-not-allowed opacity-50': currentPage === totalPages,
              'hover:bg-gray-100 dark:hover:bg-gray-700': currentPage < totalPages
            }"
            class="p-2 rounded-md"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </nav>
      </div>

      <!-- Modal CRUD -->
      <Modal v-if="showModal" @close="closeModal">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ modalTitle }}
          </h2>
        </template>

        <template #body>
          <form @submit.prevent="saveItem" class="space-y-6">
            <div class="grid gap-6 sm:grid-cols-2">

              <!-- Champ Nom -->
              <div class="sm:col-span-2">
                <label for="name-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  {{ currentType === 'category' ? 'Nom de la catégorie' : 'Nom de la marque' }} *
                </label>
                <input
                  id="name-input"
                  type="text"
                  v-model="form.name"
                  required
                  maxlength="255"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Entrez le nom..."
                >
              </div>

              <!-- Champ Slug (généré automatiquement) -->
              <div class="sm:col-span-2">
                <label for="slug-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Slug (URL)
                </label>
                <input
                  id="slug-input"
                  type="text"
                  :value="slugValue"
                  readonly
                  maxlength="255"
                  class="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Généré automatiquement à partir du nom"
                >
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Laissez vide pour générer automatiquement à partir du nom
                </p>
              </div>

              <!-- Champ Description -->
              <div class="sm:col-span-2">
                <label for="description-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Description
                </label>
                <textarea
                  id="description-input"
                  v-model="form.description"
                  rows="3"
                  maxlength="1000"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Description optionnelle..."
                ></textarea>
                <div class="flex justify-between mt-1">
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Description optionnelle (max 1000 caractères)
                  </p>
                  <span class="text-xs text-gray-400">
                    {{ form.description?.length || 0 }}/1000
                  </span>
                </div>
              </div>

              <!-- Site Web (uniquement pour les marques) -->
              <div v-if="currentType === 'brand'" class="sm:col-span-2">
                <label for="website-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Site Web
                </label>
                <input
                  id="website-input"
                  type="url"
                  v-model="form.website_url"
                  placeholder="https://example.com"
                  pattern="https?://.+"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Doit commencer par http:// ou https://
                </p>
              </div>

              <!-- Catégorie parente (uniquement pour les catégories) -->
              <div v-if="currentType === 'category'" class="sm:col-span-2">
                <label for="parent-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Catégorie parente
                </label>
                <select
                  id="parent-select"
                  v-model="form.parent_id"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option :value="null">Aucune (catégorie racine)</option>
                  <option
                    v-for="category in availableParentCategories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Sélectionnez une catégorie parente pour créer une sous-catégorie
                </p>
              </div>

              <!-- Upload d'image -->
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ currentType === 'category' ? 'Icône de la catégorie' : 'Logo de la marque' }}
                </label>
                <!-- Zone de prévisualisation -->
                <div class="mb-4">
                  <div v-if="imagePreviewUrl"
                      class="relative inline-block">
                    <img
                      :src="imagePreviewUrl"
                      :alt="form.name || 'Preview'"
                      class="w-24 h-24 object-contain rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                    >
                    <button
                      type="button"
                      @click="removeImage"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Supprimer l'image"
                      aria-label="Supprimer l'image"
                    >
                      ×
                    </button>
                  </div>
                  <div v-else class="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <PhotoIcon class="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <!-- Input file avec zone de drag & drop -->
                <div class="relative">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="hidden"
                    aria-label="Sélectionner une image"
                  />
                  <div
                    @click="$refs.fileInput?.click()"
                    @dragover.prevent
                    @drop.prevent="handleImageDrop"
                    @keydown.enter="$refs.fileInput?.click()"
                    @keydown.space.prevent="$refs.fileInput?.click()"
                    tabindex="0"
                    role="button"
                    aria-label="Cliquer pour sélectionner une image ou glisser-déposer"
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="mt-2">
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        <span class="font-medium text-blue-600 hover:text-blue-500">
                          Cliquez pour télécharger
                        </span>
                        ou glissez-déposez
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF, WEBP jusqu'à 10MB
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Informations sur l'image sélectionnée -->
                <div v-if="form.selectedFile" class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2 flex-1 min-w-0">
                      <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm text-blue-800 dark:text-blue-200 truncate">
                        {{ form.selectedFile.name }}
                      </span>
                      <span class="text-xs text-blue-600 dark:text-blue-300 flex-shrink-0">
                        ({{ formatFileSize(form.selectedFile.size) }})
                      </span>
                    </div>
                    <button
                      type="button"
                      @click="removeSelectedFile"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex-shrink-0 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      title="Supprimer le fichier sélectionné"
                      aria-label="Supprimer le fichier sélectionné"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Toggle Actif/Inactif - VERSION CORRIGÉE -->
              <div class="sm:col-span-2">
                <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg min-h-[80px]">
                  <div class="flex-1 pr-4">
                    <label class="text-sm font-medium text-gray-900 dark:text-white">
                      Statut
                    </label>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ form.is_active ? 'Cet élément est visible et disponible' : 'Cet élément est masqué et indisponible' }}
                    </p>
                  </div>
                  <!-- CORRECTION PRINCIPALE : conteneur avec flex-shrink-0 -->
                  <div class="flex items-center flex-shrink-0">
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="form.is_active"
                        class="sr-only"
                      >
                      <!-- CORRECTION : Suppression de 'peer' et ajout de 'flex-shrink-0' -->
                      <div class="relative w-14 h-8 rounded-full transition-colors duration-300 flex-shrink-0"
                        :class="form.is_active
                          ? 'bg-green-500 dark:bg-green-600'
                          : 'bg-red-500 dark:bg-red-600'">

                        <!-- Bouton avec icône -->
                        <div class="absolute top-1 left-1 flex items-center justify-center w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md"
                            :class="form.is_active ? 'translate-x-6' : ''">

                          <!-- Icône coche (visible quand actif) -->
                          <svg v-if="form.is_active" class="w-3 h-3 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>

                          <!-- Icône croix (visible quand inactif) -->
                          <svg v-else class="w-3 h-3 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </div>

                      <!-- Label texte avec flex-shrink-0 -->
                      <span class="ml-3 text-sm font-medium flex-shrink-0"
                            :class="form.is_active
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-red-700 dark:text-red-300'">
                        {{ form.is_active ? 'Activé' : 'Désactivé' }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Informations supplémentaires (si édition) -->
              <div v-if="isEditing" class="sm:col-span-2">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Informations
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">ID:</span>
                      <span class="ml-1 font-mono">{{ form.id }}</span>
                    </div>
                    <div v-if="form.created_at">
                      <span class="text-gray-500 dark:text-gray-400">Créé le:</span>
                      <span class="ml-1">{{ formatDate(form.created_at) }}</span>
                    </div>
                    <div v-if="form.updated_at">
                      <span class="text-gray-500 dark:text-gray-400">Modifié le:</span>
                      <span class="ml-1">{{ formatDate(form.updated_at) }}</span>
                    </div>
                    <div v-if="currentType === 'category' && form.products_count !== undefined">
                      <span class="text-gray-500 dark:text-gray-400">Produits:</span>
                      <span class="ml-1">{{ form.products_count }}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Boutons d'action -->
            <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Annuler
              </button>

              <!-- Bouton de suppression (si édition) -->
              <button
                v-if="isEditing"
                type="button"
                @click="confirmSingleDelete(currentType, form)"
                class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="loading"
              >
                Supprimer
              </button>

              <button
                type="submit"
                :disabled="loading || !form.name?.trim()"
                class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isEditing ? 'Mise à jour...' : 'Création...' }}
                </span>
                <span v-else>
                  {{ isEditing ? 'Mettre à jour' : 'Enregistrer' }}
                </span>
              </button>
            </div>
          </form>
        </template>
      </Modal>

      <!-- Modals de confirmation -->
      <ConfirmationModal
        v-if="showDeleteModal"
        @confirm="performSingleAction"
        @cancel="closeDeleteModal"
        :title="deleteModalTitle"
        :message="deleteModalMessage"
        :isLoading="isDeleting"
      />

      <ConfirmationModal
        v-if="showBulkModal"
        @confirm="performBulkAction"
        @cancel="closeBulkModal"
        :title="bulkModalTitle"
        :message="bulkModalMessage"
        :action="currentBulkAction.value"
        :isLoading="isBulkProcessing"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useBrandsStore } from '@/stores/brands'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import Modal from '@/components/ui/Modal.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import TrashIcon from '@/icons/TrashIcon.vue'
import PencilIcon from '@/icons/PencilIcon.vue'
import { useToast } from 'vue-toast-notification'
import { FolderIcon, PhotoIcon } from '@heroicons/vue/24/outline'

const $toast = useToast()
const categoriesStore = useCategoriesStore()
const brandsStore = useBrandsStore()

// UI State
const activeTab = ref('categories')
const currentViewMode = ref('active')
const showModal = ref(false)
const showDeleteModal = ref(false)
const showBulkModal = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const parentCategoryFilter = ref('all')
const currentType = ref('category')
const isDeleting = ref(false)
const isBulkProcessing = ref(false)

// Actions state
const currentSingleAction = ref(null)
const currentBulkAction = ref(null)
const itemToProcess = ref(null)
const selectedItems = ref([])

// Form state
const form = ref({
  id: null,
  name: '',
  slug: '',
  icon: null,
  logo: null,
  is_active: true,
  website_url: '',
  description: '',
  parent_id: null,
  imagePreview: null
})

const isEditing = ref(false)

// Computed properties

//imagePreviewUrl pour prévisualiser l'image sélectionnée
const imagePreviewUrl = computed(() => {
  return form.value.imagePreview ? URL.createObjectURL(form.value.imagePreview) : null
})

// computed pour generer automatiquement le slug à partir du nom entrée par l'utilisateur
const slugValue = computed(() => {
  return form.value.name
    ? form.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : ''
})

const modalTitle = computed(() => {
  return isEditing.value
    ? `Modifier ${currentType.value === 'category' ? 'la catégorie' : 'la marque'}`
    : `Ajouter une nouvelle ${currentType.value === 'category' ? 'catégorie' : 'marque'}`
})

const availableParentCategories = computed(() => {
  if (!categoriesStore.categories) return []
  return categoriesStore.categories.filter(cat =>
    cat.parent_id === null && (!isEditing.value || cat.id !== form.value.id)
  )
})

const currentCategoriesList = computed(() => {
  switch (currentViewMode.value) {
    case 'deleted':
      return categoriesStore.deletedCategories || []
    case 'all':
      return [...(categoriesStore.categories || []), ...(categoriesStore.deletedCategories || [])]
    default:
      return categoriesStore.categories || []
  }
})

const currentBrandsList = computed(() => {
  switch (currentViewMode.value) {
    case 'deleted':
      return brandsStore.deletedBrands || []
    case 'all':
      return [...(brandsStore.brands || []), ...(brandsStore.deletedBrands || [])]
    default:
      return brandsStore.brands || []
  }
})

const currentItems = computed(() => {
  return activeTab.value === 'categories' ? currentCategoriesList.value : currentBrandsList.value
})

const isAllSelected = computed(() => {
  return currentItems.value.length > 0 && selectedItems.value.length === currentItems.value.length
})

const currentPageTitle = computed(() => {
  return `Administration des ${activeTab.value === 'categories' ? 'catégories' : 'marques'}`
})

// Modal titles and messages
const deleteModalTitle = computed(() => {
  if (!itemToProcess.value) return ''
  const itemType = currentType.value === 'category' ? 'catégorie' : 'marque'

  switch (currentSingleAction.value) {
    case 'delete':
      return `Supprimer la ${itemType}`
    case 'forceDelete':
      return `Supprimer définitivement la ${itemType}`
    default:
      return ''
  }
})

const deleteModalMessage = computed(() => {
  if (!itemToProcess.value) return ''
  const name = itemToProcess.value.name

  switch (currentSingleAction.value) {
    case 'delete':
      return `Êtes-vous sûr de vouloir supprimer "${name}" ? Vous pourrez la restaurer plus tard.`
    case 'forceDelete':
      return `Êtes-vous sûr de vouloir supprimer définitivement "${name}" ? Cette action est irréversible.`
    default:
      return ''
  }
})

const bulkModalTitle = computed(() => {
  const count = selectedItems.value.length
  const itemType = currentType.value === 'category' ? 'catégories' : 'marques'

  switch (currentBulkAction.value) {
    case 'delete':
      return `Supprimer ${count} ${itemType}`
    case 'restore':
      return `Restaurer ${count} ${itemType}`
    case 'forceDelete':
      return `Supprimer définitivement ${count} ${itemType}`
    case 'activate':
      return `Activer ${count} ${itemType}`
    case 'deactivate':
      return `Désactiver ${count} ${itemType}`
    default:
      return ''
  }
})

const bulkModalMessage = computed(() => {
  const count = selectedItems.value.length

  switch (currentBulkAction.value) {
    case 'delete':
      return `Êtes-vous sûr de vouloir supprimer ces ${count} éléments ? Vous pourrez les restaurer plus tard.`
    case 'restore':
      return `Êtes-vous sûr de vouloir restaurer ces ${count} éléments ?`
    case 'forceDelete':
      return `Êtes-vous sûr de vouloir supprimer définitivement ces ${count} éléments ? Cette action est irréversible.`
    case 'activate':
      return `Êtes-vous sûr de vouloir activer ces ${count} éléments ?`
    case 'deactivate':
      return `Êtes-vous sûr de vouloir désactiver ces ${count} éléments ?`
    default:
      return ''
  }
})

// Pagination computed
const currentPage = computed({
  get() {
    return activeTab.value === 'categories'
      ? categoriesStore.currentPage
      : brandsStore.currentPage
  },
  set(value) {
    if (activeTab.value === 'categories') {
      categoriesStore.setCurrentPage(value)
    } else {
      brandsStore.setCurrentPage(value)
    }
    loadData()
  }
})

const paginationInfo = computed(() => {
  if (activeTab.value === 'categories') {
    return categoriesStore.paginationInfo || {
      from: 0, to: 0, total: 0, current_page: 1, per_page: 10, last_page: 1
    }
  } else {
    return brandsStore.paginationInfo || {
      from: 0, to: 0, total: 0, current_page: 1, per_page: 10, last_page: 1
    }
  }
})

const totalPages = computed(() => paginationInfo.value.last_page || 1)

const pages = computed(() => {
  const range = []
  const maxVisiblePages = 5
  const current = currentPage.value
  const total = totalPages.value

  let start = Math.max(1, current - Math.floor(maxVisiblePages / 2))
  const end = Math.min(start + maxVisiblePages - 1, total)

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1)
  }

  if (start > 1) {
    range.push(1)
    if (start > 2) range.push('...')
  }

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  if (end < total) {
    if (end < total - 1) range.push('...')
    range.push(total)
  }

  return range
})

// Methods

// Gestion des images
function getFormImageUrl() {
  if (form.value.imagePreview) {
    return form.value.imagePreview
  }

  if (isEditing.value) {
    if (currentType.value === 'category') {
      return form.value.icon_url || null
    } else {
      return form.value.logo_url || null
    }
  }

  return null
}

function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (file) {
    processImageFile(file)
  }
}

function handleImageDrop(event) {
  const file = event.dataTransfer.files?.[0]
  if (file && file.type.match('image.*')) {
    processImageFile(file)
  }
}

function processImageFile(file) {
  // Validation du fichier
  if (!file.type.match('image.*')) {
    $toast.error('Veuillez sélectionner un fichier image valide')
    return
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB
    $toast.error('La taille du fichier ne doit pas dépasser 10MB')
    return
  }

  // Nettoyer l'ancienne preview
  if (form.value.imagePreview) {
    URL.revokeObjectURL(form.value.imagePreview)
  }

  // Assigner le fichier
  if (currentType.value === 'category') {
    form.value.icon = file
  } else {
    form.value.logo = file
  }

  // Créer la preview
  form.value.imagePreview = URL.createObjectURL(file)
  form.value.selectedFile = file
}

function removeImage() {
  if (form.value.imagePreview) {
    URL.revokeObjectURL(form.value.imagePreview)
  }

  form.value.imagePreview = null
  form.value.selectedFile = null

  if (currentType.value === 'category') {
    form.value.icon = null
    form.value.icon_url = null
  } else {
    form.value.logo = null
    form.value.logo_url = null
  }
}

function removeSelectedFile() {
  removeImage()
}

// Utilitaires
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Nettoyage lors de la fermeture
function closeModal() {
  if (form.value.imagePreview) {
    URL.revokeObjectURL(form.value.imagePreview)
  }

  // Reset du formulaire
  form.value = {
    id: null,
    name: '',
    slug: '',
    icon: null,
    logo: null,
    is_active: true,
    website_url: '',
    description: '',
    parent_id: null,
    imagePreview: null,
    selectedFile: null
  }

  showModal.value = false
}

function viewModeButtonClass(mode) {
  const isActive = currentViewMode.value === mode
  return isActive
    ? 'bg-blue-600 text-white'
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
}

function setViewMode(mode) {
  currentViewMode.value = mode
  selectedItems.value = []

  if (activeTab.value === 'categories') {
    categoriesStore.setViewMode(mode)
  } else {
    // brandsStore.setViewMode
    brandsStore.setViewMode(mode)
  }
}

function setActiveTab(tab) {
  activeTab.value = tab
  currentType.value = tab === 'categories' ? 'category' : 'brand'
  currentViewMode.value = 'active'
  selectedItems.value = []
  searchQuery.value = ''
  statusFilter.value = 'all'
  parentCategoryFilter.value = 'all'

  // Reset pagination
  if (tab === 'categories') {
    categoriesStore.currentPage = 1
    categoriesStore.setViewMode('active')
  } else {
    brandsStore.currentPage = 1
    // brandsStore.setViewMode
    brandsStore.setViewMode('active')
  }

  loadData()
}

// Selection methods
function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = currentItems.value.map(item => item.id)
  }
}

function toggleItemSelection(itemId) {
  const id = parseInt(itemId)
  const index = selectedItems.value.indexOf(id)

  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(id)
  }
}

function clearSelection() {
  selectedItems.value = []
}

// Single item actions
function confirmSingleDelete(type, item) {
  currentType.value = type
  itemToProcess.value = item
  currentSingleAction.value = 'delete'
  showDeleteModal.value = true
}

function confirmSingleForceDelete(type, item) {
  currentType.value = type
  itemToProcess.value = item
  currentSingleAction.value = 'forceDelete'
  showDeleteModal.value = true
}

async function restoreItem(type, id) {
  try {
    isDeleting.value = true

    if (type === 'category') {
      await categoriesStore.restoreCategory(id)
    } else {
      await brandsStore.restoreCategory
      await brandsStore.restoreCategory(id)
    }

    await refreshData()
    $toast.success('Élément restauré avec succès')
  } catch (error) {
    console.error('Erreur lors de la restauration:', error)
    $toast.error('Erreur lors de la restauration')
  } finally {
    isDeleting.value = false
  }
}

async function performSingleAction() {
  try {
    isDeleting.value = true

    if (currentSingleAction.value === 'delete') {
      if (currentType.value === 'category') {
        await categoriesStore.deleteCategory(itemToProcess.value.id)
      } else {
        await brandsStore.deleteCategory
        await brandsStore.deleteCategory(itemToProcess.value.id)
      }
    } else if (currentSingleAction.value === 'forceDelete') {
      if (currentType.value === 'category') {
        await categoriesStore.forceDeleteCategory(itemToProcess.value.id)
      } else {
        await brandsStore.forceDeleteCategory
        await brandsStore.forceDeleteCategory(itemToProcess.value.id)
      }
    }

    closeDeleteModal()
    await refreshData()
    $toast.success('Action effectuée avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'action:', error)
    $toast.error('Erreur lors de l\'action')
  } finally {
    isDeleting.value = false
  }
}

// Bulk actions
function confirmBulkDelete() {
  if (selectedItems.value.length === 0) return
  currentBulkAction.value = 'delete'
  showBulkModal.value = true
}

function confirmBulkForceDelete() {
  if (selectedItems.value.length === 0) return
  currentBulkAction.value = 'forceDelete'
  showBulkModal.value = true
}

function bulkRestore() {
  if (selectedItems.value.length === 0) return
  currentBulkAction.value = 'restore'
  showBulkModal.value = true
}

function bulkActivate() {
  if (selectedItems.value.length === 0) return
  currentBulkAction.value = 'activate'
  showBulkModal.value = true
}

function bulkDeactivate() {
  if (selectedItems.value.length === 0) return
  currentBulkAction.value = 'deactivate'
  showBulkModal.value = true
}

async function performBulkAction() {
  try {
    isBulkProcessing.value = true

    const validIds = selectedItems.value.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)

    if (validIds.length === 0) {
      throw new Error('Aucun ID valide fourni')
    }

    let result

    if (activeTab.value === 'categories') {
      switch (currentBulkAction.value) {
        case 'delete':
          result = await categoriesStore.bulkDeleteCategories(validIds)
          break
        case 'restore':
          result = await categoriesStore.bulkRestoreCategories(validIds)
          break
        case 'forceDelete':
          result = await categoriesStore.bulkForceDeleteCategories(validIds)
          break
        case 'activate':
          result = await categoriesStore.bulkUpdateCategories(validIds, 'activate')
          break
        case 'deactivate':
          result = await categoriesStore.bulkUpdateCategories(validIds, 'deactivate')
          break
      }
    } else {
      // Actions similaires pour les marques (si implémentées)
      switch (currentBulkAction.value) {
        case 'delete':
          result = await brandsStore.bulkDeleteCategories && await brandsStore.bulkDeleteCategories(validIds)
          break
        case 'restore':
          result = await brandsStore.bulkRestoreCategories && await brandsStore.bulkRestoreCategories(validIds)
          break
        case 'forceDelete':
          result = await brandsStore.bulkForceDeleteCategories && await brandsStore.bulkForceDeleteCategories(validIds)
          break
        case 'activate':
          result = await brandsStore.bulkUpdateCategories && await brandsStore.bulkUpdateCategories(validIds, 'activate')
          break
        case 'deactivate':
          result = await brandsStore.bulkUpdateCategories && await brandsStore.bulkUpdateCategories(validIds, 'deactivate')
          break
      }
    }

    selectedItems.value = []
    closeBulkModal()
    await refreshData()

    if (result?.message) {
      $toast.success(result.message)
    } else {
      $toast.success('Action effectuée avec succès')
    }
  } catch (error) {
    console.error('Erreur lors de l\'action en masse:', error)
    $toast.error(error.response?.data?.message || 'Erreur lors de l\'action en masse')
  } finally {
    isBulkProcessing.value = false
  }
}

// Modal management
function closeDeleteModal() {
  showDeleteModal.value = false
  itemToProcess.value = null
  currentSingleAction.value = null
}

function closeBulkModal() {
  showBulkModal.value = false
  currentBulkAction.value = null
}

// Form management
function openModal(type) {
  currentType.value = type
  isEditing.value = false
  form.value = {
    id: null,
    name: '',
    slug: '',
    icon: null,
    logo: null,
    is_active: true,
    website_url: '',
    description: '',
    parent_id: null,
    imagePreview: null
  }
  showModal.value = true
}

function editItem(type, item) {
  currentType.value = type
  isEditing.value = true
  form.value = {
    id: item.id,
    name: item.name,
    slug: item.slug,
    icon: item.icon,
    logo: item.logo,
    is_active: item.is_active,
    website_url: item.website_url || '',
    description: item.description || '',
    parent_id: item.parent_id || null,
    imagePreview: null
  }
  showModal.value = true
}

async function saveItem() {
  try {
    loading.value = true
    $toast.info('Enregistrement en cours...')

    const formData = new FormData()

    formData.append('name', form.value.name)
    formData.append('is_active', form.value.is_active ? '1' : '0')
    formData.append('description', form.value.description || '')
    formData.append('website_url', form.value.website_url || '')
    if (form.value.parent_id) {
      formData.append('parent_id', form.value.parent_id)
    }

    // ✅ Ajout des fichiers image
    if (form.value.icon instanceof File) {
      formData.append('icon', form.value.icon)
    }
    if (form.value.logo instanceof File) {
      formData.append('logo', form.value.logo)
    }

    // Appel de l'API
    if (isEditing.value) {
      if (currentType.value === 'category') {
        console.log('Updating category :', form.value)
        await categoriesStore.updateCategory(form.value.id, formData)
      } else {
        await brandsStore.updateBrand(form.value.id, formData)
      }
    } else {
      if (currentType.value === 'category') {
        console.log('Creating category :', form.value)
        await categoriesStore.createCategory(formData)
      } else {
        await brandsStore.createBrand(formData)
      }
    }

    closeModal()
    await refreshData()
    $toast.success(isEditing.value ? 'Élément mis à jour avec succès' : 'Élément créé avec succès')
  } catch (error) {
    console.error('Error saving item:', error)

    let errorMessage = 'Erreur lors de la sauvegarde'
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat()
      errorMessage = validationErrors.join(' ')
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    $toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// Data loading
async function loadData() {
  try {
    loading.value = true

    const params = {
      page: currentPage.value,
      per_page: 10,
      search: searchQuery.value || undefined,
      status: statusFilter.value === 'all' ? undefined : statusFilter.value,
    }

    if (activeTab.value === 'categories') {
      if (parentCategoryFilter.value !== 'all') {
        if (parentCategoryFilter.value === 'root') {
          params.parent_id = 'null'
        } else {
          params.parent_id = parentCategoryFilter.value
        }
      }

      await categoriesStore.fetchCategories(params)
    } else {
      await brandsStore.fetchCategories
      await brandsStore.fetchCategories(params)
    }
  } catch (error) {
    console.error('Error loading data:', error)
    $toast.error('Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}

async function refreshData() {
  selectedItems.value = []
  await loadData()
}

// Pagination
async function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value = currentPage.value - 1
    await loadData()
  }
}

async function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value = currentPage.value + 1
    await loadData()
  }
}

async function goToPage(page) {
  if (page !== '...' && page !== currentPage.value && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    await loadData()
  }
}

// Watchers
watch([searchQuery, statusFilter, parentCategoryFilter], () => {
  if (activeTab.value === 'categories') {
    categoriesStore.currentPage = 1
  } else {
    brandsStore.currentPage = 1
  }
  selectedItems.value = []
  loadData()
}, { deep: true })

watch(currentViewMode, () => {
  selectedItems.value = []
  loadData()
})

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
</style>
