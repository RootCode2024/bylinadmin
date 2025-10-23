<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-8 bg-white dark:bg-gray-900 min-h-screen">
      <!-- Messages d'erreur/succès -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>
          <div class="ml-auto">
            <button @click="errorMessage = null" class="text-red-400 hover:text-red-600">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>
          <div class="ml-auto">
            <button @click="successMessage = null" class="text-green-400 hover:text-green-600">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="flex flex-col justify-between mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Couleurs et Tailles</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Gérez les couleurs et tailles disponibles pour vos produits
          </p>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="mb-8">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'colors'"
              :class="[
                activeTab === 'colors'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
              ]"
            >
              <div class="flex items-center">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Couleurs ({{ colors.length }})
              </div>
            </button>
            <button
              @click="activeTab = 'sizes'"
              :class="[
                activeTab === 'sizes'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
              ]"
            >
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4a1 1 0 011-1h4m6 0h4a1 1 0 011 1v4m0 6v4a1 1 0 01-1 1h-4m-6 0H4a1 1 0 01-1-1v-4" />
                </svg>
                Tailles ({{ sizes.length }})
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Colors Tab -->
      <div v-if="activeTab === 'colors'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Gestion des Couleurs</h2>
          <button
            @click="openColorModal"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle Couleur
          </button>
        </div>

        <!-- État de chargement pour les couleurs -->
        <div v-if="loadingColors" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-400">Chargement des couleurs...</span>
        </div>

        <!-- État vide pour les couleurs -->
        <div v-else-if="colors.length === 0" class="text-center py-12">
          <div class="mx-auto h-12 w-12 text-gray-400">
            <div class="w-12 h-12 bg-gradient-to-r from-red-400 to-blue-500 rounded-full"></div>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune couleur</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Commencez par créer votre première couleur.
          </p>
          <div class="mt-6">
            <button
              @click="openColorModal"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Créer une couleur
            </button>
          </div>
        </div>

        <!-- Grille des couleurs -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="color in colors"
            :key="color.id"
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-inner"
                  :style="{ backgroundColor: color.hex_code }"
                ></div>
                <div class="flex space-x-2">
                  <button
                    @click="editColor(color)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900 transition-colors duration-200"
                    title="Modifier"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDeleteColor(color.id)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900 transition-colors duration-200"
                    title="Supprimer"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {{ color.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {{ color.hex_code }}
                </p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {{ color.slug }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sizes Tab -->
      <div v-if="activeTab === 'sizes'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Gestion des Tailles</h2>
          <button
            @click="openSizeModal"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle Taille
          </button>
        </div>

        <!-- État de chargement pour les tailles -->
        <div v-if="loadingSizes" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-400">Chargement des tailles...</span>
        </div>

        <!-- État vide pour les tailles -->
        <div v-else-if="sizes.length === 0" class="text-center py-12">
          <div class="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-12 h-12">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4a1 1 0 011-1h4m6 0h4a1 1 0 011 1v4m0 6v4a1 1 0 01-1 1h-4m-6 0H4a1 1 0 01-1-1v-4" />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune taille</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Commencez par créer votre première taille.
          </p>
          <div class="mt-6">
            <button
              @click="openSizeModal"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Créer une taille
            </button>
          </div>
        </div>

        <!-- Tableau des tailles -->
        <div v-else class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Nom
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Slug
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Description
                  </th>
                  <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                <tr v-for="size in sizes" :key="size.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <span class="text-green-600 dark:text-green-400 text-sm font-medium">
                          {{ size.name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ size.name }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {{ size.slug }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {{ size.description || 'Aucune description' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        @click="editSize(size)"
                        class="inline-flex items-center p-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-800 transition-colors duration-200"
                        title="Modifier"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmDeleteSize(size.id)"
                        class="inline-flex items-center p-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 transition-colors duration-200"
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
        </div>
      </div>

      <!-- Modal Couleur -->
      <Modal v-if="showColorModal" @close="closeColorModal">
        <template #header>
          <div class="flex items-center">
            <div class="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
              <div class="w-4 h-4 bg-gradient-to-r from-red-400 to-blue-500 rounded-full"></div>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ isEditingColor ? 'Modifier la couleur' : 'Créer une nouvelle couleur' }}
            </h2>
          </div>
        </template>

        <template #body>
          <form @submit.prevent="saveColor" class="space-y-6">
            <div>
              <label for="color-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de la couleur <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="color-name"
                v-model="colorForm.name"
                @input="generateColorSlug"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                placeholder="Ex: Rouge, Bleu Marine, Vert Émeraude..."
              >
            </div>

            <div>
              <label for="color-slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="color-slug"
                v-model="colorForm.slug"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                placeholder="rouge-marine"
              >
            </div>

            <div>
              <label for="color-hex" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code couleur <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center space-x-3">
                <input
                  type="color"
                  id="color-picker"
                  v-model="colorForm.hex_code"
                  class="h-10 w-16 border border-gray-300 rounded-lg cursor-pointer"
                >
                <input
                  type="text"
                  id="color-hex"
                  v-model="colorForm.hex_code"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  placeholder="#FF0000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                >
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format: #RRGGBB (ex: #FF0000 pour rouge)
              </p>
            </div>

            <!-- Aperçu couleur -->
            <div v-if="colorForm.hex_code" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aperçu
              </label>
              <div class="flex items-center space-x-4">
                <div
                  class="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-inner"
                  :style="{ backgroundColor: colorForm.hex_code }"
                ></div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ colorForm.name || 'Nom de la couleur' }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ colorForm.hex_code }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                @click="closeColorModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loadingColors"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg v-if="loadingColors" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isEditingColor ? 'Mettre à jour' : 'Créer la couleur' }}
              </button>
            </div>
          </form>
        </template>
      </Modal>

      <!-- Modal Taille -->
      <Modal v-if="showSizeModal" @close="closeSizeModal">
        <template #header>
          <div class="flex items-center">
            <div class="flex-shrink-0 h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
              <svg class="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4a1 1 0 011-1h4m6 0h4a1 1 0 011 1v4m0 6v4a1 1 0 01-1 1h-4m-6 0H4a1 1 0 01-1-1v-4" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ isEditingSize ? 'Modifier la taille' : 'Créer une nouvelle taille' }}
            </h2>
          </div>
        </template>

        <template #body>
          <form @submit.prevent="saveSize" class="space-y-6">
            <div>
              <label for="size-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de la taille <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="size-name"
                v-model="sizeForm.name"
                @input="generateSizeSlug"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                required
                placeholder="Ex: XS, S, M, L, XL, 36, 38, 40..."
              >
            </div>

            <div>
              <label for="size-slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="size-slug"
                v-model="sizeForm.slug"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                required
                placeholder="xs, s, m, l, xl..."
              >
            </div>

            <div>
              <label for="size-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="size-description"
                v-model="sizeForm.description"
                rows="3"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                placeholder="Décrivez cette taille (optionnel)..."
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                @click="closeSizeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loadingSizes"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg v-if="loadingSizes" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isEditingSize ? 'Mettre à jour' : 'Créer la taille' }}
              </button>
            </div>
          </form>
        </template>
      </Modal>

      <!-- Modal de confirmation de suppression -->
      <Modal v-if="showDeleteModal" @close="closeDeleteModal">
        <template #header>
          <div class="flex items-center">
            <div class="flex-shrink-0 h-8 w-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
              <svg class="h-4 w-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h2>
          </div>
        </template>

        <template #body>
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer {{ deleteType === 'color' ? 'cette couleur' : 'cette taille' }} ?
              Cette action est irréversible et pourrait affecter les produits existants.
            </p>

            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-700 dark:text-yellow-200">
                    <strong>Attention :</strong> Cette action pourrait affecter les variantes de produits existantes.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                @click="closeDeleteModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                @click="deleteItem"
                :disabled="loadingColors || loadingSizes"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg v-if="loadingColors || loadingSizes" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </template>
      </Modal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import Modal from '@/components/ui/Modal.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import { TrashIcon } from '@/icons'
