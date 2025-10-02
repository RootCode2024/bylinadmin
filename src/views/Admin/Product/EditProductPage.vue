<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8">
      <!-- Header avec indicateur de progression -->
      <div class="mb-8">
        <div class="flex items-center justify-between my-8">
          <div>
            <p class="text-sm text-gray-500 mt-1">
              Produit ID: {{ $route.params.productId }} • Dernière modification: {{ lastModified }}
            </p>
          </div>
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

        <!-- État de chargement initial -->
        <div v-if="isLoading" class="p-8 text-center">
          <SpinnerIcon class="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
          <p class="text-gray-600 dark:text-gray-400">Chargement du produit...</p>
        </div>

        <!-- Message d'erreur si produit non trouvé -->
        <div v-else-if="loadError" class="p-8 text-center">
          <ExclamationTriangleIcon class="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Produit introuvable</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">{{ loadError }}</p>
          <button
            @click="$router.push({ name: 'products' })"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retourner à la liste des produits
          </button>
        </div>

        <!-- Formulaire d'édition -->
        <form v-else @submit.prevent="updateProduct" class="p-8">
          <!-- Sauvegarde automatique -->
          <div
            v-if="autoSaveStatus"
            :class="{
              'bg-green-50 border-green-200 text-green-700': autoSaveStatus === 'saved',
              'bg-yellow-50 border-yellow-200 text-yellow-700': autoSaveStatus === 'saving',
              'bg-red-50 border-red-200 text-red-700': autoSaveStatus === 'error'
            }"
            class="border-l-4 p-3 text-sm mb-6"
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
                <div class="flex justify-between mt-1">
                  <p class="text-sm text-gray-500">
                    Slug actuel: <code class="bg-gray-100 px-1 rounded">{{ product.slug }}</code>
                  </p>
                  <button
                    type="button"
                    @click="regenerateSlug"
                    class="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Régénérer le slug
                  </button>
                </div>
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

            <!-- Statut du produit -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Statut et visibilité</h3>
              <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Statut de publication
                  </label>
                  <select
                    v-model="product.status"
                    class="w-full p-3 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="draft">🗒️ Brouillon</option>
                    <option value="published">✅ Publié</option>
                    <option value="archived">📦 Archivé</option>
                  </select>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Visibilité
                  </label>
                  <select
                    v-model="product.visibility"
                    class="w-full p-3 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="public">🌐 Public</option>
                    <option value="private">🔒 Privé</option>
                    <option value="members_only">👥 Membres uniquement</option>
                  </select>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Stock global
                  </label>
                  <div class="p-3 bg-white dark:bg-gray-800 border rounded-lg">
                    <span class="text-lg font-semibold" :class="totalStock > 0 ? 'text-green-600' : 'text-red-600'">
                      {{ totalStock }} unités
                    </span>
                  </div>
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
            <!-- Historique des prix -->
            <div v-if="priceHistory && priceHistory.length > 0" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">📊 Historique des prix</h3>
              <div class="space-y-2">
                <div v-for="(record, index) in priceHistory.slice(0, 3)" :key="index" class="flex justify-between text-sm">
                  <span class="text-blue-700 dark:text-blue-200">{{ formatDate(record.date) }}</span>
                  <span class="font-medium">{{ record.price }} F CFA</span>
                </div>
                <button
                  v-if="priceHistory.length > 3"
                  type="button"
                  class="text-xs text-blue-600 hover:text-blue-800"
                >
                  Voir l'historique complet ({{ priceHistory.length }} modifications)
                </button>
              </div>
            </div>

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
                  <p v-if="originalPrice && originalPrice !== product.price" class="mt-1 text-xs text-blue-600">
                    Prix original: {{ originalPrice }} F CFA
                  </p>
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
                Modifiez les différentes combinaisons de couleurs et tailles disponibles pour ce produit.
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
                  Générer nouvelles combinaisons
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
                            @change="markAsModified"
                          >
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <input
                            v-model="variant.barcode"
                            type="text"
                            class="w-32 px-2 py-1 text-sm border rounded"
                            placeholder="Auto-généré"
                            @change="markAsModified"
                          >
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center space-x-2">
                            <select
                              v-model="variant.main_image_index"
                              class="w-24 px-2 py-1 text-sm border rounded"
                              :disabled="product.images.length === 0"
                              @change="markAsModified"
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
                                :src="getImageUrl(product.images[variant.main_image_index])"
                                alt="Aperçu"
                                class="w-full h-full object-cover"
                              />
                            </div>
                            <div v-else-if="variant.main_image_index === null || !product.images[variant.main_image_index]">
                              <span class="text-sm text-gray-500">Aucune image</span>
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
                  Modifiez les images de votre produit ou ajoutez-en de nouvelles
                </p>
              </div>

              <ImageUploader v-model="product.images" :existing-images="originalImages" />

              <!-- Comparaison avec les images originales -->
              <div v-if="originalImages && originalImages.length > 0" class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">📷 Images modifiées</h4>
                <div class="flex justify-between text-sm text-blue-700 dark:text-blue-200">
                  <span>Images originales: {{ originalImages.length }}</span>
                  <span>Images actuelles: {{ product.images.length }}</span>
                  <span v-if="product.images.length !== originalImages.length" class="font-medium">
                    {{ product.images.length > originalImages.length ? 'Nouvelles images ajoutées' : 'Images supprimées' }}
                  </span>
                </div>
              </div>

              <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Conseils pour les images</h4>
                <ul class="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>• Utilisez des images d'au moins 1200x1200 pixels</li>
                  <li>• La première image sera utilisée comme image principale</li>
                  <li>• Ajoutez plusieurs angles de vue</li>
                  <li>• Montrez les détails importants (matière, finitions, etc.)</li>
                  <li>• Les variantes existantes conserveront leurs associations d'images</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Boutons de navigation -->
          <div class="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-4">
              <button
                v-if="activeTab !== 'info'"
                @click="prevTab"
                type="button"
                class="flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <ChevronLeftIcon class="w-4 h-4 mr-2" />
                Précédent
              </button>

              <!-- Bouton pour voir le produit -->
              <button
                type="button"
                @click="viewProduct"
                class="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <EyeIcon class="w-4 h-4 mr-2" />
                Voir le produit
              </button>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Indicateur de modifications non sauvegardées -->
              <div v-if="hasUnsavedChanges" class="flex items-center text-orange-600">
                <ExclamationCircleIcon class="w-4 h-4 mr-1" />
                <span class="text-sm">Modifications non sauvegardées</span>
              </div>

              <button
                type="button"
                @click="saveDraft"
                :disabled="isSavingDraft"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <span v-if="isSavingDraft">Sauvegarde...</span>
                <span v-else>💾 Sauvegarder les modifications</span>
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
                  Mise à jour...
                </span>
                <span v-else class="flex items-center">
                  <CheckIcon class="w-4 h-4 mr-2" />
                  Mettre à jour le produit
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

    <!-- Modal de confirmation avant suppression -->
    <Modal v-if="showDeleteConfirmModal" @close="showDeleteConfirmModal = false">
      <template #header>
        <h2 class="text-lg font-semibold text-red-600">
          Supprimer le produit
        </h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <div class="flex items-center p-4 bg-red-50 rounded-lg">
            <ExclamationTriangleIcon class="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h3 class="font-medium text-red-800">Attention : Action irréversible</h3>
              <p class="text-sm text-red-700 mt-1">
                Cette action supprimera définitivement le produit "{{ product.name }}" et toutes ses données associées.
              </p>
            </div>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">Données qui seront supprimées :</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• {{ product.variants?.length || 0 }} variante(s) de produit</li>
              <li>• {{ product.images?.length || 0 }} image(s)</li>
              <li>• Historique des prix et modifications</li>
              <li>• Statistiques et analyses associées</li>
            </ul>
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              Pour confirmer, tapez "SUPPRIMER" :
            </label>
            <input
              v-model="deleteConfirmText"
              type="text"
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="SUPPRIMER"
            >
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="showDeleteConfirmModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              @click="deleteProduct"
              :disabled="deleteConfirmText !== 'SUPPRIMER' || isDeletingProduct"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isDeletingProduct" class="flex items-center">
                <SpinnerIcon class="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </span>
              <span v-else>Supprimer définitivement</span>
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Menu d'actions flottant -->
    <div class="fixed bottom-6 right-6 flex flex-col space-y-3">
      <!-- Bouton principal d'actions -->
      <div class="relative">
        <button
          @click="showActionsMenu = !showActionsMenu"
          class="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-center"
        >
          <EllipsisHorizontalIcon class="w-5 h-5" />
        </button>

        <!-- Menu déroulant -->
        <div
          v-if="showActionsMenu"
          class="absolute bottom-14 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-48"
        >
          <button
            @click="duplicateProduct"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <DocumentDuplicateIcon class="w-4 h-4 mr-3" />
            Dupliquer le produit
          </button>

          <button
            @click="exportProduct"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-3" />
            Exporter les données
          </button>

          <button
            @click="viewProductHistory"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <ClockIcon class="w-4 h-4 mr-3" />
            Voir l'historique
          </button>

          <hr class="my-2 border-gray-200 dark:border-gray-600">

          <button
            @click="showDeleteConfirmModal = true; showActionsMenu = false"
            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
          >
            <TrashIcon class="w-4 h-4 mr-3" />
            Supprimer le produit
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ImageUploader from '@/components/products/ImageUploader.vue'
import Modal from '@/components/ui/Modal.vue'
import QuickCreateModal from '@/components/common/QuickCreateModal.vue'
import api from '@/api/axiosConfig'
import { useColorsStore } from '@/stores/colors'
import { useSizesStore } from '@/stores/sizes'

