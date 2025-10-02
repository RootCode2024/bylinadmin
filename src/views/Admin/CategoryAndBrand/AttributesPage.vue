<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-8 bg-white dark:bg-gray-900 min-h-screen">
      <!-- Messages d'erreur -->
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

      <!-- Header -->
      <div class="flex flex-col justify-between mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Attributs</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Gérez les attributs de vos produits (couleurs, tailles, matériaux, etc.)
          </p>
        </div>
        <button
          @click="openAttributeModal"
          class="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 transition-colors duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvel Attribut
        </button>
      </div>

      <!-- État de chargement -->
      <div v-if="is_loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
      </div>

      <!-- État vide -->
      <div v-else-if="attributes.length === 0" class="text-center py-12">
        <div class="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun attribut</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Commencez par créer votre premier attribut de produit.
        </p>
        <div class="mt-6">
          <button
            @click="openAttributeModal"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Créer un attribut
          </button>
        </div>
      </div>

      <!-- Tableau des attributs -->
      <div v-else class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Nom de l'attribut
                </th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Valeurs disponibles
                </th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Utilisation
                </th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <tr v-for="attribute in attributes" :key="attribute.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ attribute.name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2 max-w-md">
                    <span
                      v-for="value in attribute.values.slice(0, 5)"
                      :key="value.id"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {{ value.value }}
                    </span>
                    <span
                      v-if="attribute.values.length > 5"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      +{{ attribute.values.length - 5 }} autres
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ attribute.products_count }} produits
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="editAttribute(attribute)"
                      class="inline-flex items-center p-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 transition-colors duration-200"
                      title="Modifier"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDeleteAttribute(attribute.id)"
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

      <!-- Modal d'attribut -->
      <Modal v-if="showAttributeModal" @close="closeAttributeModal">
        <template #header>
          <div class="flex items-center">
            <div class="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
              <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ isEditingAttribute ? 'Modifier l\'attribut' : 'Créer un nouvel attribut' }}
            </h2>
          </div>
        </template>

        <template #body>
          <form @submit.prevent="saveAttribute" class="space-y-6">
            <div>
              <label for="attribute-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de l'attribut <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="attribute-name"
                v-model="attributeForm.name"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                placeholder="Ex: Couleur, Taille, Matériau..."
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valeurs de l'attribut <span class="text-red-500">*</span>
              </label>
              <div class="space-y-3">
                <div v-for="(value, index) in attributeForm.values" :key="index" class="flex items-center gap-3">
                  <div class="flex-1">
                    <input
                      type="text"
                      v-model="value.value"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                      :placeholder="`Valeur ${index + 1}`"
                    >
                  </div>
                  <button
                    type="button"
                    @click="removeValue(index)"
                    :disabled="attributeForm.values.length === 1"
                    class="flex-shrink-0 p-2 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    title="Supprimer cette valeur"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="button"
                @click="addValue"
                class="inline-flex items-center px-3 py-2 mt-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter une valeur
              </button>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                @click="closeAttributeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="is_loading"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg v-if="is_loading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isEditingAttribute ? 'Mettre à jour' : 'Créer l\'attribut' }}
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
              Êtes-vous sûr de vouloir supprimer cet attribut ? Cette action est irréversible et supprimera également toutes les valeurs associées.
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
                    <strong>Attention :</strong> Cette action affectera tous les produits utilisant cet attribut.
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
                @click="deleteAttribute"
                :disabled="is_loading"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg v-if="is_loading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
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
import { ref, onMounted } from 'vue'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import Modal from '@/components/ui/Modal.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import { TrashIcon } from '@/icons'
import api from '@/api/axiosConfig'

const currentPageTitle = ref("Gestion des Attributs")

// Données réactives
const attributes = ref([])
const showAttributeModal = ref(false)
const showDeleteModal = ref(false)
const isEditingAttribute = ref(false)
const attributeToDelete = ref(null)
const errorMessage = ref(null)
const is_loading = ref(false)

// Formulaires
const attributeForm = ref({
  id: null,
  name: '',
  values: [{ value: '' }]
})

// Méthodes
const fetchAttributes = async () => {
  is_loading.value = true
  errorMessage.value = null

  try {
    const response = await api.get('/admin/attributes')

    if (!response || !response.data) {
      throw new Error('Réponse API invalide')
    }

    // Vérification plus robuste de la structure de réponse
    let attributesData = []
    if (response.data && Array.isArray(response.data)) {
      attributesData = response.data
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      attributesData = response.data.data
    } else {
      throw new Error('Format de données non reconnu')
    }

    attributes.value = attributesData.map(attr => ({
      ...attr,
      // Assurer que products_count existe
      products_count: attr.products_count ?? 0,
      // Assurer que values est un tableau
      values: Array.isArray(attr.values) ? attr.values : []
    }))

  } catch (error) {
    console.error('Erreur lors du chargement des attributs:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Erreur lors du chargement des attributs'
  } finally {
    is_loading.value = false
  }
}

const openAttributeModal = () => {
  isEditingAttribute.value = false
  attributeForm.value = {
    id: null,
    name: '',
    values: [{ value: '' }]
  }
  showAttributeModal.value = true
}

const editAttribute = (attribute) => {
  isEditingAttribute.value = true
  attributeForm.value = {
    id: attribute.id,
    name: attribute.name,
    values: attribute.values.map(v => ({
      id: v.id,
      value: v.value
    }))
  }
  showAttributeModal.value = true
}

const saveAttribute = async () => {
  is_loading.value = true
  errorMessage.value = null

  try {
    // Validation côté client
    if (!attributeForm.value.name.trim()) {
      throw new Error('Le nom de l\'attribut est requis')
    }

    if (attributeForm.value.values.length === 0 ||
        attributeForm.value.values.every(v => !v.value.trim())) {
      throw new Error('Au moins une valeur est requise')
    }

    // Nettoyer les valeurs vides
    const cleanedForm = {
      ...attributeForm.value,
      values: attributeForm.value.values.filter(v => v.value.trim())
    }

    if (isEditingAttribute.value) {
      await api.put(`/admin/attributes/${cleanedForm.id}`, cleanedForm)
    } else {
      await api.post('/admin/attributes', cleanedForm)
    }

    await fetchAttributes()
    closeAttributeModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la sauvegarde'
  } finally {
    is_loading.value = false
  }
}

const closeAttributeModal = () => {
  showAttributeModal.value = false
  isEditingAttribute.value = false
  attributeForm.value = {
    id: null,
    name: '',
    values: [{ value: '' }]
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  attributeToDelete.value = null
}

const confirmDeleteAttribute = (id) => {
  attributeToDelete.value = id
  showDeleteModal.value = true
}

const deleteAttribute = async () => {
  is_loading.value = true
  errorMessage.value = null

  try {
    await api.delete(`/admin/attributes/${attributeToDelete.value}`)
    await fetchAttributes()
    closeDeleteModal()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la suppression'
  } finally {
    is_loading.value = false
  }
}

const addValue = () => {
  attributeForm.value.values.push({ value: '' })
}

const removeValue = (index) => {
  if (attributeForm.value.values.length > 1) {
    attributeForm.value.values.splice(index, 1)
  }
}

// Initialisation
onMounted(() => {
  fetchAttributes()
})
</script>
