<template>
  <div>
    <!-- Aperçu des images -->
    <div class="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <div v-for="(image, index) in modelValue" :key="index" class="relative group">
        <img
          :src="getImageUrl(image)"
          class="object-contain w-full h-32 rounded-lg"
          alt="Image preview"
        >
        <button
          type="button"
          @click="removeImage(index)"
          class="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="flex justify-center mt-1 space-x-1">
          <button
            type="button"
            @click="moveImage(index, 'up')"
            :disabled="index === 0"
            class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            @click="moveImage(index, 'down')"
            :disabled="index === modelValue.length - 1"
            class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Zone de dépôt -->
      <div
        class="flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="handleDrop"
        :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': dragOver }"
        @click="openFilePicker"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Glissez-déposez ou cliquez
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500">
          PNG, JPG (max. 2MB)
        </p>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="image/*"
          multiple
          @change="handleFileSelect"
        >
      </div>
    </div>

    <!-- Message d'erreur -->
    <p v-if="errorMessage" class="mt-2 text-sm text-red-600 dark:text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  maxSize: {
    type: Number, // en Mo
    default: 2
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const dragOver = ref(false)
const errorMessage = ref('')

const getImageUrl = (image) => {
  return image instanceof File ? URL.createObjectURL(image) : image
}

const openFilePicker = () => {
  fileInput.value.click()
}

const handleFileSelect = (e) => {
  processFiles(e.target.files)
  e.target.value = '' // Reset pour permettre la sélection des mêmes fichiers
}

const handleDrop = (e) => {
  dragOver.value = false
  processFiles(e.dataTransfer.files)
}

const processFiles = (files) => {
  errorMessage.value = ''

  // Vérifier le nombre de fichiers
  if (props.modelValue.length + files.length > props.maxFiles) {
    errorMessage.value = `Vous ne pouvez pas ajouter plus de ${props.maxFiles} images`
    return
  }

  const newImages = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'Seules les images sont autorisées'
      continue
    }

    // Vérifier la taille
    if (file.size > props.maxSize * 1024 * 1024) {
      errorMessage.value = `Les images ne doivent pas dépasser ${props.maxSize}MB`
      continue
    }

    newImages.push(file)
  }

  if (newImages.length > 0) {
    emit('update:modelValue', [...props.modelValue, ...newImages])
  }
}

const removeImage = (index) => {
  const newImages = [...props.modelValue]
  newImages.splice(index, 1)
  emit('update:modelValue', newImages)
}

const moveImage = (index, direction) => {
  const newImages = [...props.modelValue]

  if (direction === 'up' && index > 0) {
    [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]
  } else if (direction === 'down' && index < newImages.length - 1) {
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
  }

  emit('update:modelValue', newImages)
}
</script>
