<template>
  <div class="image-editor">
    <!-- En-tête -->
    <div class="text-center py-4">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Gestion des images du produit
      </h3>
      <p class="text-sm text-gray-500">
        Ajoutez, modifiez ou réorganisez les images de votre produit
      </p>
    </div>

    <!-- Upload de nouvelles images -->
    <div class="mb-6">
      <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
        Ajouter de nouvelles images
      </h4>
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <CloudArrowUpIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p class="text-sm text-gray-600 mb-2">
          Glissez-déposez vos images ici ou cliquez pour parcourir
        </p>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          @change="handleFileSelect"
          class="hidden"
          ref="fileInput"
        />
        <button
          @click="$refs.fileInput.click()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Parcourir les fichiers
        </button>
        <p class="text-xs text-gray-500 mt-2">
          Formats acceptés: JPG, PNG, WebP • Max 5MB par image
        </p>
      </div>
    </div>

    <!-- Gallery d'images existantes avec édition -->
    <div v-if="localImages.length > 0" class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-md font-medium text-gray-900 dark:text-white">
          Images du produit ({{ localImages.length }})
        </h4>
        <div class="text-sm text-gray-500">
          Image principale: <span class="font-medium">{{ primaryImageIndex + 1 }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="(image, index) in localImages"
          :key="getImageKey(image, index)"
          class="relative group border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
          :class="{ 'ring-2 ring-blue-500 shadow-md': isPrimaryImage(index) }"
        >
          <!-- Image -->
          <img
            :src="getImageUrl(image)"
            :alt="`Image produit ${index + 1}`"
            class="w-full h-32 object-cover"
            @error="handleImageError"
          />

          <!-- Overlay d'actions -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex space-x-2">
              <!-- Bouton image principale -->
              <button
                @click="setAsPrimary(index)"
                :class="[
                  'p-2 rounded-full text-white transition-colors',
                  isPrimaryImage(index)
                    ? 'bg-green-500 cursor-default'
                    : 'bg-gray-600 hover:bg-gray-500'
                ]"
                :title="isPrimaryImage(index) ? 'Image principale' : 'Définir comme image principale'"
                :disabled="isPrimaryImage(index)"
              >
                <StarIcon class="w-4 h-4" />
              </button>

              <!-- Bouton supprimer -->
              <button
                @click="removeImage(index)"
                class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Supprimer l'image"
              >
                <TrashIcon class="w-4 h-4" />
              </button>

              <!-- Bouton réorganiser -->
              <button
                v-if="index > 0"
                @click="moveImage(index, index - 1)"
                class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="Déplacer vers la gauche"
              >
                <ArrowLeftIcon class="w-4 h-4" />
              </button>

              <button
                v-if="index < localImages.length - 1"
                @click="moveImage(index, index + 1)"
                class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="Déplacer vers la droite"
              >
                <ArrowRightIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Badge image principale -->
          <div
            v-if="isPrimaryImage(index)"
            class="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium"
          >
            Principale
          </div>

          <!-- Indicateur de position -->
          <div class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {{ index + 1 }}
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <PhotoIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune image</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Commencez par ajouter des images à votre produit
      </p>
    </div>

    <!-- Statistiques et informations -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-6">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Informations sur les images
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
        <div>
          <span class="font-medium">Total :</span> {{ localImages.length }} image(s)
        </div>
        <div>
          <span class="font-medium">Image principale :</span>
          <span v-if="primaryImageIndex !== null" class="text-green-600 font-medium">Image {{ primaryImageIndex + 1 }}</span>
          <span v-else class="text-orange-500">Non définie</span>
        </div>
        <div>
          <span class="font-medium">Modifications :</span>
          <span :class="hasImageChanges ? 'text-green-500 font-medium' : 'text-gray-500'">
            {{ hasImageChanges ? 'Oui' : 'Aucune' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions de sauvegarde -->
    <div v-if="hasImageChanges" class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="resetImages"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
      >
        Annuler les modifications
      </button>
      <button
        @click="saveImages"
        :disabled="isSaving"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span v-if="isSaving" class="flex items-center">
          <SpinnerIcon class="w-4 h-4 mr-2 animate-spin" />
          Sauvegarde...
        </span>
        <span v-else>💾 Sauvegarder les images</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  StarIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PhotoIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline'
import { ArrowPathIcon as SpinnerIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  productId: {
    type: [String, Number],
    required: true
  },
  existingImages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'images-updated', 'primary-changed'])

const localImages = ref([...props.modelValue])
const primaryImageIndex = ref(0)
const isSaving = ref(false)
const originalImages = ref([...props.existingImages])
const fileInput = ref(null)

// CORRECTION: Déterminer l'index de l'image principale au chargement
const findPrimaryImageIndex = () => {
  const primaryIndex = localImages.value.findIndex(img => img.is_thumbnail)
  return primaryIndex !== -1 ? primaryIndex : 0
}

primaryImageIndex.value = findPrimaryImageIndex()

// Computed
const hasImageChanges = computed(() => {
  return JSON.stringify(localImages.value) !== JSON.stringify(originalImages.value)
})

const isPrimaryImage = (index) => {
  return index === primaryImageIndex.value
}

// Méthodes
const getImageUrl = (image) => {
  if (!image) return ''

  let imageUrl = ''
  if (typeof image === 'string') {
    imageUrl = image
  } else if (image.url) {
    imageUrl = image.url
  } else if (image instanceof File) {
    return URL.createObjectURL(image)
  }

  // CORRECTION: Construction correcte de l'URL
  if (imageUrl.startsWith('http')) {
    return imageUrl
  } else if (imageUrl.startsWith('/storage/')) {
    return "https://api.bylin-style.com" + imageUrl // Ajustez selon votre environnement
  } else {
    return imageUrl
  }
}

const handleImageError = (event) => {
  console.error('Erreur de chargement image:', event)
  event.target.src = '/images/placeholder-product.jpg' // Image de remplacement
}

const getImageKey = (image, index) => {
  if (typeof image === 'string') return image
  if (image instanceof File) return image.name + index
  if (image.id) return image.id
  return `image-${index}`
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    const newImages = files.map(file => ({
      file: file,
      url: URL.createObjectURL(file),
      is_thumbnail: localImages.value.length === 0 // Première image devient miniature si pas d'images
    }))

    localImages.value.push(...newImages)
    emit('update:modelValue', localImages.value)
    // Réinitialiser l'input file
    event.target.value = ''
  }
}