import { useColorsStore } from '@/stores/colors'
import { useSizesStore } from '@/stores/sizes'

const currentPageTitle = ref("Couleurs et Tailles")

// Stores
const colorsStore = useColorsStore()
const sizesStore = useSizesStore()

// États locaux pour l'UI
const activeTab = ref('colors')
const successMessage = ref(null)

// Modals
const showColorModal = ref(false)
const showSizeModal = ref(false)
const showDeleteModal = ref(false)
const isEditingColor = ref(false)
const isEditingSize = ref(false)
const deleteType = ref(null) // 'color' ou 'size'
const itemToDelete = ref(null)

// Formulaires
const colorForm = ref({
  id: null,
  name: '',
  slug: '',
  hex_code: '#000000'
})

const sizeForm = ref({
  id: null,
  name: '',
  slug: '',
  description: ''
})

// Computed properties pour accéder aux données des stores
const colors = computed(() => colorsStore.colors)
const sizes = computed(() => sizesStore.sizes)
const loadingColors = computed(() => colorsStore.loading)
const loadingSizes = computed(() => sizesStore.loading)
const errorMessage = computed(() => colorsStore.errorMessage || sizesStore.errorMessage)

// Utilitaires pour les messages
const showSuccess = (message) => {
  successMessage.value = message
  setTimeout(() => successMessage.value = null, 5000)
}

const clearErrors = () => {
  colorsStore.clearError()
  sizesStore.clearError()
}

// Génération automatique des slugs
const generateColorSlug = () => {
  if (colorForm.value.name && !isEditingColor.value) {
    colorForm.value.slug = colorsStore.generateSlug(colorForm.value.name)
  }
}

const generateSizeSlug = () => {
  if (sizeForm.value.name && !isEditingSize.value) {
    sizeForm.value.slug = sizesStore.generateSlug(sizeForm.value.name)
  }
}

// ========== MÉTHODES POUR LES COULEURS ==========

const openColorModal = () => {
  isEditingColor.value = false
  colorForm.value = {
    id: null,
    name: '',
    slug: '',
    hex_code: '#000000'
  }
  showColorModal.value = true
}

