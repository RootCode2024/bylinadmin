<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8">
      <!-- Header avec indicateur de progression -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ currentPageTitle }}</h1>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">Étape {{ currentStepNumber }} sur {{ tabs.length }}</span>
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Navigation par étapes -->
        <div class="flex items-center space-x-4">
          <div
            v-for="(tab, index) in tabs"
            :key="tab.id"
            class="flex items-center"
          >
            <div
              :class="{
                'bg-blue-600 text-white': activeTab === tab.id,
                'bg-green-600 text-white': isTabCompleted(tab.id),
                'bg-gray-300 text-gray-600': !isTabCompleted(tab.id) && activeTab !== tab.id
              }"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
            >
              <CheckIcon v-if="isTabCompleted(tab.id)" class="w-4 h-4" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span
              :class="{
                'text-blue-600 font-medium': activeTab === tab.id,
                'text-green-600': isTabCompleted(tab.id),
                'text-gray-500': !isTabCompleted(tab.id) && activeTab !== tab.id
              }"
              class="ml-2 text-sm transition-colors"
            >
              {{ tab.label }}
            </span>
            <ChevronRightIcon
              v-if="index < tabs.length - 1"
              class="w-4 h-4 text-gray-400 ml-4"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg dark:bg-gray-800 overflow-hidden">
        <!-- Alerte de validation -->
        <div
          v-if="validationErrors.length > 0"
          class="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
        >
          <div class="flex">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Veuillez corriger les erreurs suivantes :
              </h3>
              <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Sauvegarde automatique -->
        <div
          v-if="autoSaveStatus"
          :class="{
            'bg-green-50 border-green-200 text-green-700': autoSaveStatus === 'saved',
            'bg-yellow-50 border-yellow-200 text-yellow-700': autoSaveStatus === 'saving',
            'bg-red-50 border-red-200 text-red-700': autoSaveStatus === 'error'
          }"
          class="border-l-4 p-3 text-sm"
        >
          <div class="flex items-center">
            <SpinnerIcon v-if="autoSaveStatus === 'saving'" class="w-4 h-4 mr-2 animate-spin" />
            <CheckCircleIcon v-else-if="autoSaveStatus === 'saved'" class="w-4 h-4 mr-2" />
            <ExclamationCircleIcon v-else class="w-4 h-4 mr-2" />
            <span>
              {{ autoSaveMessages[autoSaveStatus] }}
            </span>
          </div>
        </div>

        <!-- Formulaire principal -->
        <form @submit.prevent="submitForm" novalidate class="p-8">
          <!-- Onglet Informations de base -->
          <div v-show="activeTab === 'info'" class="space-y-8">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <!-- Nom du produit -->
              <div class="lg:col-span-2">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Nom du produit <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="product.name"
                  type="text"
                  required
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: T-shirt en coton bio..."
                >
                <p class="mt-1 text-sm text-gray-500">Le slug sera généré automatiquement</p>
              </div>

              <!-- Type et Genre -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Type de produit <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="product.type"
                  required
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="new">🆕 Neuf</option>
                  <option value="vintage">🕰️ Vintage</option>
                  <option value="byl_in_clothing">👕 Bylin</option>
                </select>
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Genre <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="product.gender"
                  required
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="man">👨 Homme</option>
                  <option value="woman">👩 Femme</option>
                  <option value="unisex">👫 Unisexe</option>
                  <option value="child">🧒 Enfant</option>
                </select>
              </div>

              <!-- Marque et Catégorie -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Marque
                </label>
                <div class="relative">
                  <select
                    v-model="product.brand_id"
                    class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option :value="null">Aucune marque</option>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                      {{ brand.name }}
                    </option>
                  </select>
                  <button
                    type="button"
                    @click="showCreateBrandModal = true"
                    class="absolute right-2 top-2 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                  >
                    Nouvelle
                  </button>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Catégorie <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="product.category_id"
                    required
                    class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option :value="null">Sélectionner une catégorie</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                  <button
                    type="button"
                    @click="showCreateCategoryModal = true"
                    class="absolute right-2 top-2 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                  >
                    Nouvelle
                  </button>
                </div>
              </div>
            </div>

            <!-- Descriptions -->
            <div class="space-y-6">
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Description courte <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="product.short_description"
                  rows="3"
                  required
                  maxlength="255"
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Description accrocheuse pour la liste des produits..."
                ></textarea>
                <div class="flex justify-between mt-1">
                  <p class="text-sm text-gray-500">Visible dans les listes de produits</p>
                  <span class="text-sm text-gray-400">
                    {{ product.short_description?.length || 0 }}/255
                  </span>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Description complète <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="product.full_description"
                  rows="6"
                  required
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Description détaillée du produit, ses caractéristiques, son histoire..."
                ></textarea>
                <p class="mt-1 text-sm text-gray-500">Description détaillée visible sur la page produit</p>
              </div>
            </div>

            <!-- Options produit -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Options du produit</h3>
              <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <label class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input v-model="product.is_featured" type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-3 text-sm font-medium text-gray-900 dark:text-white">⭐ Produit vedette</span>
                </label>

                <label class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input v-model="product.is_trending" type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-3 text-sm font-medium text-gray-900 dark:text-white">🔥 Tendance</span>
                </label>

                <label class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input v-model="product.is_preorder" type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-3 text-sm font-medium text-gray-900 dark:text-white">📅 Précommande</span>
                </label>

                <label class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input v-model="product.is_flash_sale" type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-3 text-sm font-medium text-gray-900 dark:text-white">⚡ Vente flash</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Onglet Prix et Stock -->
          <div v-show="activeTab === 'price'" class="space-y-8">
            <!-- Calculateur de prix -->
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">💰 Calculateur de prix</h3>
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div>
                  <label class="block mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                    Prix de vente <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">F CFA</span>
                    <input
                      v-model.number="product.price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      class="w-full pl-16 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      @input="calculateMargin"
                    >
                  </div>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                    Prix réduit
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">F CFA</span>
                    <input
                      v-model.number="product.discounted_price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full pl-16 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      @input="calculateDiscount"
                    >
                  </div>
                  <p v-if="discountPercentage" class="mt-1 text-sm text-blue-600">
                    Remise de {{ discountPercentage }}%
                  </p>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                    Prix de revient
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">F CFA</span>
                    <input
                      v-model.number="product.cost_price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full pl-16 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      @input="calculateMargin"
                    >
                  </div>
                  <p v-if="profitMargin" class="mt-1 text-sm" :class="profitMargin > 50 ? 'text-green-600' : 'text-orange-600'">
                    Marge: {{ profitMargin }}%
                  </p>
                </div>
              </div>
            </div>

            <!-- Dates pour précommande -->
            <div v-if="product.is_preorder" class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <h3 class="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-4">📅 Configuration précommande</h3>
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label class="block mb-2 text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Date limite de précommande
                  </label>
                  <input
                    v-model="product.preorder_deadline"
                    type="date"
                    :min="today"
                    class="w-full p-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  >
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Date d'expédition prévue
                  </label>
                  <input
                    v-model="product.expected_ship_date"
                    type="date"
                    :min="product.preorder_deadline || today"
                    class="w-full p-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Onglet Détails produit -->
          <div v-show="activeTab === 'details'" class="space-y-8">
            <!-- Caractéristiques principales -->
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <h3 class="text-lg font-medium text-purple-900 dark:text-purple-100 mb-4">🏷️ Caractéristiques principales</h3>
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label class="block mb-2 text-sm font-medium text-purple-900 dark:text-purple-100">
                    Matériau <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="product.material"
                    type="text"
                    required
                    list="materials"
                    class="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Ex: 100% Coton bio"
                  >
                  <datalist id="materials">
                    <option value="100% Coton" />
                    <option value="100% Coton bio" />
                    <option value="Polyester" />
                    <option value="Coton/Polyester" />
                    <option value="Laine" />
                    <option value="Soie" />
                    <option value="Lin" />
                  </datalist>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-purple-900 dark:text-purple-100">
                    Saison <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="product.season"
                    required
                    class="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="">Sélectionner une saison</option>
                    <option value="printemps">🌸 Printemps</option>
                    <option value="été">☀️ Été</option>
                    <option value="automne">🍂 Automne</option>
                    <option value="hiver">❄️ Hiver</option>
                    <option value="toute_saison">🔄 Toute saison</option>
                  </select>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-purple-900 dark:text-purple-100">
                    Poids (grammes) <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="product.weight_grams"
                    type="number"
                    min="0"
                    required
                    class="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Ex: 250"
                  >
                  <p class="mt-1 text-sm text-purple-600">Important pour le calcul des frais de port</p>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-purple-900 dark:text-purple-100">
                    Pays d'origine <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="product.country_of_origin"
                    type="text"
                    required
                    list="countries"
                    class="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Ex: Bénin"
                  >
                  <datalist id="countries">
                    <option value="Bénin" />
                    <option value="Côte d'ivoire" />
                    <option value="France" />
                    <option value="Togo" />
                    <option value="Italie" />
                    <option value="Portugal" />
                    <option value="Espagne" />
                    <option value="Turquie" />
                    <option value="Chine" />
                    <option value="Bangladesh" />
                    <option value="Vietnam" />
                  </datalist>
                </div>

                <div v-if="product.type === 'vintage'" class="lg:col-span-2">
                  <label class="block mb-2 text-sm font-medium text-purple-900 dark:text-purple-100">
                    Année vintage
                  </label>
                  <input
                    v-model.number="product.vintage_year"
                    type="number"
                    min="1900"
                    :max="new Date().getFullYear()"
                    class="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Ex: 1995"
                  >
                </div>
              </div>
            </div>

            <!-- Instructions d'entretien -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Instructions d'entretien <span class="text-red-500">*</span>
              </label>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  <button
                    v-for="instruction in careInstructionTemplates"
                    :key="instruction"
                    type="button"
                    @click="addCareInstruction(instruction)"
                    class="p-2 text-sm bg-white dark:bg-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                  >
                    {{ instruction }}
                  </button>
                </div>
              </div>
              <textarea
                v-model="product.care_instructions"
                rows="4"
                required
                class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: Lavage en machine à 30°C, séchage à l'air libre, repassage à température moyenne..."
              ></textarea>
            </div>

            <!-- Dimensions -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Dimensions <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-4">
                <div>
                  <label class="block mb-1 text-xs text-gray-500">Largeur (cm) <span class="text-red-500">*</span></label>
                  <input
                    v-model.number="dimensionsInput.width"
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    class="w-full p-2 border rounded-lg"
                    placeholder="Ex: 50"
                  >
                </div>
                <div>
                  <label class="block mb-1 text-xs text-gray-500">Hauteur (cm) <span class="text-red-500">*</span></label>
                  <input
                    v-model.number="dimensionsInput.height"
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    class="w-full p-2 border rounded-lg"
                    placeholder="Ex: 70"
                  >
                </div>
                <div>
                  <label class="block mb-1 text-xs text-gray-500">Profondeur (cm) <span class="text-red-500">*</span></label>
                  <input
                    v-model.number="dimensionsInput.depth"
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    class="w-full p-2 border rounded-lg"
                    placeholder="Ex: 2"
                  >
                </div>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  JSON généré: {{ dimensionsJsonPreview }}
                </p>
              </div>
            </div>

            <!-- Date de sortie -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Date de sortie
              </label>
              <input
                v-model="product.release_date"
                type="date"
                class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
              <p class="mt-1 text-sm text-gray-500">Date à laquelle le produit sera disponible</p>
            </div>
          </div>

          <!-- Onglet Variantes (Couleurs et Tailles) -->
          <div v-show="activeTab === 'variants'" class="space-y-8">
            <!-- Alerte si pas d'images -->
            <div v-if="product.images.length === 0" class="bg-amber-50 border-l-4 border-amber-400 p-4">
              <div class="flex">
                <ExclamationTriangleIcon class="h-5 w-5 text-amber-400" />
                <div class="ml-3">
                  <p class="text-sm text-amber-700">
                    <strong>Aucune image disponible.</strong>
                    Retournez à l'étape "Images" pour ajouter des images avant de configurer les variantes.
                  </p>
                  <button
                    type="button"
                    @click="activeTab = 'images'"
                    class="mt-2 text-sm text-amber-800 underline hover:text-amber-900"
                  >
                    Aller à l'étape Images →
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
              <h3 class="text-lg font-medium text-indigo-900 dark:text-indigo-100 mb-4">🎨 Variantes du produit</h3>
              <p class="text-sm text-indigo-700 dark:text-indigo-200 mb-6">
                Définissez les différentes combinaisons de couleurs et tailles disponibles pour ce produit.
                {{ product.images.length > 0 ? `Vous avez ${product.images.length} image(s) disponible(s) pour les associer aux variantes.` : '' }}
              </p>

              <!-- Actions rapides -->
              <div class="flex flex-wrap gap-4 mb-6">
                <button
                  type="button"
                  @click="showVariantModal = true"
                  class="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PlusIcon class="w-4 h-4 mr-2" />
                  Ajouter une variante
                </button>
                <button
                  type="button"
                  @click="generateAllVariants"
                  :disabled="!availableColors.length || !availableSizes.length"
                  class="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SparklesIcon class="w-4 h-4 mr-2" />
                  Générer toutes les combinaisons
                </button>
                <button
                  type="button"
                  @click="clearAllVariants"
                  :disabled="!product.variants.length"
                  class="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <TrashIcon class="w-4 h-4 mr-2" />
                  Vider toutes les variantes
                </button>
              </div>

              <!-- Résumé des couleurs et tailles disponibles -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-900 dark:text-white">Couleurs disponibles</h4>
                    <span class="text-sm text-gray-500">{{ availableColors.length }} couleurs</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="color in availableColors"
                      :key="color.id"
                      class="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2"
                    >
                      <div
                        class="w-4 h-4 rounded-full border border-gray-300"
                        :style="{ backgroundColor: color.hex_code }"
                      ></div>
                      <span class="text-xs text-gray-700 dark:text-gray-300">{{ color.name }}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="$router.push({ name: 'attributes' })"
                    class="mt-3 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Gérer les couleurs →
                  </button>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-900 dark:text-white">Tailles disponibles</h4>
                    <span class="text-sm text-gray-500">{{ availableSizes.length }} tailles</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="size in availableSizes"
                      :key="size.id"
                      class="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1"
                    >
                      <span class="text-xs text-gray-700 dark:text-gray-300">{{ size.name }}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="$router.push({ name: 'attributes' })"
                    class="mt-3 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Gérer les tailles →
                  </button>
                </div>
              </div>
            </div>

            <!-- Liste des variantes -->
            <div v-if="product.variants.length > 0" class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white">
                  Variantes configurées ({{ product.variants.length }})
                </h4>
                <div class="text-sm text-gray-500">
                  Stock total: {{ totalStock }} unités
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Couleur
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Taille
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code-barres
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image principale
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      <tr
                        v-for="(variant, index) in product.variants"
                        :key="`${variant.color_id}-${variant.size_id}`"
                        class="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div
                              class="w-6 h-6 rounded-full border border-gray-300 mr-3"
                              :style="{ backgroundColor: getColorById(variant.color_id)?.hex_code || '#000' }"
                            ></div>
                            <span class="text-sm text-gray-900 dark:text-white">
                              {{ getColorById(variant.color_id)?.name || 'Couleur inconnue' }}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {{ getSizeById(variant.size_id)?.name || 'Taille inconnue' }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <input
                            v-model.number="variant.stock_quantity"
                            type="number"
                            min="0"
                            class="w-20 px-2 py-1 text-sm border rounded"
                          >
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <input
                            v-model="variant.barcode"
                            type="text"
                            class="w-32 px-2 py-1 text-sm border rounded"
                            placeholder="Auto-généré"
                          >
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center space-x-2">
                            <select
                              v-model="variant.main_image_index"
                              class="w-24 px-2 py-1 text-sm border rounded"
                              :disabled="product.images.length === 0"
                            >
                              <option :value="null">Défaut</option>
                              <option
                                v-for="(image, imgIndex) in product.images"
                                :key="imgIndex"
                                :value="imgIndex"
                              >
                                Image {{ imgIndex + 1 }}
                              </option>
                            </select>
                            <!-- Aperçu miniature de l'image sélectionnée -->
                            <div
                              v-if="variant.main_image_index !== null && product.images[variant.main_image_index]"
                              class="w-8 h-8 rounded border border-gray-300 overflow-hidden"
                            >
                              <img
                                :src="getImagePreview(product.images[variant.main_image_index])"
                                alt="Aperçu"
                                class="w-full h-full object-cover"
                              >
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            @click="removeVariant(index)"
                            class="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <TrashIcon class="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- État vide -->
            <div v-else class="text-center py-12">
              <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
                <SwatchIcon class="w-12 h-12" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune variante configurée</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Ajoutez des combinaisons de couleurs et tailles pour ce produit
              </p>
              <button
                type="button"
                @click="showVariantModal = true"
                class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon class="w-4 h-4 mr-2" />
                Ajouter votre première variante
              </button>
            </div>
          </div>

          <!-- Onglet Images -->
          <div v-show="activeTab === 'images'" class="space-y-8">
            <div class="text-center py-8">
              <div class="mb-6">
                <CloudArrowUpIcon class="mx-auto h-16 w-16 text-gray-400" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Images du produit</h3>
                <p class="text-sm text-gray-500">
                  Ajoutez des images de haute qualité pour présenter votre produit
                </p>
              </div>

              <ImageUploader v-model="product.images" />

              <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Conseils pour les images</h4>
                <ul class="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>• Utilisez des images d'au moins 1200x1200 pixels</li>
                  <li>• La première image sera utilisée comme image principale</li>
                  <li>• Ajoutez plusieurs angles de vue</li>
                  <li>• Montrez les détails importants (matière, finitions, etc.)</li>
                  <li>• Vous pourrez assigner des images spécifiques aux variantes</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Boutons de navigation -->
          <div class="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              v-if="activeTab !== 'info'"
              @click="prevTab"
              type="button"
              class="flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <ChevronLeftIcon class="w-4 h-4 mr-2" />
              Précédent
            </button>
            <div v-else></div>

            <div class="flex items-center space-x-4">
              <button
                type="button"
                @click="saveDraft"
                :disabled="isSavingDraft"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <span v-if="isSavingDraft">Sauvegarde...</span>
                <span v-else>💾 Sauvegarder le brouillon</span>
              </button>

              <button
                v-if="activeTab !== 'variants'"
                @click="nextTab"
                type="button"
                class="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all"
              >
                Suivant
                <ChevronRightIcon class="w-4 h-4 ml-2" />
              </button>
              <button
                v-else
                type="submit"
                class="flex items-center px-8 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <SpinnerIcon class="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </span>
                <span v-else class="flex items-center">
                  <CheckIcon class="w-4 h-4 mr-2" />
                  Créer le produit
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal pour ajouter une variante -->
    <Modal v-if="showVariantModal" @close="closeVariantModal">
      <template #header>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Ajouter une variante
        </h2>
      </template>
      <template #body>
        <form @submit.prevent="addVariant" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Couleur <span class="text-red-500">*</span>
              </label>
              <select
                v-model="newVariant.color_id"
                required
                class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une couleur</option>
                <option
                  v-for="color in availableColors"
                  :key="color.id"
                  :value="color.id"
                  :disabled="isVariantExists(color.id, newVariant.size_id)"
                >
                  {{ color.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Taille <span class="text-red-500">*</span>
              </label>
              <select
                v-model="newVariant.size_id"
                required
                class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une taille</option>
                <option
                  v-for="size in availableSizes"
                  :key="size.id"
                  :value="size.id"
                  :disabled="isVariantExists(newVariant.color_id, size.id)"
                >
                  {{ size.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantité en stock <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="newVariant.stock_quantity"
                type="number"
                min="0"
                required
                class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 10"
              >
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Code-barres
              </label>
              <input
                v-model="newVariant.barcode"
                type="text"
                class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Laissez vide pour génération automatique"
              >
            </div>

            <div class="lg:col-span-2">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Image principale pour cette variante
              </label>
              <div class="space-y-3">
                <select
                  v-model="newVariant.main_image_index"
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :disabled="product.images.length === 0"
                >
                  <option :value="null">Utiliser l'image par défaut du produit</option>
                  <option
                    v-for="(image, index) in product.images"
                    :key="index"
                    :value="index"
                  >
                    Image {{ index + 1 }}
                  </option>
                </select>

                <!-- Aperçu de l'image sélectionnée -->
                <div
                  v-if="newVariant.main_image_index !== null && product.images[newVariant.main_image_index]"
                  class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div class="w-16 h-16 rounded border border-gray-300 overflow-hidden">
                    <img
                      :src="getImagePreview(product.images[newVariant.main_image_index])"
                      alt="Aperçu"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div class="text-sm text-gray-600">
                    Aperçu de l'image qui sera associée à cette variante
                  </div>
                </div>

                <!-- Message si aucune image -->
                <div v-if="product.images.length === 0" class="p-3 bg-amber-50 rounded-lg">
                  <p class="text-sm text-amber-700">
                    Aucune image disponible. Ajoutez des images à l'étape précédente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeVariantModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="!newVariant.color_id || !newVariant.size_id || isVariantExists(newVariant.color_id, newVariant.size_id)"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter la variante
            </button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Modales pour création rapide -->
    <QuickCreateModal
      v-if="showCreateBrandModal"
      :show="showCreateBrandModal"
      title="Créer une nouvelle marque"
      @close="showCreateBrandModal = false"
      @created="handleBrandCreated"
    />

    <QuickCreateModal
      v-if="showCreateCategoryModal"
      :show="showCreateCategoryModal"
      title="Créer une nouvelle catégorie"
      @close="showCreateCategoryModal = false"
      @created="handleCategoryCreated"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import ImageUploader from '@/components/products/ImageUploader.vue'
import QuickCreateModal from '@/components/common/QuickCreateModal.vue'
import Modal from '@/components/ui/Modal.vue'
import { useColorsStore } from '@/stores/colors'
import { useSizesStore } from '@/stores/sizes'
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon as SpinnerIcon,
  CloudArrowUpIcon,
  PlusIcon,
  TrashIcon,
  SwatchIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import api from '@/api/axiosConfig'

const route = useRoute()
const router = useRouter()

// Stores
const colorsStore = useColorsStore()
const sizesStore = useSizesStore()

const currentPageTitle = ref('Ajouter un produit')

// Configuration des onglets
const tabs = [
  { id: 'info', label: 'Informations de base' },
  { id: 'price', label: 'Prix & Stock' },
  { id: 'details', label: 'Détails produit' },
  { id: 'images', label: 'Images' },
  { id: 'variants', label: 'Couleurs & Tailles' }
]
const activeTab = ref('info')

// États pour l'UX
const validationErrors = ref([])
const autoSaveStatus = ref(null)
const autoSaveMessages = {
  saving: 'Sauvegarde en cours...',
  saved: 'Brouillon sauvegardé automatiquement',
  error: 'Erreur lors de la sauvegarde automatique'
}
const showCreateBrandModal = ref(false)
const showCreateCategoryModal = ref(false)
const isSavingDraft = ref(false)
const showVariantModal = ref(false)

// Données du produit
const product = ref({
  // Identification & Catégorisation
  name: '',
  type: 'new',
  category_id: null,
  brand_id: null,
  gender: 'unisex',

  // Stock & Précommande
  is_preorder: false,
  preorder_deadline: null,
  expected_ship_date: null,

  // Prix
  price: 0,
  discounted_price: null,
  cost_price: null,
  is_flash_sale: false,

  // Descriptions
  short_description: '',
  full_description: '',

  // Détails produit
  material: '',
  care_instructions: '',
  season: '',
  weight_grams: 0,
  dimensions: {},
  country_of_origin: '',

  // Visibilité
  is_featured: false,
  is_trending: false,

  // Dates
  release_date: null,
  vintage_year: null,

  // Images et variantes
  images: [],
  variants: []
})

const isSubmitting = ref(false)
const brands = ref([])
const categories = ref([])

// Nouvelle variante
const newVariant = ref({
  color_id: '',
  size_id: '',
  stock_quantity: 0,
  barcode: '',
  main_image_index: null
})

// Templates pour instructions d'entretien
const careInstructionTemplates = [
  'Lavage 30°C',
  'Lavage à la main',
  'Séchage à l\'air libre',
  'Pas de sèche-linge',
  'Repassage doux',
  'Nettoyage à sec',
  'Ne pas javelliser',
  'Séchage à plat'
]

// Gestion des dimensions
const dimensionsInput = ref({
  width: null,
  height: null,
  depth: null
})

// Computed properties
const availableColors = computed(() => colorsStore.colors)
const availableSizes = computed(() => sizesStore.sizes)

const currentStepNumber = computed(() => {
  return tabs.findIndex(tab => tab.id === activeTab.value) + 1
})

const progressPercentage = computed(() => {
  return (currentStepNumber.value / tabs.length) * 100
})

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const discountPercentage = computed(() => {
  if (product.value.price && product.value.discounted_price) {
    const discount = ((product.value.price - product.value.discounted_price) / product.value.price * 100).toFixed(0)
    return discount > 0 ? discount : null
  }
  return null
})

const profitMargin = computed(() => {
  if (product.value.price && product.value.cost_price) {
    const margin = ((product.value.price - product.value.cost_price) / product.value.price * 100).toFixed(0)
    return margin > 0 ? margin : null
  }
  return null
})

const dimensionsJsonPreview = computed(() => {
  const dims = {}
  if (dimensionsInput.value.width) dims.width = dimensionsInput.value.width
  if (dimensionsInput.value.height) dims.height = dimensionsInput.value.height
  if (dimensionsInput.value.depth) dims.depth = dimensionsInput.value.depth
  return dims
})

const totalStock = computed(() => {
  return product.value.variants.reduce((total, variant) => total + (variant.stock_quantity || 0), 0)
})

// Méthodes utilitaires pour couleurs et tailles
const getColorById = (id) => {
  return availableColors.value.find(color => color.id == id)
}

const getSizeById = (id) => {
  return availableSizes.value.find(size => size.id == id)
}

const getImagePreview = (file) => {
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return file // Si c'est déjà une URL
}

const isVariantExists = (colorId, sizeId) => {
  if (!colorId || !sizeId) return false
  return product.value.variants.some(v => v.color_id == colorId && v.size_id == sizeId)
}

// Méthodes de gestion des variantes
const addVariant = () => {
  if (isVariantExists(newVariant.value.color_id, newVariant.value.size_id)) {
    alert('Cette combinaison couleur/taille existe déjà')
    return
  }

  product.value.variants.push({
    color_id: parseInt(newVariant.value.color_id),
    size_id: parseInt(newVariant.value.size_id),
    stock_quantity: newVariant.value.stock_quantity || 0,
    barcode: newVariant.value.barcode || '',
    main_image_index: newVariant.value.main_image_index
  })

  closeVariantModal()
}

const removeVariant = (index) => {
  product.value.variants.splice(index, 1)
}

const generateAllVariants = () => {
  if (confirm('Cela va remplacer toutes les variantes existantes. Continuer ?')) {
    product.value.variants = []

    availableColors.value.forEach(color => {
      availableSizes.value.forEach(size => {
        product.value.variants.push({
          color_id: color.id,
          size_id: size.id,
          stock_quantity: 0,
          barcode: '',
          main_image_index: null
        })
      })
    })
  }
}

const clearAllVariants = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer toutes les variantes ?')) {
    product.value.variants = []
  }
}

const closeVariantModal = () => {
  showVariantModal.value = false
  newVariant.value = {
    color_id: '',
    size_id: '',
    stock_quantity: 0,
    barcode: '',
    main_image_index: null
  }
}

// Méthodes pour l'UX
const isTabCompleted = (tabId) => {
  switch (tabId) {
    case 'info':
      return product.value.name && product.value.category_id && product.value.short_description && product.value.full_description
    case 'price':
      return product.value.price > 0
    case 'details':
      return product.value.material && product.value.care_instructions && product.value.season &&
             product.value.country_of_origin && product.value.weight_grams > 0 &&
             Object.keys(product.value.dimensions).length > 0
    case 'images':
      return product.value.images && product.value.images.length > 0
    case 'variants':
      return product.value.variants.length > 0
    default:
      return false
  }
}

const addCareInstruction = (instruction) => {
  const current = product.value.care_instructions
  if (current && !current.includes(instruction)) {
    product.value.care_instructions = current + (current.endsWith('.') ? ' ' : '. ') + instruction + '.'
  } else if (!current) {
    product.value.care_instructions = instruction + '.'
  }
}

const calculateDiscount = () => {
  // Calculé automatiquement par le computed discountPercentage
}

const calculateMargin = () => {
  // Calculé automatiquement par le computed profitMargin
}

// Génération automatique du slug
watch(() => product.value.name, (newName) => {
  if (newName) {
    product.value.slug = newName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
})

// Mise à jour des dimensions
watch(dimensionsInput, (newDimensions) => {
  product.value.dimensions = { ...dimensionsJsonPreview.value }
}, { deep: true })

// Sauvegarde automatique
let autoSaveTimeout = null
watch(product, () => {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(() => {
    autoSaveDraft()
  }, 30000)
}, { deep: true })

const autoSaveDraft = async () => {
  if (!product.value.name) return

  try {
    autoSaveStatus.value = 'saved'
    setTimeout(() => {
      autoSaveStatus.value = null
    }, 3000)
  } catch (error) {
    autoSaveStatus.value = 'error'
    setTimeout(() => {
      autoSaveStatus.value = null
    }, 5000)
  }
}

const saveDraft = async () => {
  isSavingDraft.value = true
  await autoSaveDraft()
  isSavingDraft.value = false
}

// Charger les données nécessaires
const loadFormData = async () => {
  try {
    const [brandsRes, categoriesRes] = await Promise.all([
      api.get('/brands'),
      api.get('/categories'),
      colorsStore.fetchColors(),
      sizesStore.fetchSizes()
    ])

    brands.value = brandsRes.data?.data || brandsRes.data || []
    categories.value = categoriesRes.data?.data || categoriesRes.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
}

// Charger un produit à dupliquer
const loadProductToDuplicate = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`)
    const productData = response.data

    product.value = {
      ...productData,
      name: `${productData.name} (Copie)`,
      slug: `${productData.slug}-copy`,
      images: productData.images || [],
      variants: productData.variants || []
    }

    currentPageTitle.value = `Dupliquer: ${productData.name}`
  } catch (error) {
    console.error('Erreur lors du chargement du produit à dupliquer:', error)
  }
}

// Gestion des modales
const handleBrandCreated = (newBrand) => {
  brands.value.push(newBrand)
  product.value.brand_id = newBrand.id
  showCreateBrandModal.value = false
}

const handleCategoryCreated = (newCategory) => {
  categories.value.push(newCategory)
  product.value.category_id = newCategory.id
  showCreateCategoryModal.value = false
}

// Navigation entre onglets
const nextTab = () => {
  if (!validateCurrentTab()) return

  const currentIndex = tabs.findIndex(tab => tab.id === activeTab.value)
  if (currentIndex < tabs.length - 1) {
    activeTab.value = tabs[currentIndex + 1].id
  }
}

const prevTab = () => {
  const currentIndex = tabs.findIndex(tab => tab.id === activeTab.value)
  if (currentIndex > 0) {
    activeTab.value = tabs[currentIndex - 1].id
  }
}

// Validation par onglet
const validateCurrentTab = () => {
  validationErrors.value = []

  switch (activeTab.value) {
    case 'info':
      if (!product.value.name) validationErrors.value.push('Le nom du produit est requis')
      if (!product.value.category_id) validationErrors.value.push('La catégorie est requise')
      if (!product.value.short_description) validationErrors.value.push('La description courte est requise')
      if (!product.value.full_description) validationErrors.value.push('La description complète est requise')
      break
    case 'price':
      if (product.value.price <= 0) validationErrors.value.push('Le prix doit être supérieur à 0')
      if (product.value.discounted_price && product.value.discounted_price >= product.value.price) {
        validationErrors.value.push('Le prix réduit doit être inférieur au prix normal')
      }
      break
    case 'details':
      if (!product.value.material) validationErrors.value.push('Le matériau est requis')
      if (!product.value.care_instructions) validationErrors.value.push('Les instructions d\'entretien sont requises')
      if (!product.value.season) validationErrors.value.push('La saison est requise')
      if (!product.value.country_of_origin) validationErrors.value.push('Le pays d\'origine est requis')
      if (product.value.weight_grams <= 0) validationErrors.value.push('Le poids doit être supérieur à 0')
      if (!dimensionsInput.value.width || !dimensionsInput.value.height || !dimensionsInput.value.depth) {
        validationErrors.value.push('Toutes les dimensions sont requises (largeur, hauteur, profondeur)')
      }
      break
    case 'images':
      if (!product.value.images || product.value.images.length === 0) {
        validationErrors.value.push('Au moins une image est requise')
      }
      break
    case 'variants':
      if (product.value.variants.length === 0) {
        validationErrors.value.push('Au moins une variante (couleur/taille) est requise')
      }
      break
  }

  return validationErrors.value.length === 0
}

// Validation du formulaire complet
const validateForm = () => {
  validationErrors.value = []

  console.log('Validation du produit:', product.value)

  // Validation de tous les onglets
  if (!product.value.name) validationErrors.value.push('Le nom du produit est requis')
  if (!product.value.type) validationErrors.value.push('Le type de produit est requis')
  if (!product.value.gender) validationErrors.value.push('Le genre est requis')
  if (!product.value.category_id) validationErrors.value.push('La catégorie est requise')
  if (!product.value.short_description) validationErrors.value.push('La description courte est requise')
  if (!product.value.full_description) validationErrors.value.push('La description complète est requise')
  if (!product.value.material) validationErrors.value.push('Le matériau est requis')
  if (!product.value.care_instructions) validationErrors.value.push('Les instructions d\'entretien sont requises')
  if (!product.value.season) validationErrors.value.push('La saison est requise')
  if (!product.value.country_of_origin) validationErrors.value.push('Le pays d\'origine est requis')
  if (product.value.price <= 0) validationErrors.value.push('Le prix doit être supérieur à 0')
  if (product.value.weight_grams <= 0) validationErrors.value.push('Le poids doit être supérieur à 0')
  if (!dimensionsInput.value.width || !dimensionsInput.value.height || !dimensionsInput.value.depth) {
    validationErrors.value.push('Toutes les dimensions sont requises')
  }
  if (product.value.variants.length === 0) {
    validationErrors.value.push('Au moins une variante est requise')
  }
  if (!product.value.images || product.value.images.length === 0) {
    validationErrors.value.push('Au moins une image est requise')
  }

  console.log('Erreurs de validation:', validationErrors.value)
  return validationErrors.value.length === 0
}

// Soumission du formulaire
const submitForm = async () => {
  if (!validateForm()) {
    // Aller au premier onglet avec erreurs
    if (validationErrors.value.some(err => err.includes('nom') || err.includes('catégorie') || err.includes('description'))) {
      activeTab.value = 'info'
    } else if (validationErrors.value.some(err => err.includes('prix'))) {
      activeTab.value = 'price'
    } else if (validationErrors.value.some(err => err.includes('matériau') || err.includes('instructions') || err.includes('saison') || err.includes('pays') || err.includes('poids') || err.includes('dimensions'))) {
      activeTab.value = 'details'
    } else if (validationErrors.value.some(err => err.includes('image'))) {
      activeTab.value = 'images'
    } else if (validationErrors.value.some(err => err.includes('variante'))) {
      activeTab.value = 'variants'
    }
    return
  }

  try {
    isSubmitting.value = true

    const formData = new FormData()

    // Préparer les données du produit avec conversion correcte des booléens
    const productData = {
      // Informations de base
      name: product.value.name,
      type: product.value.type,
      category_id: product.value.category_id,
      brand_id: product.value.brand_id,
      gender: product.value.gender,

      // Descriptions
      short_description: product.value.short_description,
      full_description: product.value.full_description,

      // Prix
      price: product.value.price,
      discounted_price: product.value.discounted_price || null,
      cost_price: product.value.cost_price || null,

      // Détails
      material: product.value.material,
      care_instructions: product.value.care_instructions,
      season: product.value.season,
      weight_grams: product.value.weight_grams,
      dimensions: product.value.dimensions,
      country_of_origin: product.value.country_of_origin,

      // Options booléennes - CORRECTION: Conversion explicite en booléens
      is_preorder: product.value.is_preorder ? 1 : 0,
      is_featured: product.value.is_featured ? 1 : 0,
      is_trending: product.value.is_trending ? 1 : 0,
      is_flash_sale: product.value.is_flash_sale ? 1 : 0,

      // Dates
      preorder_deadline: product.value.preorder_deadline || null,
      expected_ship_date: product.value.expected_ship_date || null,
      release_date: product.value.release_date || null,
      vintage_year: product.value.vintage_year || null
    }

    // Ajouter les champs du produit avec conversion correcte
    Object.keys(productData).forEach(key => {
      const value = productData[key]
      // CORRECTION: Envoyer aussi les valeurs null pour les champs optionnels
      if (value !== undefined) {
        if (key === 'dimensions' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else if (['is_preorder', 'is_featured', 'is_trending', 'is_flash_sale'].includes(key)) {
          // Forcer l'envoi des booléens comme 0 ou 1 pour Laravel
          formData.append(key, value ? '1' : '0')
        } else if (value !== null && value !== '') {
          formData.append(key, value.toString())
        }
        // Note: On n'ajoute pas les champs null/vides pour éviter les erreurs de validation
      }
    })

    // Ajouter les images
    if (product.value.images && product.value.images.length > 0) {
      product.value.images.forEach((file, index) => {
        if (file instanceof File) {
          formData.append(`images[${index}]`, file)
        }
      })
    }

    // Ajouter les variantes
    product.value.variants.forEach((variant, index) => {
      formData.append(`variants[${index}][color_id]`, variant.color_id)
      formData.append(`variants[${index}][size_id]`, variant.size_id)
      formData.append(`variants[${index}][stock_quantity]`, variant.stock_quantity || 0)
      if (variant.barcode) {
        formData.append(`variants[${index}][barcode]`, variant.barcode)
      }
      if (variant.main_image_index !== null && variant.main_image_index !== undefined) {
        formData.append(`variants[${index}][main_image_index]`, variant.main_image_index)
      }
    })

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Rediriger vers la liste des produits
    router.push({
      name: 'products',
      query: {
        success: 'Produit créé avec succès'
      }
    })
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error)

    if (error.response?.status === 422) {
      // Erreurs de validation Laravel
      console.error('Erreurs de validation détaillées:', error.response.data.errors)

      if (error.response.data.errors) {
        // Aplatir les erreurs de validation pour l'affichage
        validationErrors.value = Object.values(error.response.data.errors).flat()
      } else if (error.response.data.message) {
        validationErrors.value = [error.response.data.message]
      }
    } else if (error.response?.data?.message) {
      validationErrors.value = [error.response.data.message]
    } else if (error.response?.data?.errors) {
      validationErrors.value = Object.values(error.response.data.errors).flat()
    } else {
      validationErrors.value = ['Une erreur est survenue lors de la création du produit']
    }

    // Aller au premier onglet avec erreurs pour faciliter la correction
    activeTab.value = 'info'
  } finally {
    isSubmitting.value = false
  }
}

// Initialisation
onMounted(() => {
  loadFormData()

  // Vérifier si on doit dupliquer un produit
  if (route.query.duplicate) {
    const productId = route.query.duplicate
    loadProductToDuplicate(productId)
  }
})

// Surveiller les changements de route
watch(
  () => route.query.duplicate,
  (newVal) => {
    if (newVal) {
      loadProductToDuplicate(newVal)
    }
  }
)

// Nettoyage lors de la destruction du composant
onUnmounted(() => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