// Icons
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  SwatchIcon,
  EyeIcon,
  EllipsisHorizontalIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

// Import correct pour SpinnerIcon
import { ArrowPathIcon as SpinnerIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

const colorsStore = useColorsStore()
const sizesStore = useSizesStore()

// États de chargement
const isLoading = ref(true)
const loadError = ref(null)
const isSubmitting = ref(false)
const isSavingDraft = ref(false)
const isDeletingProduct = ref(false)

// État des modifications
const hasUnsavedChanges = ref(false)
const originalProduct = ref(null)
const originalImages = ref([])
const originalPrice = ref(null)
const lastModified = ref('')

// Navigation
const activeTab = ref('info')
const tabs = ref([
  { id: 'info', label: 'Informations' },
  { id: 'price', label: 'Prix & Stock' },
  { id: 'details', label: 'Détails' },
  { id: 'variants', label: 'Variantes' },
  { id: 'images', label: 'Images' }
])

// Données du produit
const product = ref({
  id: null,
  name: '',
  slug: '',
  type: 'new',
  gender: 'unisex',
  brand_id: null,
  category_id: null,
  short_description: '',
  full_description: '',
  price: 0,
  discounted_price: null,
  cost_price: null,
  material: '',
  season: '',
  weight_grams: 0,
  country_of_origin: '',
  vintage_year: null,
  care_instructions: '',
  dimensions: {},
  release_date: null,
  preorder_deadline: null,
  expected_ship_date: null,
  is_featured: false,
  is_trending: false,
  is_preorder: false,
  is_flash_sale: false,
  status: 'draft',
  visibility: 'public',
  variants: [],
  images: []
})

// Données de référence
const brands = ref([])
const categories = ref([])
const availableColors = computed(() => colorsStore.colors || [])
const availableSizes = computed(() => sizesStore.sizes || [])
const priceHistory = ref([])

// Modales
const showVariantModal = ref(false)
const showCreateBrandModal = ref(false)
const showCreateCategoryModal = ref(false)
const showDeleteConfirmModal = ref(false)
const showActionsMenu = ref(false)

// Formulaires
const newVariant = ref({
  color_id: '',
  size_id: '',
  stock_quantity: 0,
  barcode: '',
  main_image_index: null
})

const deleteConfirmText = ref('')

// Dimensions
const dimensionsInput = ref({
  width: 0,
  height: 0,
  depth: 0
})

// Auto-save
const autoSaveStatus = ref(null)
const autoSaveMessages = {
  saving: 'Sauvegarde automatique en cours...',
  saved: 'Modifications sauvegardées automatiquement',
  error: 'Erreur lors de la sauvegarde automatique'
}

// Validation
const validationErrors = ref([])

// Templates
const careInstructionTemplates = [
  'Lavage machine 30°C',
  'Lavage à la main',
  'Séchage à l\'air libre',
  'Pas de sèche-linge',
  'Repassage température moyenne',
  'Pas de repassage',
  'Nettoyage à sec uniquement',
  'Pas de javel'
]

// Computed
const currentPageTitle = computed(() => {
  return product.value.name ? `Éditer "${product.value.name}"` : 'Édition de produit'
})

const currentStepNumber = computed(() => {
  return tabs.value.findIndex(tab => tab.id === activeTab.value) + 1
})

const progressPercentage = computed(() => {
  return (currentStepNumber.value / tabs.value.length) * 100
})

const totalStock = computed(() => {
  return product.value.variants?.reduce((total, variant) => total + (variant.stock_quantity || 0), 0) || 0
})

const discountPercentage = computed(() => {
  if (!product.value.price || !product.value.discounted_price) return null
  const discount = ((product.value.price - product.value.discounted_price) / product.value.price) * 100
  return Math.round(discount)
})

const profitMargin = computed(() => {
  if (!product.value.price || !product.value.cost_price) return null
  const margin = ((product.value.price - product.value.cost_price) / product.value.price) * 100
  return Math.round(margin)
})

const dimensionsJsonPreview = computed(() => {
  return JSON.stringify({
    width: dimensionsInput.value.width || 0,
    height: dimensionsInput.value.height || 0,
    depth: dimensionsInput.value.depth || 0
  })
})

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Méthodes
const loadProduct = async () => {
  try {
    isLoading.value = true
    loadError.value = null

    const productId = route.params.productId

    const response = await api.get(`/products/${productId}`)
    console.log('Produit chargé:', response)

    // Correction: utiliser response.data si la réponse est encapsulée
    const productData = response.data?.product || response.data || response

    // Vérification et initialisation sécurisée des dimensions
    const productDimensions = productData.dimensions || {}

    const mockProduct = {
      ...productData,
      dimensions: {
        width: productDimensions.width || 0,
        height: productDimensions.height || 0,
        depth: productDimensions.depth || 0
      },
      variants: Array.isArray(productData.variants)
        ? productData.variants.map(variant => ({
            color_id: variant.color_id,
            size_id: variant.size_id,
            stock_quantity: variant.stock_quantity || 0,
            barcode: variant.barcode || '',
            main_image_index: variant.main_image_index || 0
          }))
        : [],
      images: Array.isArray(productData.images)
        ? productData.images.map(img => img.url || img.path || img.image_url || '')
        : []
    }

    product.value = { ...mockProduct }
    originalProduct.value = JSON.parse(JSON.stringify(mockProduct))
    originalImages.value = [...mockProduct.images]
    originalPrice.value = mockProduct.price

    // Initialisation sécurisée des dimensionsInput
    dimensionsInput.value = {
      width: productDimensions.width || 0,
      height: productDimensions.height || 0,
      depth: productDimensions.depth || 0
    }

    lastModified.value = productData.updated_at
      ? new Date(productData.updated_at).toLocaleString('fr-FR')
      : new Date().toLocaleString('fr-FR')

    priceHistory.value = [
      { date: '2024-01-20', price: 25000 },
      { date: '2024-01-15', price: 28000 },
      { date: '2024-01-10', price: 30000 }
    ]
  } catch (error) {
    console.error('Erreur chargement produit:', error)
    loadError.value = error.response?.data?.message || error.message || 'Impossible de charger le produit'
  } finally {
    isLoading.value = false
  }
}

const loadReferenceData = async () => {
  try {
    // Charger les marques, catégories, couleurs et tailles
    const [brandsRes, categoriesRes] = await Promise.all([
      api.get('/brands'),
      api.get('/categories')
    ])

    brands.value = brandsRes.data?.data || brandsRes.data || []
    categories.value = categoriesRes.data?.data || categoriesRes.data || []

    // Charger les couleurs et tailles depuis les stores
    await Promise.all([
      colorsStore.fetchColors(),
      sizesStore.fetchSizes()
    ])

  } catch (error) {
    console.error('Erreur lors du chargement des données de référence:', error)
  }
}

const updateProduct = async () => {
  try {
    isSubmitting.value = true
    validationErrors.value = []

    const productId = route.params.productId

    // Validation
    if (!validateForm()) {
      return
    }

    // Préparer les données
    const formData = {
      ...product.value,
      dimensions: {
        width: dimensionsInput.value.width,
        height: dimensionsInput.value.height,
        depth: dimensionsInput.value.depth
      }
    }

    // Appel API réel
    const response = await api.put(`/products/${productId}`, formData)
    console.log('Produit mis à jour : ', response)

    // Marquer comme sauvegardé
    hasUnsavedChanges.value = false
    originalProduct.value = JSON.parse(JSON.stringify(product.value))

    // Notification de succès
    autoSaveStatus.value = 'saved'
    setTimeout(() => {
      autoSaveStatus.value = null
    }, 3000)

    // Rediriger vers la liste des produits
    router.push({ name: 'products' })

  } catch (error) {
    console.error('Erreur mise à jour produit:', error)
    validationErrors.value = [error.response?.data?.message || error.message || 'Erreur lors de la mise à jour']
  } finally {
    isSubmitting.value = false
  }
}

const saveDraft = async () => {
  try {
    isSavingDraft.value = true
    autoSaveStatus.value = 'saving'

    // Simuler l'appel API
    await new Promise(resolve => setTimeout(resolve, 1000))

    hasUnsavedChanges.value = false
    autoSaveStatus.value = 'saved'

    setTimeout(() => {
      autoSaveStatus.value = null
    }, 3000)

  } catch (error) {
    autoSaveStatus.value = 'error'
    setTimeout(() => {
      autoSaveStatus.value = null
    }, 3000)
  } finally {
    isSavingDraft.value = false
  }
}

const deleteProduct = async () => {
  try {
    isDeletingProduct.value = true

    // Appel API réel
    await api.delete(`/products/${product.value.id}`)

    // Rediriger vers la liste des produits
    router.push({ name: 'products' })

  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    validationErrors.value = [error.response?.data?.message || error.message || 'Erreur lors de la suppression']
  } finally {
    isDeletingProduct.value = false
    showDeleteConfirmModal.value = false
  }
}

const validateForm = () => {
  const errors = []

  if (!product.value.name?.trim()) {
    errors.push('Le nom du produit est requis')
  }

  if (!product.value.category_id) {
    errors.push('La catégorie est requise')
  }

  if (!product.value.short_description?.trim()) {
    errors.push('La description courte est requise')
  }

  if (!product.value.full_description?.trim()) {
    errors.push('La description complète est requise')
  }

  if (!product.value.price || product.value.price <= 0) {
    errors.push('Le prix de vente est requis et doit être positif')
  }

  if (!product.value.material?.trim()) {
    errors.push('Le matériau est requis')
  }

  if (!product.value.season) {
    errors.push('La saison est requise')
  }

  if (!product.value.weight_grams || product.value.weight_grams <= 0) {
    errors.push('Le poids est requis et doit être positif')
  }

  if (!product.value.country_of_origin?.trim()) {
    errors.push('Le pays d\'origine est requis')
  }

  if (!product.value.care_instructions?.trim()) {
    errors.push('Les instructions d\'entretien sont requises')
  }

  if (!dimensionsInput.value.width || !dimensionsInput.value.height || !dimensionsInput.value.depth) {
    errors.push('Toutes les dimensions sont requises')
  }

  validationErrors.value = errors
  return errors.length === 0
}

const markAsModified = () => {
  hasUnsavedChanges.value = true
}

// Navigation entre onglets
const nextTab = () => {
  const currentIndex = tabs.value.findIndex(tab => tab.id === activeTab.value)
  if (currentIndex < tabs.value.length - 1) {
    activeTab.value = tabs.value[currentIndex + 1].id
  }
}

const prevTab = () => {
  const currentIndex = tabs.value.findIndex(tab => tab.id === activeTab.value)
  if (currentIndex > 0) {
    activeTab.value = tabs.value[currentIndex - 1].id
  }
}

const isTabCompleted = (tabId) => {
  // Logique pour déterminer si un onglet est complété
  switch (tabId) {
    case 'info':
      return product.value.name && product.value.category_id && product.value.short_description
    case 'price':
      return product.value.price > 0
    case 'details':
      return product.value.material && product.value.season && product.value.weight_grams
    case 'variants':
      return product.value.variants?.length > 0
    case 'images':
      return product.value.images?.length > 0
    default:
      return false
  }
}

// Gestion des variantes
const addVariant = () => {
  if (!newVariant.value.color_id || !newVariant.value.size_id) return

  const variant = {
    color_id: parseInt(newVariant.value.color_id),
    size_id: parseInt(newVariant.value.size_id),
    stock_quantity: newVariant.value.stock_quantity,
    barcode: newVariant.value.barcode || generateBarcode(),
    main_image_index: newVariant.value.main_image_index
  }

  if (!product.value.variants) {
    product.value.variants = []
  }

  product.value.variants.push(variant)
  markAsModified()
  closeVariantModal()
}

const removeVariant = (index) => {
  product.value.variants.splice(index, 1)
  markAsModified()
}

const isVariantExists = (colorId, sizeId) => {
  if (!colorId || !sizeId || !product.value.variants) return false
  return product.value.variants.some(v => v.color_id === colorId && v.size_id === sizeId)
}

const generateAllVariants = () => {
  const newVariants = []

  availableColors.value.forEach(color => {
    availableSizes.value.forEach(size => {
      if (!isVariantExists(color.id, size.id)) {
        newVariants.push({
          color_id: color.id,
          size_id: size.id,
          stock_quantity: 0,
          barcode: generateBarcode(),
          main_image_index: null
        })
      }
    })
  })

  if (!product.value.variants) {
    product.value.variants = []
  }

  product.value.variants.push(...newVariants)
  markAsModified()
}

const clearAllVariants = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer toutes les variantes ?')) {
    product.value.variants = []
    markAsModified()
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

// Utilitaires
const getColorById = (id) => {
  return availableColors.value.find(color => color.id === id)
}

const getSizeById = (id) => {
  return availableSizes.value.find(size => size.id === id)
}

const getImagePreview = (image) => {
  if (typeof image === 'string') return image
  if (image instanceof File) return URL.createObjectURL(image)
  return ''
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return "https://stagging.bylin-style.com" + imagePath
}

const generateBarcode = () => {
  return 'PRD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
}

const calculateMargin = () => {
  markAsModified()
}

const calculateDiscount = () => {
  markAsModified()
}

const addCareInstruction = (instruction) => {
  if (product.value.care_instructions) {
    product.value.care_instructions += ', ' + instruction
  } else {
    product.value.care_instructions = instruction
  }
  markAsModified()
}

const regenerateSlug = () => {
  // Générer un nouveau slug basé sur le nom
  const slug = product.value.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  product.value.slug = slug
  markAsModified()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Actions du menu flottant
const viewProduct = () => {
  // Ouvrir la page produit dans un nouvel onglet
  const routeData = router.resolve({ name: 'product', params: { slug: product.value.slug } })
  window.open(routeData.href, '_blank')
}

const duplicateProduct = async () => {
  try {
    // Créer une copie du produit
    const duplicatedProduct = {
      ...product.value,
      id: null,
      name: product.value.name + ' (Copie)',
      slug: product.value.slug + '-copie',
      status: 'draft'
    }

    // Rediriger vers la page d'ajout avec les données pré-remplies
    router.push({
      name: 'products.create',
      state: { duplicatedProduct }
    })
  } catch (error) {
    console.error('Erreur lors de la duplication:', error)
  } finally {
    showActionsMenu.value = false
  }
}

const exportProduct = () => {
  try {
    const dataToExport = {
      product: product.value,
      variants: product.value.variants,
      metadata: {
        exported_at: new Date().toISOString(),
        exported_by: 'Admin User'
      }
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `product-${product.value.slug}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
  } finally {
    showActionsMenu.value = false
  }
}

const viewProductHistory = () => {
  // Rediriger vers la page d'historique du produit
  router.push({
    name: 'products.history',
    params: { id: product.value.id }
  })
  showActionsMenu.value = false
}

// Gestion des modales de création rapide
const handleBrandCreated = (newBrand) => {
  brands.value.push(newBrand)
  product.value.brand_id = newBrand.id
  markAsModified()
}

const handleCategoryCreated = (newCategory) => {
  categories.value.push(newCategory)
  product.value.category_id = newCategory.id
  markAsModified()
}

// Auto-save avec debounce
let autoSaveTimeout = null
const autoSave = () => {
  if (!hasUnsavedChanges.value) return

  clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(() => {
    saveDraft()
  }, 5000) // Sauvegarde automatique après 5 secondes d'inactivité
}

// Watchers
watch(product, () => {
  markAsModified()
  autoSave()
}, { deep: true })

watch(dimensionsInput, () => {
  product.value.dimensions = {
    width: dimensionsInput.value.width,
    height: dimensionsInput.value.height,
    depth: dimensionsInput.value.depth
  }
  markAsModified()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadProduct(),
    loadReferenceData()
  ])
})

// Prévenir la perte de données
onBeforeMount(() => {
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges.value) {
      e.preventDefault()
      e.returnValue = ''
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', () => {})
  clearTimeout(autoSaveTimeout)
})
</script>

<style scoped>
/* Styles personnalisés pour la page d'édition */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Animation pour le menu d'actions */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.2s ease-out;
}

/* Styles pour les champs modifiés */
.field-modified {
  border-left: 3px solid #f59e0b;
  background-color: #fef3c7;
}

.dark .field-modified {
  background-color: #451a03;
  border-color: #d97706;
}

/* Styles pour les erreurs de validation */
.error-field {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.dark .error-field {
  background-color: #450a0a;
  border-color: #dc2626;
}

/* Animation de pulsation pour les éléments en cours de sauvegarde */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Styles pour le menu flottant */
.floating-menu {
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}

.dark .floating-menu {
  background-color: rgba(31, 41, 55, 0.95);
}

/* Indicateur de progression personnalisé */
.progress-bar {
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
}

/* Styles pour les badges de statut */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-draft {
  background-color: #f3f4f6;
  color: #374151;
}

.status-published {
  background-color: #dcfce7;
  color: #166534;
}

.status-archived {
  background-color: #fef3c7;
  color: #92400e;
}

.dark .status-draft {
  background-color: #374151;
  color: #d1d5db;
}

.dark .status-published {
  background-color: #065f46;
  color: #6ee7b7;
}

.dark .status-archived {
  background-color: #92400e;
  color: #fbbf24;
}

/* Styles pour les sections d'onglets */
.tab-section {
  min-height: 400px;
}

/* Animation d'entrée pour les sections */
.tab-enter-active,
.tab-leave-active {
  transition: all 0.3s ease;
}

.tab-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.tab-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Styles responsifs */
@media (max-width: 768px) {
  .tab-navigation {
    flex-direction: column;
    gap: 0.5rem;
  }

  .tab-step {
    justify-content: flex-start;
  }

  .floating-menu {
    bottom: 1rem;
    right: 1rem;
  }
}

/* Styles pour les tableaux sur mobile */
@media (max-width: 640px) {
  .variants-table {
    font-size: 0.875rem;
  }

  .variants-table th,
  .variants-table td {
    padding: 0.5rem 0.25rem;
  }
}

/* Styles pour l'édition inline */
.inline-edit {
  border: 1px solid transparent;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  transition: all 0.15s ease;
}

.inline-edit:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.inline-edit:focus {
  border-color: #3b82f6;
  background-color: #ffffff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .inline-edit:hover {
  border-color: #4b5563;
  background-color: #374151;
}

.dark .inline-edit:focus {
  border-color: #3b82f6;
  background-color: #1f2937;
}

/* Styles pour les indicateurs de stock */
.stock-indicator {
  position: relative;
  overflow: hidden;
}

.stock-low {
  color: #dc2626;
}

.stock-medium {
  color: #d97706;
}

.stock-high {
  color: #059669;
}

/* Animation pour les notifications */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Styles pour la comparaison d'images */
.image-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.image-comparison-item {
  text-align: center;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
}

.image-comparison-item.changed {
  border-color: #f59e0b;
  background-color: #fef3c7;
}

.dark .image-comparison-item.changed {
  background-color: #451a03;
  border-color: #d97706;
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Impression */
@media print {
  .floating-menu,
  .navigation-buttons,
  .action-buttons {
    display: none !important;
  }

  .tab-section {
    display: block !important;
  }

  .no-print {
    display: none !important;
  }
}
</style>
