<template>
  <Modal v-if="show" @close="$emit('close')" size="xl" :fullScreenBackdrop="true">
    <template #header>
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        {{ isEditing ? 'Modifier le produit' : 'Ajouter un nouveau produit' }}
      </h2>
    </template>

    <template #body>
      <div class="no-scrollbar relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900 lg:p-10">
      <form @submit.prevent="$emit('save', productForm)">
        <!-- Tabs -->
        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
          <ul class="flex flex-wrap -mb-px">
            <li v-for="tab in tabs" :key="tab.id" class="mr-2">
              <button
                type="button"
                @click="activeTab = tab.id"
                :class="{
                  'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500': activeTab === tab.id,
                  'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300': activeTab !== tab.id
                }"
                class="inline-block p-4 border-b-2 rounded-t-lg"
              >
                {{ tab.label }}
              </button>
            </li>
          </ul>
        </div>

        <!-- General Tab -->
        <div v-if="activeTab === 'general'" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="product-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Nom du produit <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="product-name"
                v-model="productForm.name"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              >
            </div>

            <div>
              <label for="product-sku" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Référence (SKU)
              </label>
              <input
                type="text"
                id="product-sku"
                v-model="productForm.sku"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
            </div>
          </div>

          <div>
            <label for="product-description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Description
            </label>
            <textarea
              id="product-description"
              v-model="productForm.description"
              rows="4"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label for="product-price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Prix <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span class="text-gray-500 dark:text-gray-400">€</span>
                </div>
                <input
                  type="number"
                  id="product-price"
                  v-model.number="productForm.price"
                  min="0"
                  step="0.01"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                >
              </div>
            </div>

            <div>
              <label for="product-compare-price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Prix barré
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span class="text-gray-500 dark:text-gray-400">€</span>
                </div>
                <input
                  type="number"
                  id="product-compare-price"
                  v-model.number="productForm.compare_price"
                  min="0"
                  step="0.01"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
              </div>
            </div>

            <div>
              <label for="product-cost-price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Prix de revient
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span class="text-gray-500 dark:text-gray-400">€</span>
                </div>
                <input
                  type="number"
                  id="product-cost-price"
                  v-model.number="productForm.cost_price"
                  min="0"
                  step="0.01"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="product-category" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Catégorie
              </label>
              <select
                id="product-category"
                v-model="productForm.category_id"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option :value="null">Non catégorisé</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div>
              <label for="product-brand" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Marque
              </label>
              <select
                id="product-brand"
                v-model="productForm.brand_id"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option :value="null">Aucune marque</option>
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label for="product-stock" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Stock
              </label>
              <input
                type="number"
                id="product-stock"
                v-model.number="productForm.stock"
                min="0"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
            </div>

            <div>
              <label for="product-stock-alert" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Alerte stock
              </label>
              <input
                type="number"
                id="product-stock-alert"
                v-model.number="productForm.stock_alert"
                min="0"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
            </div>

            <div>
              <label for="product-status" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Statut
              </label>
              <select
                id="product-status"
                v-model="productForm.status"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Media Tab -->
        <div v-if="activeTab === 'media'" class="space-y-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Images du produit
            </label>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              <div
                v-for="(image, index) in productForm.images"
                :key="index"
                class="relative group"
              >
                <img
                  :src="getImageUrl(image)"
                  class="object-cover w-full h-32 rounded-lg"
                  alt="Product image"
                >
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full opacity-0 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div class="flex justify-center mt-1">
                  <button
                    type="button"
                    @click="moveImage(index, 'up')"
                    :disabled="index === 0"
                    :class="{ 'opacity-50 cursor-not-allowed': index === 0 }"
                    class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    @click="moveImage(index, 'down')"
                    :disabled="index === productForm.images.length - 1"
                    :class="{ 'opacity-50 cursor-not-allowed': index === productForm.images.length - 1 }"
                    class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                class="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="openFileInput"
              >
                <div class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Ajouter une image
                  </p>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  @change="handleImageUpload"
                  accept="image/*"
                  multiple
                  class="hidden"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Variants Tab -->
        <div v-if="activeTab === 'variants'" class="space-y-4">
          <div v-if="attributes.length > 0">
            <h3 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Attributs de variation
            </h3>
            <div class="space-y-3">
              <div v-for="attribute in attributes" :key="attribute.id" class="p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ attribute.name }}
                  </label>
                  <button
                    type="button"
                    @click="toggleAttribute(attribute)"
                    class="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {{ isAttributeUsed(attribute) ? 'Retirer' : 'Ajouter' }}
                  </button>
                </div>
                <div v-if="isAttributeUsed(attribute)" class="mt-2">
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="value in attribute.values"
                      :key="value.id"
                      class="flex items-center"
                    >
                      <input
                        :id="`variant-${attribute.id}-${value.id}`"
                        type="checkbox"
                        :value="value.id"
                        v-model="selectedAttributeValues[attribute.id]"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      >
                      <label
                        :for="`variant-${attribute.id}-${value.id}`"
                        class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        {{ value.value }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="hasVariants" class="mt-6">
              <h3 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Variantes générées
              </h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                        Variante
                      </th>
                      <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                        SKU
                      </th>
                      <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                        Prix
                      </th>
                      <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                        Stock
                      </th>
                      <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                        Image
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    <tr v-for="(variant, index) in generatedVariants" :key="index">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900 dark:text-white">
                          {{ variant.name }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          v-model="variant.sku"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          v-model.number="variant.price"
                          min="0"
                          step="0.01"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          v-model.number="variant.stock"
                          min="0"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <select
                          v-model="variant.image"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                          <option value="">Aucune</option>
                          <option v-for="(image, imgIndex) in productForm.images" :key="imgIndex" :value="imgIndex">
                            Image {{ imgIndex + 1 }}
                          </option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div v-else class="p-4 text-center bg-gray-50 rounded-lg dark:bg-gray-700">
            <p class="text-gray-500 dark:text-gray-400">
              Aucun attribut de variation n'a été créé. Créez d'abord des attributs comme "Couleur" ou "Taille" pour pouvoir ajouter des variantes.
            </p>
          </div>
        </div>

        <!-- SEO Tab -->
        <div v-if="activeTab === 'seo'" class="space-y-4">
          <div>
            <label for="product-meta-title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Meta Title
            </label>
            <input
              type="text"
              id="product-meta-title"
              v-model="productForm.meta_title"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Idéalement entre 50-60 caractères. Longueur actuelle: {{ productForm.meta_title?.length || 0 }}
            </p>
          </div>

          <div>
            <label for="product-meta-description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Meta Description
            </label>
            <textarea
              id="product-meta-description"
              v-model="productForm.meta_description"
              rows="3"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Idéalement entre 150-160 caractères. Longueur actuelle: {{ productForm.meta_description?.length || 0 }}
            </p>
          </div>

          <div>
            <label for="product-slug" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Slug (URL)
            </label>
            <div class="flex">
              <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                {{ baseUrl }}/
              </span>
              <input
                type="text"
                id="product-slug"
                v-model="productForm.slug"
                class="rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            {{ isEditing ? 'Mettre à jour' : 'Enregistrer' }}
          </button>
        </div>
      </form>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps({
  show: Boolean,
  product: Object,
  categories: Array,
  brands: Array,
  attributes: Array,
  isEditing: Boolean
})

// const show = ref(false)

const emit = defineEmits(['close', 'save'])

const baseUrl = window.location.origin

// Tabs
const tabs = [
  { id: 'general', label: 'Général' },
  { id: 'media', label: 'Média' },
  { id: 'variants', label: 'Variantes' },
  { id: 'seo', label: 'SEO' }
]
const activeTab = ref('general')

// Form
const productForm = ref({
  name: '',
  sku: '',
  description: '',
  price: 0,
  compare_price: 0,
  cost_price: 0,
  category_id: null,
  brand_id: null,
  stock: 0,
  stock_alert: 5,
  status: 'draft',
  images: [],
  variants: [],
  meta_title: '',
  meta_description: '',
  slug: ''
})

// Variants
const selectedAttributeValues = ref({})
const generatedVariants = ref([])

// File input
const fileInput = ref(null)

// Computed properties
const hasVariants = computed(() => {
  return generatedVariants.value.length > 0
})

const isAttributeUsed = (attribute) => {
  return productForm.value.variants.some(v =>
    v.attributes.some(a => a.attribute_id === attribute.id)
)}

// Methods
const getImageUrl = (image) => {
  return image instanceof File ? URL.createObjectURL(image) : image
}

const openFileInput = () => {
  fileInput.value.click()
}

const handleImageUpload = (event) => {
  const files = event.target.files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      productForm.value.images.push(files[i])
    }
  }
  event.target.value = ''
}