const setAsPrimary = (index) => {
  // CORRECTION: Mettre à jour le statut is_thumbnail
  localImages.value.forEach((img, i) => {
    img.is_thumbnail = i === index
  })
  primaryImageIndex.value = index
  emit('primary-changed', index)
  emit('update:modelValue', localImages.value)
}

const removeImage = (index) => {
  localImages.value.splice(index, 1)
  if (primaryImageIndex.value === index) {
    primaryImageIndex.value = 0
    if (localImages.value.length > 0) {
      localImages.value[0].is_thumbnail = true
    }
  } else if (primaryImageIndex.value > index) {
    primaryImageIndex.value--
  }
  emit('update:modelValue', localImages.value)
}

const moveImage = (fromIndex, toIndex) => {
  const imageToMove = localImages.value[fromIndex]
  localImages.value.splice(fromIndex, 1)
  localImages.value.splice(toIndex, 0, imageToMove)

  // Ajuster l'index de l'image principale si nécessaire
  if (primaryImageIndex.value === fromIndex) {
    primaryImageIndex.value = toIndex
  } else if (primaryImageIndex.value === toIndex) {
    primaryImageIndex.value = fromIndex
  }

  emit('update:modelValue', localImages.value)
}

const resetImages = () => {
  localImages.value = [...originalImages.value]
  primaryImageIndex.value = findPrimaryImageIndex()
  emit('update:modelValue', localImages.value)
}

const saveImages = async () => {
  try {
    isSaving.value = true

    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mettre à jour les images originales
    originalImages.value = [...localImages.value]

    emit('images-updated', localImages.value)

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des images:', error)
  } finally {
    isSaving.value = false
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  localImages.value = [...newValue]
  primaryImageIndex.value = findPrimaryImageIndex()
})

watch(localImages, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })
</script>

<style scoped>
.image-editor {
  max-width: 100%;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