const editColor = (color) => {
  isEditingColor.value = true
  colorForm.value = { ...color }
  showColorModal.value = true
}

const saveColor = async () => {
  try {
    clearErrors()

    const colorData = {
      name: colorForm.value.name.trim(),
      hex_code: colorForm.value.hex_code.toUpperCase()
    }

    if (isEditingColor.value) {
      await colorsStore.updateColor(colorForm.value.id, colorData)
      showSuccess('Couleur mise à jour avec succès')
    } else {
      await colorsStore.createColor(colorData)
      showSuccess('Couleur créée avec succès')
    }

    closeColorModal()
  } catch (error) {
    // L'erreur est déjà gérée par le store
    console.error('Erreur lors de la sauvegarde de la couleur:', error)
  }
}

const closeColorModal = () => {
  showColorModal.value = false
  isEditingColor.value = false
  colorForm.value = {
    id: null,
    name: '',
    slug: '',
    hex_code: '#000000'
  }
}

const confirmDeleteColor = (id) => {
  deleteType.value = 'color'
  itemToDelete.value = id
  showDeleteModal.value = true
}

// ========== MÉTHODES POUR LES TAILLES ==========

const openSizeModal = () => {
  isEditingSize.value = false
  sizeForm.value = {
    id: null,
    name: '',
    slug: '',
    description: ''
  }
  showSizeModal.value = true
}

const editSize = (size) => {
  isEditingSize.value = true
  sizeForm.value = { ...size }
  showSizeModal.value = true
}

const saveSize = async () => {
  try {
    clearErrors()

    const sizeData = {
      name: sizeForm.value.name.trim(),
      slug: sizeForm.value.slug.trim() || sizesStore.generateSlug(sizeForm.value.name),
      description: sizeForm.value.description?.trim() || null
    }

    if (isEditingSize.value) {
      await sizesStore.updateSize(sizeForm.value.id, sizeData)
      showSuccess('Taille mise à jour avec succès')
    } else {
      await sizesStore.createSize(sizeData)
      showSuccess('Taille créée avec succès')
    }

    closeSizeModal()
  } catch (error) {
    // L'erreur est déjà gérée par le store
    console.error('Erreur lors de la sauvegarde de la taille:', error)
  }
}

const closeSizeModal = () => {
  showSizeModal.value = false
  isEditingSize.value = false
  sizeForm.value = {
    id: null,
    name: '',
    slug: '',
    description: ''
  }
}

const confirmDeleteSize = (id) => {
  deleteType.value = 'size'
  itemToDelete.value = id
  showDeleteModal.value = true
}

// ========== SUPPRESSION GÉNÉRIQUE ==========

const deleteItem = async () => {
  try {
    clearErrors()

    if (deleteType.value === 'color') {
      await colorsStore.deleteColor(itemToDelete.value)
      showSuccess('Couleur supprimée avec succès')
    } else if (deleteType.value === 'size') {
      await sizesStore.deleteSize(itemToDelete.value)
      showSuccess('Taille supprimée avec succès')
    }

    closeDeleteModal()
  } catch (error) {
    // L'erreur est déjà gérée par le store
    console.error('Erreur lors de la suppression:', error)
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteType.value = null
  itemToDelete.value = null
}

// ========== ACTIONS DE RAFRAÎCHISSEMENT ==========

const refreshColors = async () => {
  try {
    await colorsStore.fetchColors()
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des couleurs:', error)
  }
}

const refreshSizes = async () => {
  try {
    await sizesStore.fetchSizes()
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des tailles:', error)
  }
}

const refreshAll = async () => {
  await Promise.all([refreshColors(), refreshSizes()])
}

// ========== MÉTHODES UTILITAIRES ==========

// Statistiques rapides
const colorStats = computed(() => colorsStore.getColorStats)
const sizeStats = computed(() => sizesStore.getSizeStats)

// Fonctions de recherche (pour usage futur)
const searchColors = (query) => colorsStore.searchColors(query)
const searchSizes = (query) => sizesStore.searchSizes(query)

// Validation en temps réel
const isColorFormValid = computed(() => {
  return colorForm.value.name.trim() &&
         colorForm.value.hex_code.match(/^#[0-9A-Fa-f]{6}$/)
})

const isSizeFormValid = computed(() => {
  return sizeForm.value.name.trim()
})

// ========== INITIALISATION ==========

onMounted(async () => {
  // Charger les données depuis les stores
  try {
    await Promise.all([
      colorsStore.fetchColors(),
      sizesStore.fetchSizes()
    ])
  } catch (error) {
    console.error('Erreur lors du chargement initial:', error)
  }
})

// ========== NETTOYAGE ==========

// Nettoyer les erreurs quand on change d'onglet
const switchTab = (tab) => {
  activeTab.value = tab
  clearErrors()
  successMessage.value = null
}

// Exposer les méthodes et données pour le template
defineExpose({
  // Données
  colors,
  sizes,
  colorStats,
  sizeStats,

  // Actions
  refreshColors,
  refreshSizes,
  refreshAll,
  searchColors,
  searchSizes,

  // Validation
  isColorFormValid,
  isSizeFormValid
})
</script>