const removeImage = (index) => {
  productForm.value.images.splice(index, 1)
}

const moveImage = (index, direction) => {
  if (direction === 'up' && index > 0) {
    const temp = productForm.value.images[index]
    productForm.value.images[index] = productForm.value.images[index - 1]
    productForm.value.images[index - 1] = temp
  } else if (direction === 'down' && index < productForm.value.images.length - 1) {
    const temp = productForm.value.images[index]
    productForm.value.images[index] = productForm.value.images[index + 1]
    productForm.value.images[index + 1] = temp
  }
}

const toggleAttribute = (attribute) => {
  if (isAttributeUsed(attribute)) {
    // Remove attribute from variants
    productForm.value.variants = productForm.value.variants.filter(v =>
      !v.attributes.some(a => a.attribute_id === attribute.id))
    delete selectedAttributeValues.value[attribute.id]
  } else {
    // Add attribute to variants
    selectedAttributeValues.value[attribute.id] = []
  }
  generateVariants()
}

const generateVariants = () => {
  const selectedAttributes = props.attributes.filter(attr =>
    selectedAttributeValues.value[attr.id]?.length > 0)

  if (selectedAttributes.length === 0) {
    generatedVariants.value = []
    return
  }

  // Generate all possible combinations
  let combinations = []
  const values = selectedAttributes.map(attr =>
    attr.values.filter(val => selectedAttributeValues.value[attr.id].includes(val.id))
  )

  const generateCombinations = (current, depth) => {
    if (depth === selectedAttributes.length) {
      combinations.push([...current])
      return
    }
    for (let i = 0; i < values[depth].length; i++) {
      current.push(values[depth][i])
      generateCombinations(current, depth + 1)
      current.pop()
    }
  }

  generateCombinations([], 0)

  // Create variants from combinations
  generatedVariants.value = combinations.map(combination => {
    const variantName = combination.map(val => val.value).join(' / ')
    const variantAttributes = combination.map(val => ({
      attribute_id: val.attribute_id,
      value_id: val.id
    }))

    // Check if variant already exists
    const existingVariant = productForm.value.variants.find(v =>
      v.attributes.length === variantAttributes.length &&
      v.attributes.every(va =>
        variantAttributes.some(a =>
          a.attribute_id === va.attribute_id && a.value_id === va.value_id
        )
      )
    )

    return existingVariant || {
      name: variantName,
      sku: '',
      price: productForm.value.price,
      stock: 0,
      image: null,
      attributes: variantAttributes
    }
  })

  // Update the product form variants
  productForm.value.variants = [...generatedVariants.value]
}

const generateSlug = () => {
  if (!productForm.value.slug && productForm.value.name) {
    productForm.value.slug = productForm.value.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
  }
}

// Watchers
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    productForm.value = JSON.parse(JSON.stringify(newProduct))

    // Initialize selected attribute values for variants
    if (newProduct.variants?.length > 0) {
      const usedAttributes = {}
      newProduct.variants.forEach(variant => {
        variant.attributes.forEach(attr => {
          if (!usedAttributes[attr.attribute_id]) {
            usedAttributes[attr.attribute_id] = []
          }
          if (!usedAttributes[attr.attribute_id].includes(attr.value_id)) {
            usedAttributes[attr.attribute_id].push(attr.value_id)
          }
        })
      })
      selectedAttributeValues.value = usedAttributes
      generateVariants()
    }
  }
}, { immediate: true })

watch(() => productForm.value.name, () => {
  if (!props.isEditing) {
    generateSlug()
    if (!productForm.value.meta_title) {
      productForm.value.meta_title = productForm.value.name
    }
    if (!productForm.value.meta_description) {
      productForm.value.meta_description = productForm.value.description?.substring(0, 160)
    }
  }
})

watch(selectedAttributeValues, () => {
  generateVariants()
}, { deep: true })
</script>
